import {
  getAboutContent,
  updateAboutContent,
} from "./about.repository";

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
  const updated = await updateAboutContent({
    textHtml: input.textHtml,
    imageUrl: input.imageUrl || null,
    imageAlt: input.imageAlt || null,
  });

  return {
    textHtml: updated.text_html ?? "",
    imageUrl: updated.image_url ?? "",
    imageAlt: updated.image_alt ?? "",
  };
}