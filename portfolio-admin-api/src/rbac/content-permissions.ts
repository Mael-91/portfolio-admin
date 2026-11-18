import type { PermissionCode } from "./permission-catalog";

type ImageChanges = {
  caption?: string;
  altText?: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
};

export function imagePermissions(body: ImageChanges, creating: boolean): PermissionCode[] {
  const required: PermissionCode[] = [];
  if (creating) required.push("images.add");
  else if (body.caption !== undefined || body.altText !== undefined || body.description !== undefined) {
    required.push("images.update");
  }
  if (creating ? body.isActive === true : body.isActive !== undefined) required.push("images.publish");
  if (body.displayOrder !== undefined) required.push("images.reorder");
  return required;
}

type ServiceChanges = {
  introHtml?: unknown;
  introEnabled?: boolean;
  sectionEnabled?: boolean;
  cards?: {
    title?: string;
    bodyHtml?: unknown;
    priceLabel?: unknown;
    bullets?: string[];
    bodyEnabled?: boolean;
    priceEnabled?: boolean;
    bulletsEnabled?: boolean;
  }[];
};

export function servicePermissions(body: ServiceChanges): PermissionCode[] {
  const cards = body.cards ?? [];
  const required: PermissionCode[] = [];
  if (body.introHtml !== undefined || cards.some(({ title, bodyHtml, priceLabel, bullets }) =>
    title !== undefined || bodyHtml !== undefined || priceLabel !== undefined || bullets !== undefined
  )) required.push("services.write");
  if (body.introEnabled !== undefined || body.sectionEnabled !== undefined ||
      cards.some(({ bodyEnabled, priceEnabled, bulletsEnabled }) =>
        bodyEnabled !== undefined || priceEnabled !== undefined || bulletsEnabled !== undefined
      )) required.push("services.visibility");
  return required;
}
