import { products, type Product } from "./data";
import { quoteProduct, type Coupon } from "./pricing";
import type { Config } from "./configuration";
import {
  cartTotals,
  cartFingerprint,
  parseCart,
  addCartItem,
  type CartItem,
} from "./model";
import { safeRead, safeWrite } from "./storage";
export class ServiceError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
type Operation = "quote" | "delivery" | "checkout";
const controls: { latency: number; failNext?: Operation } = { latency: 140 };
export const configureMock = (options: Partial<typeof controls>) =>
  Object.assign(controls, options);
async function wait(operation: Operation, signal?: AbortSignal) {
  await new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Cancelled", "AbortError"));
      return;
    }
    const id = setTimeout(() => {
      signal?.removeEventListener("abort", cancel);
      resolve();
    }, controls.latency);
    const cancel = () => {
      clearTimeout(id);
      reject(new DOMException("Cancelled", "AbortError"));
    };
    signal?.addEventListener("abort", cancel, { once: true });
  });
  if (controls.failNext === operation) {
    controls.failNext = undefined;
    throw new ServiceError(
      "NETWORK",
      "The local request failed. Please retry.",
    );
  }
}
export const quoteService = async (
  p: Product,
  c: Config,
  signal?: AbortSignal,
) => {
  await wait("quote", signal);
  return quoteProduct(p, c);
};
export type Address = {
  id: string;
  name: string;
  line1: string;
  city: string;
  state: string;
  pin: string;
  phone: string;
};
export const demoAddresses: Address[] = [
  {
    id: "demo-mumbai",
    name: "Demo Shopper",
    line1: "12 Example Street",
    city: "Mumbai",
    state: "Maharashtra",
    pin: "400001",
    phone: "9000000000",
  },
  {
    id: "demo-bengaluru",
    name: "Demo Shopper",
    line1: "42 Sample Road",
    city: "Bengaluru",
    state: "Karnataka",
    pin: "560001",
    phone: "9000000000",
  },
];
export function validateAddress(a: Address) {
  const errors: Record<string, string> = {};
  if (
    !a ||
    ["name", "line1", "city", "state", "pin", "phone"].some(
      (k) => typeof a[k as keyof Address] !== "string",
    )
  )
    return { address: "Address fields are invalid." };
  if (!a.name.trim() || a.name.trim().length > 80)
    errors.name = "Enter a name, up to 80 characters.";
  if (a.line1.trim().length < 5 || a.line1.length > 160)
    errors.line1 = "Enter an address between 5 and 160 characters.";
  if (!a.city.trim() || a.city.length > 60)
    errors.city = "Enter a city, up to 60 characters.";
  if (!a.state.trim() || a.state.length > 60)
    errors.state = "Enter a state, up to 60 characters.";
  if (!/^[1-9]\d{5}$/.test(a.pin))
    errors.pin = "Enter a six-digit Indian PIN code.";
  if (!/^[6-9]\d{9}$/.test(a.phone))
    errors.phone = "Enter a ten-digit Indian mobile number.";
  return errors;
}
export function deliveryFor(pin: string) {
  if (!/^[1-9]\d{5}$/.test(pin))
    throw new ServiceError("VALIDATION", "Enter a valid six-digit PIN code.");
  if (pin.startsWith("9"))
    throw new ServiceError(
      "UNSERVICEABLE",
      "This PIN is outside our demo delivery area. Try 400001 or 560001.",
    );
  return [
    { id: "standard", name: "Standard", pricePaise: 0, days: 5 },
    ...(["400001", "560001", "700001"].includes(pin)
      ? [{ id: "express", name: "Express", pricePaise: 14900, days: 2 }]
      : []),
  ];
}
export const deliveryService = async (pin: string, signal?: AbortSignal) => {
  await wait("delivery", signal);
  return deliveryFor(pin);
};
export type Session = { alias: string; expiresAt: number };
export function getSession(now = Date.now()): Session | null {
  try {
    const s = JSON.parse(safeRead("printo-session", sessionStorage) || "null");
    return s &&
      s.alias === "Demo Shopper" &&
      Number.isFinite(s.expiresAt) &&
      s.expiresAt > now
      ? s
      : null;
  } catch {
    return null;
  }
}
export function signInDemo() {
  const s = { alias: "Demo Shopper", expiresAt: Date.now() + 30 * 60 * 1000 };
  if (!safeWrite("printo-session", s, sessionStorage))
    throw new ServiceError(
      "STORAGE",
      "Demo session storage is unavailable. Continue as guest.",
    );
  return s;
}
export const signOutDemo = () => {
  try {
    sessionStorage.removeItem("printo-session");
  } catch {
    /* No credentials are retained. */
  }
};
export type Order = {
  id: string;
  createdAt: number;
  idempotencyKey: string;
  items: CartItem[];
  totals: ReturnType<typeof cartTotals>;
  city: string;
  pin: string;
  delivery: string;
  payment: "Demo UPI" | "Demo card";
  status: "Simulated confirmation";
};
export function getOrders(now = Date.now()): Order[] {
  try {
    const values = JSON.parse(safeRead("printo-orders-v1") || "[]");
    if (!Array.isArray(values)) return [];
    return values
      .filter(
        (o) =>
          o &&
          typeof o.id === "string" &&
          Number.isFinite(o.createdAt) &&
          o.createdAt > now - 30 * 86400000 &&
          o.status === "Simulated confirmation" &&
          typeof o.city === "string" &&
          typeof o.pin === "string" &&
          o.totals &&
          Number.isSafeInteger(o.totals.totalPaise) &&
          typeof o.idempotencyKey === "string" &&
          typeof o.delivery === "string" &&
          ["Demo UPI", "Demo card"].includes(o.payment) &&
          Array.isArray(o.items) &&
          o.items.every(
            (item: CartItem) =>
              item &&
              typeof item.key === "string" &&
              typeof item.productId === "string" &&
              item.config &&
              Object.values(item.config).every(
                (value) =>
                  typeof value === "string" || typeof value === "number",
              ) &&
              typeof item.config.quantity === "number" &&
              Number.isInteger(item.bundles) &&
              item.bundles > 0,
          ),
      )
      .slice(0, 20);
  } catch {
    return [];
  }
}
export type CheckoutInput = {
  items: CartItem[];
  fingerprint: string;
  getCurrentCart: () => CartItem[];
  coupon: string;
  address: Address;
  delivery: string;
  payment: string;
  accepted: boolean;
  idempotencyKey: string;
  sessionExpiresAt?: number;
  signal?: AbortSignal;
};
const pending = new Map<string, Promise<Order>>();
export function placeOrder(input: CheckoutInput): Promise<Order> {
  const saved = getOrders().find(
    (o) => o.idempotencyKey === input.idempotencyKey,
  );
  if (saved) return Promise.resolve(saved);
  const inFlight = pending.get(input.idempotencyKey);
  if (inFlight) return inFlight;
  const operation = (async () => {
    await wait("checkout", input.signal);
    if (input.sessionExpiresAt && input.sessionExpiresAt <= Date.now())
      throw new ServiceError(
        "SESSION_EXPIRED",
        "Your demo session expired. Sign in again or continue as guest.",
      );
    if (!input.items.length)
      throw new ServiceError("EMPTY_CART", "Your cart is empty.");
    if (cartFingerprint(input.getCurrentCart()) !== input.fingerprint)
      throw new ServiceError(
        "CART_CHANGED",
        "Your cart changed. Review the updated totals before confirming.",
      );
    if (Object.keys(validateAddress(input.address)).length)
      throw new ServiceError("VALIDATION", "Check your address fields.");
    const delivery = deliveryFor(input.address.pin).find(
      (d) => d.id === input.delivery,
    );
    if (!delivery)
      throw new ServiceError(
        "DELIVERY_CHANGED",
        "Select an available delivery option.",
      );
    if (
      input.items.some((i) => i.config.delivery === "Same Day") &&
      !["400001", "560001", "700001"].includes(input.address.pin)
    )
      throw new ServiceError(
        "UNSERVICEABLE",
        "Same Day sample items require PIN 400001, 560001 or 700001. Edit those items or change the PIN.",
      );
    if (!["Demo UPI", "Demo card"].includes(input.payment) || !input.accepted)
      throw new ServiceError(
        "VALIDATION",
        "Choose a demo payment method and confirm this is a simulation.",
      );
    const canonical = parseCart(
      JSON.stringify(input.items),
      products.map((p) => p.id),
    );
    if (cartFingerprint(canonical) !== input.fingerprint)
      throw new ServiceError(
        "UNAVAILABLE",
        "A cart item is invalid or no longer available.",
      );
    const totals = cartTotals(canonical, input.coupon, delivery.pricePaise);
    if (totals.couponError)
      throw new ServiceError("COUPON", totals.couponError);
    const order: Order = {
      id: `DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
      idempotencyKey: input.idempotencyKey,
      items: structuredClone(canonical),
      totals,
      city: input.address.city,
      pin: input.address.pin,
      delivery: delivery.name,
      payment: input.payment as Order["payment"],
      status: "Simulated confirmation",
    };
    if (!safeWrite("printo-orders-v1", [order, ...getOrders()].slice(0, 20)))
      throw new ServiceError(
        "STORAGE",
        "Unable to save the demo confirmation. Free browser storage and retry.",
      );
    return order;
  })();
  pending.set(input.idempotencyKey, operation);
  void operation
    .finally(() => pending.delete(input.idempotencyKey))
    .catch(() => {});
  return operation;
}
export function reorderItems(order: Order, cart: CartItem[]) {
  let result = [...cart];
  const skipped: string[] = [];
  for (const item of order.items) {
    const valid = parseCart(
      JSON.stringify([item]),
      products.map((p) => p.id),
    );
    if (!valid.length) {
      skipped.push(item.productId);
      continue;
    }
    try {
      result = addCartItem(result, valid[0]);
    } catch (error) {
      skipped.push(error instanceof Error ? error.message : item.productId);
    }
  }
  return { items: result, skipped };
}
// Coupon type is exported for clients of the independent mock contracts.
export type { Coupon };
