import { products, type Product, type Template } from "./data";
import {
  normalizeConfig,
  configKey,
  validateConfig,
  type Config,
} from "./configuration";
import { quoteProduct, couponDiscount, moneyPaise } from "./pricing";
import { validateDesign, type DesignDocument } from "./design";
export { defaultConfig } from "./configuration";
export type { Config } from "./configuration";
export type CartItem = {
  key: string;
  productId: string;
  config: Config;
  bundles: number;
  design?: string;
  document?: DesignDocument;
};
export const money = (value: number) => moneyPaise(Math.round(value * 100));
export const priceFor = (p: Product, c: Config) =>
  quoteProduct(p, c).totalPaise / 100;
function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, v]) => [key, canonicalValue(v)]),
    );
  return value;
}
export function makeCartItem(
  productId: string,
  input: Config,
  design?: string,
  document?: DesignDocument,
): CartItem {
  const p = products.find((p) => p.id === productId);
  if (!p) throw Error("Product unavailable");
  const errors = validateConfig(p, input);
  if (errors.length) throw Error(errors.join(" "));
  const config = normalizeConfig(p, input);
  if (
    document &&
    (!validateDesign(document) || document.productId !== productId)
  )
    throw Error("Invalid design document");
  const identity = document
    ? JSON.stringify(
        canonicalValue({
          front: document.front,
          back: document.back,
          productId: document.productId,
        }),
      )
    : design || "";
  return {
    key: JSON.stringify([productId, configKey(config), identity]),
    productId,
    config,
    bundles: 1,
    ...(design ? { design } : {}),
    ...(document ? { document: structuredClone(document) } : {}),
  };
}
export function addCartItem(cart: CartItem[], item: CartItem) {
  const old = cart.find((x) => x.key === item.key);
  if (old && old.bundles + item.bundles > 99)
    throw Error("Maximum 99 sets per configuration.");
  if (!old && cart.length >= 30)
    throw Error("Maximum 30 configurations per cart.");
  return old
    ? cart.map((x) =>
        x.key === item.key ? { ...x, bundles: x.bundles + item.bundles } : x,
      )
    : [...cart, item];
}
export function editCartItem(cart: CartItem[], key: string, input: Config) {
  const old = cart.find((x) => x.key === key);
  if (!old) throw Error("Cart item no longer exists");
  const next = makeCartItem(old.productId, input, old.design, old.document);
  next.bundles = old.bundles;
  return addCartItem(
    cart.filter((x) => x.key !== key),
    next,
  );
}
export function parseCart(
  raw: string | null,
  productIds: string[],
): CartItem[] {
  try {
    const data: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(data)) return [];
    const items: CartItem[] = [];
    for (const value of data) {
      try {
        if (!value || typeof value !== "object") continue;
        const x = value as CartItem;
        const p = products.find((p) => p.id === x.productId);
        if (
          !p ||
          !productIds.includes(p.id) ||
          !Number.isInteger(x.bundles) ||
          x.bundles < 1 ||
          x.bundles > 99 ||
          !x.config ||
          validateConfig(p, x.config).length ||
          (x.design !== undefined && typeof x.design !== "string")
        )
          continue;
        // The persisted key and any saved price are never trusted.
        const canonical = makeCartItem(p.id, x.config, x.design, x.document);
        canonical.bundles = x.bundles;
        const merged = addCartItem(items, canonical);
        items.splice(0, items.length, ...merged);
      } catch {
        /* Invalid, unavailable or excess lines are discarded at the storage boundary. */
      }
    }
    return items;
  } catch {
    return [];
  }
}
export function cartTotals(
  cart: CartItem[],
  coupon = "",
  shippingPaise = 0,
  now = Date.now(),
) {
  if (!Number.isSafeInteger(shippingPaise) || shippingPaise < 0)
    throw Error("Invalid delivery charge");
  const lines = cart.map((item) => {
    const p = products.find((p) => p.id === item.productId);
    if (!p) throw Error("Product unavailable");
    if (
      !Number.isInteger(item.bundles) ||
      item.bundles < 1 ||
      item.bundles > 99
    )
      throw Error("Invalid number of sets");
    const quote = quoteProduct(p, item.config);
    return {
      key: item.key,
      category: p.category,
      merchandisePaise: quote.merchandisePaise * item.bundles,
      deliveryPaise: quote.deliveryPaise * item.bundles,
    };
  });
  const subtotalPaise = lines.reduce((n, l) => n + l.merchandisePaise, 0);
  const deliveryPaise =
    shippingPaise + lines.reduce((n, l) => n + l.deliveryPaise, 0);
  const discount = couponDiscount(coupon, lines, now);
  return {
    subtotalPaise,
    deliveryPaise,
    discountPaise: discount.discountPaise,
    couponError: discount.error,
    coupon: discount.code,
    totalPaise: subtotalPaise + deliveryPaise - discount.discountPaise,
    taxIncluded: true,
  };
}
export const cartFingerprint = (cart: CartItem[]) =>
  JSON.stringify(
    cart
      .map((i) => [i.key, i.bundles])
      .sort(([a], [b]) => String(a).localeCompare(String(b))),
  );
export function parseSaved(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw || "[]");
    return Array.isArray(value)
      ? [...new Set(value.filter((x): x is string => typeof x === "string"))]
      : [];
  } catch {
    return [];
  }
}
export const searchProducts = (items: Product[], query: string) => {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return items.filter((p) =>
    words.every((word) =>
      `${p.name} ${p.category}`.toLowerCase().includes(word),
    ),
  );
};
export function filterTemplates(
  items: Template[],
  query: string,
  filters: Record<string, string[]>,
) {
  const search = query.toLowerCase().trim();
  return items.filter(
    (t) =>
      (!search ||
        `${t.name} ${t.theme} ${t.industry} ${t.colour}`
          .toLowerCase()
          .includes(search)) &&
      Object.entries(filters).every(
        ([key, values]) =>
          !values.length || values.includes(t[key as keyof Template]),
      ),
  );
}
