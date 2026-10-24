export type DesignFace = {
  name: string;
  tagline: string;
  colour: string;
  align: "left" | "center" | "right";
  font: "Arial" | "Georgia" | "Verdana";
  image?: {
    dataUrl: string;
    width: number;
    height: number;
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
};
export type DesignDocument = {
  schema: 1;
  id: string;
  productId: string;
  templateId: string;
  front: DesignFace;
  back: DesignFace;
  updatedAt: number;
};
export const UPLOAD_LIMIT = 512 * 1024;
export const createDesign = (
  productId: string,
  templateId = "design-1",
): DesignDocument => ({
  schema: 1,
  id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  productId,
  templateId,
  front: {
    name: "Mira Studio",
    tagline: "A good introduction.",
    colour: "#244b40",
    align: "center",
    font: "Arial",
  },
  back: {
    name: "Your name",
    tagline: "hello@example.com",
    colour: "#244b40",
    align: "center",
    font: "Arial",
  },
  updatedAt: Date.now(),
});
export function validateDesign(value: unknown): value is DesignDocument {
  if (!value || typeof value !== "object") return false;
  const d = value as DesignDocument;
  if (
    d.schema !== 1 ||
    typeof d.id !== "string" ||
    typeof d.productId !== "string" ||
    typeof d.templateId !== "string" ||
    !Number.isFinite(d.updatedAt)
  )
    return false;
  for (const face of [d.front, d.back]) {
    if (
      !face ||
      typeof face.name !== "string" ||
      face.name.length > 40 ||
      typeof face.tagline !== "string" ||
      face.tagline.length > 80 ||
      !/^#[a-f\d]{6}$/i.test(face.colour) ||
      !["left", "center", "right"].includes(face.align) ||
      !["Arial", "Georgia", "Verdana"].includes(face.font)
    )
      return false;
    if (face.image) {
      const i = face.image;
      if (
        typeof i.dataUrl !== "string" ||
        i.dataUrl.length > UPLOAD_LIMIT * 1.4 + 100 ||
        !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(
          i.dataUrl,
        ) ||
        ![i.width, i.height].every(
          (n) => Number.isInteger(n) && n > 0 && n <= 12000,
        ) ||
        !Number.isFinite(i.x) ||
        Math.abs(i.x) > 50 ||
        !Number.isFinite(i.y) ||
        Math.abs(i.y) > 50 ||
        !Number.isFinite(i.scale) ||
        i.scale < 0.5 ||
        i.scale > 3 ||
        ![0, 90, 180, 270].includes(i.rotation)
      )
        return false;
    }
  }
  return true;
}
export function uploadError(
  file: { type: string; size: number },
  bytes?: Uint8Array,
) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    return "Use a PNG, JPEG or WebP image. SVG and PDF are not supported.";
  if (file.size <= 0 || file.size > UPLOAD_LIMIT)
    return "Choose a non-empty image up to 512 KiB.";
  if (bytes) {
    const png =
      bytes[0] === 137 &&
      bytes[1] === 80 &&
      bytes[2] === 78 &&
      bytes[3] === 71 &&
      bytes[4] === 13 &&
      bytes[5] === 10 &&
      bytes[6] === 26 &&
      bytes[7] === 10;
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp =
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
    if (
      !(file.type === "image/png"
        ? png
        : file.type === "image/jpeg"
          ? jpeg
          : webp)
    )
      return "The file contents do not match the image format.";
  }
  return "";
}
export type DesignHistory = {
  past: DesignDocument[];
  present: DesignDocument;
  future: DesignDocument[];
};
export const changeDesign = (
  h: DesignHistory,
  next: DesignDocument,
): DesignHistory => {
  if (!validateDesign(next)) throw Error("Invalid design change");
  return {
    past: [...h.past, h.present].slice(-20),
    present: { ...next, updatedAt: Date.now() },
    future: [],
  };
};
export const undoDesign = (h: DesignHistory): DesignHistory =>
  h.past.length
    ? {
        past: h.past.slice(0, -1),
        present: h.past[h.past.length - 1],
        future: [h.present, ...h.future],
      }
    : h;
export const redoDesign = (h: DesignHistory): DesignHistory =>
  h.future.length
    ? {
        past: [...h.past, h.present].slice(-20),
        present: h.future[0],
        future: h.future.slice(1),
      }
    : h;
export function resolutionWarning(face: DesignFace) {
  return face.image &&
    (face.image.width < 1052 * face.image.scale ||
      face.image.height < 638 * face.image.scale)
    ? "Low-resolution warning: this image may look soft at the suggested card size. Preview is not a validated print file."
    : "";
}
