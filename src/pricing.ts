import type { Product } from "./data";
import { normalizeConfig, validateConfig, type Config } from "./configuration";
export const PRICE_VERSION = "local-table-2";
// These basis points and surcharges are local policy, not a reverse-engineered formula.
export const tiers = [
  { multiplier: 1, discountBps: 0 },
  { multiplier: 2, discountBps: 0 },
  { multiplier: 5, discountBps: 1000 },
  { multiplier: 10, discountBps: 2000 },
];
export const roundRatio = (
  amount: number,
  numerator: number,
  denominator: number,
) => {
  if (
    !Number.isSafeInteger(amount) ||
    !Number.isSafeInteger(numerator) ||
    !Number.isSafeInteger(denominator) ||
    denominator <= 0
  )
    throw Error("Invalid monetary calculation");
  return Number(
    (BigInt(amount) * BigInt(numerator) + BigInt(Math.floor(denominator / 2))) /
      BigInt(denominator),
  );
};
export const moneyPaise = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: paise % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(paise / 100);
export function priceTable(p: Product) {
  return tiers.map((t) => ({
    quantity: p.quantity * t.multiplier,
    basePaise: roundRatio(
      p.price * 100 * t.multiplier,
      10000 - t.discountBps,
      10000,
    ),
  }));
}
export function quoteProduct(p: Product, input: Config) {
  const c = normalizeConfig(p, input);
  const errors = validateConfig(p, input);
  if (errors.length) throw Error(errors.join(" "));
  const tier = priceTable(p).find((t) => t.quantity === c.quantity);
  if (!tier) throw Error("Unsupported quantity");
  const factor =
    c.stock === "Premium Matte"
      ? 14000
      : c.stock === "Premium Glossy"
        ? 13000
        : 10000;
  const merchandisePaise =
    roundRatio(tier.basePaise, factor, 10000) +
    (c.corners === "Rounded" ? 5000 : 0) +
    (c.finish === "Spot UV" ? 8000 : 0) +
    (c.sides === "Front & back" ? 4000 : 0);
  const deliveryPaise = c.delivery === "Same Day" ? 9900 : 0;
  return {
    version: PRICE_VERSION,
    merchandisePaise,
    deliveryPaise,
    totalPaise: merchandisePaise + deliveryPaise,
    unitPaise: roundRatio(merchandisePaise + deliveryPaise, 1, c.quantity),
    taxIncluded: true,
    config: c,
  };
}
export type Coupon = {
  code: string;
  minimumPaise: number;
  percentBps: number;
  maximumPaise: number;
  expiresAt: string;
  categories?: string[];
};
export const coupons: Coupon[] = [
  {
    code: "LOCAL10",
    minimumPaise: 50000,
    percentBps: 1000,
    maximumPaise: 30000,
    expiresAt: "2099-12-31T23:59:59Z",
  },
  {
    code: "CARDS15",
    minimumPaise: 100000,
    percentBps: 1500,
    maximumPaise: 50000,
    expiresAt: "2099-12-31T23:59:59Z",
    categories: ["cards"],
  },
  {
    code: "EXPIRED",
    minimumPaise: 0,
    percentBps: 1000,
    maximumPaise: 30000,
    expiresAt: "2020-01-01T00:00:00Z",
  },
];
export function couponDiscount(
  code: string,
  lines: { category: string; merchandisePaise: number }[],
  now = Date.now(),
) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { code: "", discountPaise: 0, error: "" };
  const coupon = coupons.find((c) => c.code === normalized);
  if (!coupon)
    return {
      code: normalized,
      discountPaise: 0,
      error: "Coupon not found. Try LOCAL10.",
    };
  if (Date.parse(coupon.expiresAt) <= now)
    return {
      code: normalized,
      discountPaise: 0,
      error: "This coupon has expired.",
    };
  const eligible = lines
    .filter((l) => !coupon.categories || coupon.categories.includes(l.category))
    .reduce((n, l) => n + l.merchandisePaise, 0);
  if (eligible < coupon.minimumPaise)
    return {
      code: normalized,
      discountPaise: 0,
      error: `This coupon requires ${moneyPaise(coupon.minimumPaise)} of eligible merchandise.`,
    };
  return {
    code: normalized,
    discountPaise: Math.min(
      eligible,
      coupon.maximumPaise,
      roundRatio(eligible, coupon.percentBps, 10000),
    ),
    error: "",
  };
}
