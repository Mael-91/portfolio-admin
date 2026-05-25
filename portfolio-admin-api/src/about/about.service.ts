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
      instagramButtonLabel: "",
      instagramButtonUrl: "",
    };
  }

  return {
    textHtml: content.text_html ?? "",
    imageUrl: content.image_url ?? "",
    imageAlt: content.image_alt ?? "",
    instagramButtonLabel: content.instagram_button_label ?? "",
    instagramButtonUrl: content.instagram_button_url ?? "",
  };
}

export async function saveAboutContent(input: {
  textHtml: string;
  imageUrl: string;
  imageAlt: string;
  instagramButtonLabel: string;
  instagramButtonUrl: string;
}) {
  const current = await getAboutContent();

  const previousImageUrl = current?.image_url ?? "";
  const nextImageUrl = input.imageUrl || "";

  const updated = await updateAboutContent({
    textHtml: input.textHtml,
    imageUrl: nextImageUrl || null,
    imageAlt: input.imageAlt || null,
    instagramButtonLabel: input.instagramButtonLabel || null,
    instagramButtonUrl: input.instagramButtonUrl || null, 
  });

  if (previousImageUrl && previousImageUrl !== nextImageUrl) {
    await deleteAboutImageIfExists(previousImageUrl);
  }

  return {
    textHtml: updated.text_html ?? "",
    imageUrl: updated.image_url ?? "",
    imageAlt: updated.image_alt ?? "",
    instagramButtonLabel: updated.instagram_button_label ?? "",
    instagramButtonUrl: updated.instagram_button_url ?? "",
  };
}