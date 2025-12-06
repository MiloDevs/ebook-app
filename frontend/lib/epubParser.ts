// @/lib/epubParser.ts
import { BookMetadata } from "@/types/books";
import * as FileSystem from "expo-file-system";
import JSZip from "jszip";
import { unzip } from "react-native-zip-archive";
import { cacheMetadataAndCover, getCachedMetadata } from "./bookMetadataCache";

export interface ParsedBookMetadata {
  title: string;
  author: string;
  tableOfContents: { label: string; href: string }[];
  imageUrl: string | null;
  fileUrl: string;
  fileSize: number;
  lastModified: number;
}

const getZipFileKeys = (zipOrDir: any): string[] => {
  if (zipOrDir && typeof zipOrDir.files === "object") {
    return Object.keys(zipOrDir.files);
  }
  return [];
};

const readKeyFilesFromDisk = async (
  unzippedPath: string,
  opfPath: string,
  opfDir: string,
) => {
  // @ts-ignore
  const opfFile = new FileSystem.File(`${unzippedPath}${opfPath}`);
  const opfContent = await opfFile.text();

  const ncxMatch = opfContent.match(
    /<item[^>]*media-type=["']application\/x-dtbncx\+xml["'][^>]*href=["']([^"']+)["']/i,
  );
  let ncxContent = null;
  if (ncxMatch) {
    const ncxPath = opfDir + ncxMatch[1];
    // @ts-ignore
    const ncxFile = new FileSystem.File(`${unzippedPath}${ncxPath}`);
    ncxContent = await ncxFile.text();
  }

  return { opfContent, ncxContent, opfDir };
};

const findCoverPath = async (
  opfContent: string,
  opfDir: string,
  zipOrDir: any,
  isLargeFile: boolean,
): Promise<string | null> => {
  let coverPath = null;
  let coverId = null;

  const coverIdMatch = opfContent.match(
    /<meta\s+name=["']cover["']\s+content=["']([^"']+)["']/i,
  );
  if (coverIdMatch) {
    coverId = coverIdMatch[1];
  }

  if (coverId) {
    const manifestItemRegex = new RegExp(
      `<item[^>]*id=["']${coverId}["'][^>]*href=["']([^"']+)["'][^>]*>`,
      "i",
    );

    const coverHrefMatch = opfContent.match(manifestItemRegex);

    if (coverHrefMatch) {
      const imageHref = coverHrefMatch[1];

      if (opfDir !== "" && !imageHref.includes("/")) {
        coverPath = imageHref;
      } else if (imageHref.startsWith("/")) {
        coverPath = imageHref.substring(1);
      } else {
        coverPath = opfDir + imageHref;
      }
    }
  }

  if (!coverPath) {
    let directMatch = opfContent.match(
      /<item[^>]*properties=["'][^"']*cover-image[^"']*["'][^>]*href=["']([^"']+)["']/i,
    );

    if (!directMatch) {
      directMatch = opfContent.match(
        /<item[^>]*id=["']cover["'][^>]*href=["']([^"']+)["']/i,
      );
    }

    if (directMatch) {
      const imageHref = directMatch[1];
      if (imageHref.startsWith("/")) {
        coverPath = imageHref.substring(1);
      } else {
        coverPath = opfDir + imageHref;
      }
    }
  }

  if (!coverPath) {
    const customImageMatch = opfContent.match(
      /<image[^>]*xlink:href=["']([^"']+)["']/i,
    );
    if (customImageMatch) {
      coverPath = opfDir + customImageMatch[1];
    }
  }

  if (!coverPath) {
    const guideRefMatch = opfContent.match(
      /<reference\s+type=["']cover["'][^>]*href=["']([^"']+)["']/i,
    );
    if (guideRefMatch) {
      let htmlPath = opfDir + guideRefMatch[1];
      let coverHtmlContent = null;

      try {
        if (isLargeFile) {
          // @ts-ignore
          coverHtmlContent = await new FileSystem.File(
            `${zipOrDir}${htmlPath}`,
          ).text();
        } else {
          coverHtmlContent = await zipOrDir.file(htmlPath)?.async("string");
        }
      } catch (e: any) {
        return null;
      }

      if (coverHtmlContent) {
        const imageMatch = coverHtmlContent.match(
          /(?:<img[^>]*src=["']([^"']+)["']|<image[^>]*xlink:href=["']([^"']+)["'])/i,
        );

        if (imageMatch) {
          const imageRelativePath = imageMatch[1] || imageMatch[2];

          if (imageRelativePath) {
            const htmlDir = htmlPath.substring(
              0,
              htmlPath.lastIndexOf("/") + 1,
            );
            coverPath = htmlDir + imageRelativePath;
          }
        }
      }
    }
  }

  if (!coverPath) {
    const coverItemMatch = opfContent.match(
      /<item[^>]*(?:id|href)=["'][^"']*cover[^"']*["'][^>]*href=["']([^"']+)["']/i,
    );
    if (coverItemMatch) {
      coverPath = opfDir + coverItemMatch[1];
    }
  }

  if (!coverPath && !isLargeFile) {
    const zipFileKeys = getZipFileKeys(zipOrDir);
    const COVER_PATTERNS = /(cover|front|title)[^/]*\.(jpg|jpeg|png|gif)$/i;

    for (const key of zipFileKeys) {
      if (key.match(COVER_PATTERNS)) {
        if (!key.toLowerCase().startsWith("meta-inf")) {
          coverPath = key;
          break;
        }
      }
    }
  }

  if (!coverPath) {
    const firstImageMatch = opfContent.match(
      /<item[^>]*media-type=["']image\/(jpeg|jpg|png|gif)["'][^>]*href=["']([^"']+)["']/i,
    );
    if (firstImageMatch) {
      coverPath = opfDir + firstImageMatch[2];
    }
  }

  return coverPath;
};

export const parseEpubMetadata = async (
  epubFilePath: string,
): Promise<ParsedBookMetadata> => {
  const localUri = epubFilePath.startsWith("file://")
    ? epubFilePath
    : `file://${epubFilePath}`;

  let tempDir: string | null = null;
  let zip: JSZip | null = null;
  let opfContent: string | null = null;
  let ncxContent: string | null = null;
  let opfDir: string = "";
  let coverPath: string | null = null;

  try {
    // @ts-ignore
    const epubFile = new FileSystem.File(localUri);
    const fileInfo = await epubFile.info();
    if (!fileInfo.size || !fileInfo.exists) throw new Error("File not found.");

    const fileSizeMB = fileInfo.size / 1024 / 1024;

    const LARGE_FILE_THRESHOLD_MB = 50;
    const isLargeFile = fileSizeMB > LARGE_FILE_THRESHOLD_MB;

    let zipOrDir: any;

    if (isLargeFile) {
      tempDir = `${FileSystem.Paths.cache.uri}epub_temp_${Date.now()}/`;
      new FileSystem.Directory(tempDir).create({ intermediates: true });

      await unzip(localUri, tempDir);
      zipOrDir = tempDir;

      // @ts-ignore
      const containerXml = await new FileSystem.File(
        `${tempDir}META-INF/container.xml`,
      ).text();

      const opfPathMatch = containerXml.match(/full-path="([^"]+)"/);
      if (!opfPathMatch) throw new Error("OPF path not found.");

      const opfPath = opfPathMatch[1];
      opfDir = opfPath.substring(0, opfPath.lastIndexOf("/") + 1);

      ({ opfContent, ncxContent, opfDir } = await readKeyFilesFromDisk(
        tempDir,
        opfPath,
        opfDir,
      ));
    } else {
      // @ts-ignore
      const base64Content = await new FileSystem.File(localUri).base64();

      zip = await JSZip.loadAsync(base64Content, {
        base64: true,
        checkCRC32: false,
      });
      zipOrDir = zip;

      const containerXml = await zip
        .file("META-INF/container.xml")
        ?.async("string");
      if (!containerXml) throw new Error("container.xml not found");

      const opfPathMatch = containerXml.match(/full-path="([^"]+)"/);
      if (!opfPathMatch) throw new Error("OPF path not found.");
      const opfPath = opfPathMatch[1];
      opfDir = opfPath.substring(0, opfPath.lastIndexOf("/") + 1);

      opfContent = await zip.file(opfPath)?.async("string");
      if (!opfContent) throw new Error("OPF file content not found.");

      const ncxMatch = opfContent.match(
        /<item[^>]*media-type=["']application\/x-dtbncx\+xml["'][^>]*href=["']([^"']+)["']/i,
      );
      if (ncxMatch) {
        ncxContent = await zip.file(opfDir + ncxMatch[1])?.async("string");
      }
    }

    if (!opfContent) throw new Error("OPF content is missing after loading.");

    coverPath = await findCoverPath(opfContent, opfDir, zipOrDir, isLargeFile);

    const title =
      opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/)?.[1]?.trim() ||
      "Unknown Title";
    const author =
      opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/)?.[1]?.trim() ||
      "Unknown Author";

    let tableOfContents: BookMetadata["tableOfContents"] = [];
    if (ncxContent) {
      const navPointMatches = ncxContent.matchAll(
        /<navLabel>[\s\S]*?<text>([^<]+)<\/text>[\s\S]*?<content\s+src=["']([^"']+)["']/gi,
      );
      tableOfContents = Array.from(navPointMatches).map((match) => ({
        label: match[1].trim(),
        href: match[2],
      }));
    }

    let imageUrl = null;
    if (coverPath) {
      let coverBase64: string | null = null;
      let mimeType: string = "image/jpeg";

      if (isLargeFile && tempDir) {
        const coverFileUri = `${tempDir}${coverPath}`;
        // @ts-ignore
        coverBase64 = await new FileSystem.File(coverFileUri).base64();
      } else if (zip) {
        coverBase64 = (await zip.file(coverPath)?.async("base64")) || null;
      }

      if (coverBase64) {
        if (coverBase64.length < 2 * 1024 * 1024 * 1.37) {
          mimeType = coverPath.match(/\.(png|gif|svg)$/i)
            ? `image/${RegExp.$1.toLowerCase()}`
            : "image/jpeg";
          imageUrl = `data:${mimeType};base64,${coverBase64}`;
        }
      }
    }

    return {
      title,
      author,
      tableOfContents,
      imageUrl: imageUrl,
      fileUrl: epubFilePath,
      fileSize: fileInfo.size,
      lastModified: fileInfo.modificationTime,
    };
  } catch (error) {
    console.error("Error parsing EPUB:", error);
    throw error;
  } finally {
    if (tempDir) {
      // @ts-ignore
      new FileSystem.Directory(tempDir).delete();
    }
    if (zip) {
      zip = null;
    }
  }
};

export async function getAndCacheEpubMetadata(
  epubFilePath: string,
): Promise<BookMetadata | null> {
  const cachedMetadata = await getCachedMetadata(epubFilePath);

  if (cachedMetadata) {
    return cachedMetadata;
  }

  let parsedMetadata: ParsedBookMetadata;
  try {
    parsedMetadata = await parseEpubMetadata(epubFilePath);
  } catch (error) {
    console.error(`Failed to parse EPUB: ${epubFilePath}`, error);
    return null;
  }

  const finalMetadata = await cacheMetadataAndCover(parsedMetadata);
  return finalMetadata;
}
