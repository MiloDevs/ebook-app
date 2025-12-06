import { Book } from "@/types/books";
import { ClassNameValue, twMerge } from "tailwind-merge";

export const cn = (...classes: ClassNameValue[]) => {
  return twMerge(classes);
};

export const mapToBook = (data: any): Book => {
  return {
    ...data,
    author: data.author.full_name,
    fileUrl: data.file_url,
    imageUrl: data.image_url,
  };
};
