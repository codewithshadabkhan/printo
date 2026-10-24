import { products } from "./data";
import { parseCart, cartFingerprint, type CartItem } from "./model";
import { validateDesign, type DesignDocument } from "./design";
export const CART_TTL = 7 * 24 * 60 * 60 * 1000;
export const CART_KEY = "printo-cart-v2";
export const safeRead = (key: string, store: Storage = localStorage) => {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
};
export const safeWrite = (
  key: string,
  data: unknown,
  store: Storage = localStorage,
) => {
  try {
    store.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};
export function loadCart(now = Date.now()) {
  const raw = safeRead(CART_KEY);
  try {
    if (raw) {
      const data = JSON.parse(raw);
      if (
        data.schema !== 2 ||
        !Array.isArray(data.items) ||
        !Number.isFinite(data.expiresAt)
      )
        return {
          items: [] as CartItem[],
          notice: "Invalid cart storage was reset.",
        };
      if (data.expiresAt <= now)
        return {
          items: [] as CartItem[],
          notice: "Your saved sample cart expired after seven days.",
        };
      const items = parseCart(
        JSON.stringify(data.items),
        products.map((p) => p.id),
      );
      return {
        items,
        notice:
          items.length !== data.items.length
            ? "Unavailable or invalid sample items were removed."
            : "",
      };
    }
    const legacy = safeRead("printo-cart-v1");
    const items = parseCart(
      legacy,
      products.map((p) => p.id),
    );
    if (legacy) {
      try {
        const old = JSON.parse(legacy);
        if (!Array.isArray(old) || old.length !== items.length)
          return {
            items,
            notice:
              "Invalid or unavailable legacy items were removed during migration.",
          };
      } catch {
        return { items, notice: "Invalid legacy cart storage was reset." };
      }
    }
    return { items, notice: "" };
  } catch {
    return {
      items: [] as CartItem[],
      notice: "Invalid cart storage was reset.",
    };
  }
}
export function saveCart(items: CartItem[], now = Date.now()) {
  let updatedAt = now;
  try {
    const old = JSON.parse(safeRead(CART_KEY) || "null");
    if (
      old?.expiresAt > now &&
      cartFingerprint(old.items) === cartFingerprint(items)
    )
      updatedAt = old.updatedAt;
  } catch {
    /* Replace malformed legacy state. */
  }
  const ok = safeWrite(CART_KEY, {
    schema: 2,
    updatedAt,
    expiresAt: updatedAt + CART_TTL,
    items,
  });
  if (ok)
    try {
      localStorage.removeItem("printo-cart-v1");
    } catch {
      /* Storage may be disabled. */
    }
  return ok;
}
export function loadDraft(productId: string) {
  try {
    const value: unknown = JSON.parse(
      safeRead(`printo-draft-${productId}`) || "null",
    );
    return validateDesign(value) && value.productId === productId
      ? value
      : null;
  } catch {
    return null;
  }
}
export function saveDraft(document: DesignDocument) {
  if (!validateDesign(document)) return false;
  return safeWrite(`printo-draft-${document.productId}`, document);
}
