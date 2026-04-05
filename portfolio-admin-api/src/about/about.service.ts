import {
  getAboutContent,
  updateAboutContent,
} from "./about.repository";
import { deleteAboutImageIfExists } from "./about.file";

export async function fetchAboutContent() {
  const content = await getAboutContent();

  if (!content) {
    return {
      textHtml: "",
      imageUrl: "",
      imageAlt: "",
    };
  }

  return {
    textHtml: content.text_html ?? "",
    imageUrl: content.image_url ?? "",
    imageAlt: content.image_alt ?? "",
  };
}

export async function saveAboutContent(input: {
  textHtml: string;
  imageUrl: string;
  imageAlt: string;
}) {
  const current = await getAboutContent();

  const previousImageUrl = current?.image_url ?? "";
  const nextImageUrl = input.imageUrl || "";

  const updated = await updateAboutContent({
    textHtml: input.textHtml,
    imageUrl: nextImageUrl || null,
    imageAlt: input.imageAlt || null,
  });

  if (previousImageUrl && previousImageUrl !== nextImageUrl) {
    await deleteAboutImageIfExists(previousImageUrl);
  }

  return {
    textHtml: updated.text_html ?? "",
    imageUrl: updated.image_url ?? "",
    imageAlt: updated.image_alt ?? "",
  };
}