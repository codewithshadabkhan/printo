import type { Product } from "./data";
export type Config = {
  quantity: number;
  stock: string;
  corners: string;
  delivery: string;
  size?: string;
  material?: string;
  finish?: string;
  colour?: string;
  orientation?: string;
  sides?: string;
};
export type OptionKey = keyof Config;
export type OptionRule = {
  key: OptionKey;
  label: string;
  values: (string | number)[];
  defaultValue: string | number;
  dependsOn: OptionKey[];
  effect: string;
};
export const isApparel = (p: Product) =>
  ["polos", "shirts", "tees", "winter"].includes(p.category);
export function optionRules(p: Product, c?: Config): OptionRule[] {
  const card = p.category === "cards";
  const apparel = isApparel(p);
  const rule = (
    key: OptionKey,
    label: string,
    values: (string | number)[],
    defaultValue: string | number,
    dependsOn: OptionKey[] = [],
    effect = "Updates the sample configuration",
  ): OptionRule => ({ key, label, values, defaultValue, dependsOn, effect });
  return [
    rule(
      "quantity",
      "Quantity",
      [1, 2, 5, 10].map((n) => n * p.quantity),
      p.quantity,
      ["delivery"],
      "Uses the local quantity price table",
    ),
    rule(
      "delivery",
      "Delivery speed",
      ["Standard", "Same Day"],
      "Standard",
      ["stock", "quantity"],
      "Same Day is limited to standard stock and up to five base packs",
    ),
    rule(
      "corners",
      "Corners",
      card ? ["Standard", "Rounded"] : ["Standard"],
      "Standard",
      [],
      "Rounded adds ₹50 per set",
    ),
    rule(
      "stock",
      "Paper stock",
      card
        ? [
            "Standard Matte",
            "Standard Glossy",
            "Premium Matte",
            "Premium Glossy",
          ]
        : ["Standard Matte"],
      "Standard Matte",
      ["delivery"],
      "Premium stocks require Standard delivery",
    ),
    rule(
      "size",
      "Size",
      card
        ? ["89 × 51 mm", "85 × 45 mm"]
        : apparel
          ? ["S", "M", "L", "XL"]
          : ["Standard"],
      apparel ? "M" : card ? "89 × 51 mm" : "Standard",
    ),
    rule(
      "material",
      "Material",
      card ? ["Paper"] : apparel ? ["Cotton", "Polyester"] : ["Standard"],
      card ? "Paper" : apparel ? "Cotton" : "Standard",
    ),
    rule(
      "finish",
      "Finish",
      card ? ["None", "Spot UV"] : ["None"],
      "None",
      ["stock"],
      "Spot UV requires Premium Glossy and Standard delivery",
    ),
    rule(
      "colour",
      "Colour",
      apparel ? ["Black", "White", "Navy"] : ["Full colour"],
      apparel ? "Black" : "Full colour",
    ),
    rule(
      "orientation",
      "Orientation",
      card ? ["Horizontal", "Vertical"] : ["Horizontal"],
      "Horizontal",
    ),
    rule(
      "sides",
      "Printing sides",
      c?.material === "Polyester" ||
        (!card && !apparel && p.category !== "marketing")
        ? ["Front only"]
        : ["Front only", "Front & back"],
      "Front only",
      ["material"],
      "Polyester permits Front only; back printing adds ₹40 per set",
    ),
  ];
}
export function defaultConfig(p: Product): Config {
  return Object.fromEntries(
    optionRules(p).map((r) => [r.key, r.defaultValue]),
  ) as Config;
}
export function validateConfig(p: Product, c: Config): string[] {
  if (
    !c ||
    !Number.isInteger(c.quantity) ||
    typeof c.stock !== "string" ||
    typeof c.corners !== "string" ||
    typeof c.delivery !== "string"
  )
    return ["Required product configuration is invalid."];
  const errors = optionRules(p, c)
    .filter(
      (r) =>
        c[r.key] === null || !r.values.includes(c[r.key] ?? r.defaultValue),
    )
    .map((r) => `${r.label}: choose an allowed value.`);
  if (
    c.delivery === "Same Day" &&
    (c.stock.startsWith("Premium") ||
      c.quantity > p.quantity * 5 ||
      c.finish === "Spot UV")
  )
    errors.push(
      "Same Day requires standard stock, no Spot UV and at most five base packs.",
    );
  if (c.finish === "Spot UV" && c.stock !== "Premium Glossy")
    errors.push("Spot UV requires Premium Glossy stock.");
  if (c.material === "Polyester" && c.sides === "Front & back")
    errors.push("Polyester supports front printing only.");
  return errors;
}
export function normalizeConfig(
  p: Product,
  input: Partial<Config> = {},
): Config {
  const defaults = defaultConfig(p);
  const c = { ...defaults };
  for (const rule of optionRules(p))
    if (input[rule.key] !== undefined)
      Object.assign(c, { [rule.key]: input[rule.key] });
  for (const r of optionRules(p, c))
    if (!r.values.includes(c[r.key] as string | number))
      Object.assign(c, { [r.key]: r.defaultValue });
  if (c.finish === "Spot UV") {
    c.stock = "Premium Glossy";
    c.delivery = "Standard";
  }
  if (c.stock.startsWith("Premium") || c.quantity > p.quantity * 5)
    c.delivery = "Standard";
  if (c.material === "Polyester") c.sides = "Front only";
  return c;
}
export function changeConfig(
  p: Product,
  current: Config,
  key: OptionKey,
  value: string | number,
) {
  if (
    !optionRules(p, current)
      .find((r) => r.key === key)
      ?.values.includes(value)
  )
    throw new Error("That option is unavailable.");
  const next = { ...current, [key]: value };
  if (key === "delivery" && value === "Same Day") {
    next.stock = "Standard Matte";
    next.finish = "None";
    if (next.quantity > p.quantity * 5) next.quantity = p.quantity * 5;
  }
  if (key === "stock" && value !== "Premium Glossy") next.finish = "None";
  return normalizeConfig(p, next);
}
export const configKey = (c: Config) =>
  JSON.stringify(Object.entries(c).sort(([a], [b]) => a.localeCompare(b)));
export function configFromParams(p: Product, params: URLSearchParams): Config {
  const input: Record<string, string | number> = {};
  for (const rule of optionRules(p)) {
    const value = params.get(rule.key);
    if (value !== null)
      input[rule.key] = rule.key === "quantity" ? Number(value) : value;
  }
  return normalizeConfig(p, input);
}
export function configParams(c: Config) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(c)) params.set(key, String(value));
  return params.toString();
}
