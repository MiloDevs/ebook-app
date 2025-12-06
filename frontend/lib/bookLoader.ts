import { Directory, Paths } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import FileScannerModule from "@/modules/file-scanner/src/FileScannerModule";

function printDirectory(directory: Directory, indent: number = 0) {
  console.log(`${" ".repeat(indent)} + ${directory.name}`);
  const contents = directory.list();
  for (const item of contents) {
    if (item instanceof Directory) {
      printDirectory(item, indent + 2);
    } else {
      console.log(
        `${" ".repeat(indent + 2)} - ${item.name} (${item.size} bytes)`,
      );
    }
  }
}

export const pickEpubFiles = async () => {
  try {
    if (!FileScannerModule.hasAllFilesAccessPermission()) {
      const allResults =
        await FileScannerModule.requestAllFilesAccessPermission();
      console.log(allResults);
    }
    const epubPaths = await FileScannerModule.searchExternalStorage("epub");
    console.log("Found files:", epubPaths);
    return epubPaths;
  } catch (error) {
    console.error(error);
  }
};
