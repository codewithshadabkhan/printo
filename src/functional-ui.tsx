import { useEffect, useRef, useState } from "react";
import { products, templates, type Product } from "./data";
import { Icon, Breadcrumbs, Modal } from "./components";
import {
  optionRules,
  configParams,
  configFromParams,
  changeConfig,
  defaultConfig,
  configKey,
  type Config,
  type OptionKey,
} from "./configuration";
import { moneyPaise, quoteProduct } from "./pricing";
import {
  quoteService,
  deliveryService,
  demoAddresses,
  validateAddress,
  getSession,
  signInDemo,
  signOutDemo,
  getOrders,
  placeOrder,
  reorderItems,
  ServiceError,
  type Address,
  type Order,
} from "./services";
import {
  cartTotals,
  cartFingerprint,
  editCartItem,
  type CartItem,
} from "./model";
import {
  createDesign,
  validateDesign,
  changeDesign,
  undoDesign,
  redoDesign,
  uploadError,
  resolutionWarning,
  type DesignFace,
  type DesignDocument,
  type DesignHistory,
} from "./design";
import { loadDraft, saveDraft, safeRead, safeWrite } from "./storage";
export type AddItem = (
  p: Product,
  c: Config,
  design?: string,
  document?: DesignDocument,
) => void;
export function ConfigFields({
  product,
  config,
  onChange,
}: {
  product: Product;
  config: Config;
  onChange: (c: Config) => void;
}) {
  const [notice, setNotice] = useState("");
  const rules = optionRules(product, config);
  const change = (key: OptionKey, value: string | number) => {
    const next = changeConfig(product, config, key, value);
    const resets = Object.keys(next).filter(
      (k) => k !== key && next[k as OptionKey] !== config[k as OptionKey],
    );
    setNotice(
      resets.length ? `Updated dependent options: ${resets.join(", ")}.` : "",
    );
    onChange(next);
  };
  return (
    <>
      <fieldset>
        <legend>Delivery Speed</legend>
        <div className="option-pills">
          {rules
            .find((r) => r.key === "delivery")!
            .values.map((value) => (
              <label
                key={value}
                className={config.delivery === value ? "selected" : ""}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={config.delivery === value}
                  onChange={() => change("delivery", value)}
                />
                {value}
                {value === "Same Day" && <small>+₹99 / set</small>}
              </label>
            ))}
        </div>
      </fieldset>
      <div className="configuration-grid">
        {[
          "corners",
          "stock",
          "quantity",
          "size",
          "material",
          "finish",
          "colour",
          "orientation",
          "sides",
        ].map((key) => {
          const rule = rules.find((r) => r.key === key)!;
          if (rule.values.length === 1) return null;
          return (
            <label key={key}>
              {rule.label}
              <select
                value={config[rule.key] ?? rule.defaultValue}
                onChange={(e) =>
                  change(
                    rule.key,
                    key === "quantity"
                      ? Number(e.target.value)
                      : e.target.value,
                  )
                }
              >
                {rule.values.map((value) => (
                  <option value={value} key={value}>
                    {value}
                    {key === "quantity" && Number(value) >= product.quantity * 5
                      ? " · Volume savings"
                      : ""}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
      <p className="dependency-notice" role="status">
        {notice}
      </p>
    </>
  );
}
export function Configurator({
  product,
  config,
  onChange,
  onAdd,
  onUpload,
}: {
  product: Product;
  config: Config;
  onChange: (c: Config) => void;
  onAdd: AddItem;
  onUpload: () => void;
}) {
  const [quote, setQuote] = useState(() => quoteProduct(product, config));
  const [status, setStatus] = useState("loading");
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState("");
  const sequence = useRef(0);
  const signature = configKey(config);
  useEffect(() => {
    const current = ++sequence.current;
    const abort = new AbortController();
    setStatus("loading");
    setError("");
    quoteService(product, config, abort.signal)
      .then((value) => {
        if (sequence.current === current) {
          setQuote(value);
          setStatus("ready");
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError" && sequence.current === current) {
          setError(e.message);
          setStatus("error");
        }
      });
    return () => abort.abort();
  }, [product, signature, retry]);
  const ready = status === "ready" && configKey(quote.config) === signature;
  return (
    <div className="options-form">
      <ConfigFields product={product} config={config} onChange={onChange} />
      <div className="price-block" aria-live="polite">
        {ready ? (
          <>
            <strong>{moneyPaise(quote.totalPaise)}</strong>
            <span>{moneyPaise(quote.unitPaise)} / unit</span>
          </>
        ) : (
          <span>
            {status === "error"
              ? "Price unavailable"
              : "Updating sample price…"}
          </span>
        )}
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}{" "}
          <button
            className="text-button"
            onClick={() => setRetry((r) => r + 1)}
          >
            Retry price
          </button>
        </p>
      )}
      <p className="price-caption">
        Local price table · Tax included · Not a reference quote
      </p>
      <a
        className="button primary full"
        aria-disabled={!ready}
        href={
          ready
            ? `${product.path}/templates?${configParams(config)}`
            : undefined
        }
        onClick={(e) => {
          if (!ready) e.preventDefault();
        }}
      >
        Browse designs <Icon name="arrow" size={18} />
      </a>
      <button className="button secondary full" onClick={onUpload}>
        <Icon name="upload" size={18} />
        Upload design locally
      </button>
      <button
        className="text-button sample-add"
        disabled={!ready}
        onClick={() => onAdd(product, config)}
      >
        Add sample configuration to cart
      </button>
    </div>
  );
}
function FacePreview({ face, guides }: { face: DesignFace; guides: boolean }) {
  return (
    <div
      className="design-face"
      style={{
        background: face.colour,
        fontFamily: face.font,
        textAlign: face.align,
      }}
    >
      {face.image && (
        <div className="design-image-clip">
          <img
            alt="Locally selected design image"
            src={face.image.dataUrl}
            style={{
              transform: `translate(${face.image.x}%,${face.image.y}%) scale(${face.image.scale}) rotate(${face.image.rotation}deg)`,
            }}
          />
        </div>
      )}
      <div className="design-text">
        <strong>{face.name}</strong>
        <span>{face.tagline}</span>
      </div>
      {guides && (
        <>
          <div className="trim-guide" />
          <div className="safe-guide" />
          <span className="guide-label">TRIM / SAFE AREA (ILLUSTRATIVE)</span>
        </>
      )}
    </div>
  );
}
export function EditorPage({ onAdd }: { onAdd: AddItem }) {
  const params = new URLSearchParams(location.search);
  const product =
    products.find((p) => p.id === params.get("product")) || products[0];
  const template =
    templates.find((t) => t.id === params.get("template")) || templates[0];
  const config = configFromParams(product, params);
  const initialDesign = () => {
    const draft = createDesign(product.id, template.id);
    draft.front.name = template.name;
    draft.front.colour =
      (
        {
          Green: "#244b40",
          Cream: "#eadcc5",
          Black: "#252c2c",
          Blue: "#305165",
        } as Record<string, string>
      )[template.colour] || "#244b40";
    draft.front.font = template.theme === "Elegant" ? "Georgia" : "Arial";
    draft.front.align =
      template.theme === "Bold & Colourful" ? "left" : "center";
    return draft;
  };
  const [history, setHistory] = useState<DesignHistory>(() => ({
    past: [],
    present: params.has("resume")
      ? loadDraft(product.id) || initialDesign()
      : initialDesign(),
    future: [],
  }));
  const [side, setSide] = useState<"front" | "back">("front");
  const [guides, setGuides] = useState(true);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const generation = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current++;
    };
  }, []);
  const document = history.present;
  const face = document[side];
  const setFace = (patch: Partial<DesignFace>) => {
    setHistory((h) =>
      changeDesign(h, {
        ...h.present,
        [side]: { ...h.present[side], ...patch },
      }),
    );
    setMessage("Unsaved changes");
  };
  const upload = async (file: File | undefined) => {
    if (!file) return;
    const token = ++generation.current;
    const targetSide = side;
    setError("");
    const invalid = uploadError(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setLoading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const invalidContents = uploadError(file, bytes);
      if (invalidContents) throw Error(invalidContents);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(Error("Unable to read that image."));
        reader.readAsDataURL(file);
      });
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(Error("The image could not be decoded."));
        img.src = dataUrl;
      });
      if (image.naturalWidth > 12000 || image.naturalHeight > 12000)
        throw Error("Image dimensions exceed 12,000 pixels.");
      if (mounted.current && generation.current === token) {
        setHistory((h) =>
          changeDesign(h, {
            ...h.present,
            [targetSide]: {
              ...h.present[targetSide],
              image: {
                dataUrl,
                width: image.naturalWidth,
                height: image.naturalHeight,
                x: 0,
                y: 0,
                scale: 1,
                rotation: 0,
              },
            },
          }),
        );
        setMessage("Image loaded locally. Save to keep this draft.");
      }
    } catch (e) {
      if (mounted.current && generation.current === token)
        setError(e instanceof Error ? e.message : "Unable to read the image.");
    } finally {
      if (mounted.current && generation.current === token) setLoading(false);
    }
  };
  return (
    <div className="container editor-page">
      <Breadcrumbs
        items={[
          { name: product.name, href: product.path },
          { name: "Local design editor" },
        ]}
      />
      <div className="page-heading">
        <h1>Make it your own</h1>
        <p className="muted">
          Simplified local editor · Use images you have permission to reuse · No
          files leave this browser.
        </p>
      </div>
      <div className="editor-layout">
        <div>
          <div className="editor-toolbar">
            <div className="segmented">
              {(["front", "back"] as const).map((s) => (
                <button
                  key={s}
                  aria-pressed={side === s}
                  onClick={() => setSide(s)}
                >
                  {s === "front" ? "Front" : "Back"}
                </button>
              ))}
            </div>
            <button
              className="text-button"
              disabled={!history.past.length}
              onClick={() => {
                setHistory(undoDesign);
                setMessage("Unsaved changes");
              }}
            >
              Undo
            </button>
            <button
              className="text-button"
              disabled={!history.future.length}
              onClick={() => {
                setHistory(redoDesign);
                setMessage("Unsaved changes");
              }}
            >
              Redo
            </button>
            <label>
              <input
                type="checkbox"
                checked={guides}
                onChange={(e) => setGuides(e.target.checked)}
              />
              Show guides
            </label>
          </div>
          <FacePreview face={face} guides={guides} />
          <p className="local-note">
            Guides and the 89 × 51 mm card suggestion are illustrative. Font
            embedding, bleed, resolution and export dimensions are not
            validated. No print-ready file is generated.
          </p>
          {resolutionWarning(face) && (
            <p className="form-warning" role="status">
              {resolutionWarning(face)}
            </p>
          )}
        </div>
        <section className="editor-controls">
          <h2>{side === "front" ? "Front" : "Back"} design</h2>
          <label>
            Business name
            <input
              maxLength={40}
              value={face.name}
              onChange={(e) => setFace({ name: e.target.value })}
            />
          </label>
          <label>
            Tagline / contact line
            <input
              maxLength={80}
              value={face.tagline}
              onChange={(e) => setFace({ tagline: e.target.value })}
            />
          </label>
          <div className="select-row">
            <label>
              Colour
              <input
                type="color"
                value={face.colour}
                onChange={(e) => setFace({ colour: e.target.value })}
              />
            </label>
            <label>
              Font
              <select
                value={face.font}
                onChange={(e) =>
                  setFace({ font: e.target.value as DesignFace["font"] })
                }
              >
                {["Arial", "Georgia", "Verdana"].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Alignment
            <select
              value={face.align}
              onChange={(e) =>
                setFace({ align: e.target.value as DesignFace["align"] })
              }
            >
              {["left", "center", "right"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label>
            Choose a local image
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={loading}
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          <p className="fineprint">
            PNG, JPEG, WebP · maximum 512 KiB · SVG/PDF unsupported
          </p>
          {loading && <p role="status">Reading image…</p>}
          {face.image && (
            <>
              <label>
                Image zoom
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={face.image.scale}
                  onChange={(e) =>
                    setFace({
                      image: { ...face.image!, scale: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label>
                Horizontal position
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={face.image.x}
                  onChange={(e) =>
                    setFace({
                      image: { ...face.image!, x: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label>
                Vertical position
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={face.image.y}
                  onChange={(e) =>
                    setFace({
                      image: { ...face.image!, y: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <div className="button-row">
                <button
                  className="button secondary"
                  onClick={() =>
                    setFace({
                      image: {
                        ...face.image!,
                        rotation: (face.image!.rotation + 90) % 360,
                      },
                    })
                  }
                >
                  Rotate 90°
                </button>
                <button
                  className="text-button"
                  onClick={() => setFace({ image: undefined })}
                >
                  Remove image
                </button>
              </div>
            </>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <p role="status" className="fineprint">
            {message}
          </p>
          <div className="button-row">
            <button
              className="button secondary"
              onClick={() => {
                const ok = saveDraft(document);
                setMessage(ok ? "Draft saved in this browser." : "");
                setError(
                  ok
                    ? ""
                    : "Unable to save: browser storage is full or disabled.",
                );
              }}
            >
              Save draft
            </button>
            <a
              className="text-link"
              href={`/editor?product=${product.id}&resume=1&${configParams(config)}`}
            >
              Resume saved draft
            </a>
          </div>
          <button
            className="button primary full"
            disabled={loading || !face.name.trim() || !validateDesign(document)}
            onClick={() => setPreview(true)}
          >
            Preview both sides
          </button>
        </section>
      </div>
      {preview && (
        <Modal
          title="Review your local design"
          onClose={() => setPreview(false)}
          className="design-preview-modal"
        >
          <div className="design-preview-grid">
            <div>
              <h3>Front</h3>
              <FacePreview face={document.front} guides={false} />
            </div>
            <div>
              <h3>
                Back{" "}
                {config.sides === "Front only"
                  ? "(not included in this configuration)"
                  : ""}
              </h3>
              <FacePreview face={document.back} guides={false} />
            </div>
          </div>
          <p className="fineprint">
            Preview only. No print file or order is generated. Printing
            selection: {config.sides}.
          </p>
          <button
            className="button primary full"
            onClick={() => {
              onAdd(product, config, document.front.name, document);
              setPreview(false);
            }}
          >
            Add designed sample to cart
          </button>
        </Modal>
      )}
    </div>
  );
}
export function CartPage({
  cart,
  setCart,
  onCheckout,
}: {
  cart: CartItem[];
  setCart: (next: CartItem[] | ((old: CartItem[]) => CartItem[])) => void;
  onCheckout: () => void;
}) {
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState(() => safeRead("printo-coupon") || "");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<CartItem | null>(null);
  const [configuration, setConfiguration] = useState<Config>(
    defaultConfig(products[0]),
  );
  const totals = cartTotals(cart, coupon);
  useEffect(() => {
    try {
      localStorage.setItem("printo-coupon", coupon);
    } catch {
      setMessage(
        "The coupon applies for this visit, but browser storage could not save it.",
      );
    }
  }, [coupon]);
  if (!cart.length)
    return (
      <div className="container cart-page">
        <Breadcrumbs items={[{ name: "Cart" }]} />
        <div className="empty-state">
          <Icon name="cart" size={48} />
          <h1>Your cart is waiting for a good idea</h1>
          <p>Add a sample product or design to get started.</p>
          <a className="button primary" href="/">
            Continue shopping
          </a>
        </div>
      </div>
    );
  return (
    <div className="container cart-page">
      <Breadcrumbs items={[{ name: "Cart" }]} />
      <div className="page-heading">
        <h1>
          Your cart{" "}
          <span className="muted">
            ({cart.reduce((n, i) => n + i.bundles, 0)})
          </span>
        </h1>
        <p className="muted">Local sample cart · No real order or payment</p>
      </div>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => {
            const p = products.find((p) => p.id === item.productId)!;
            return (
              <article key={item.key} className="cart-item">
                <a href={p.path}>
                  <img src={`/assets/${p.image}.svg`} alt={p.name} />
                </a>
                <div className="cart-item-info">
                  <a href={p.path} className="product-name">
                    {p.name}
                  </a>
                  <p>
                    {item.config.quantity} units · {item.config.stock} ·{" "}
                    {item.config.corners} corners
                  </p>
                  <p>
                    {item.config.size} · {item.config.sides} ·{" "}
                    {item.config.delivery}
                  </p>
                  {item.design && (
                    <p className="cart-design">Design: {item.design}</p>
                  )}
                  <div className="cart-actions">
                    <label>
                      Sets
                      <select
                        aria-label={`Number of sets of ${p.name}`}
                        value={item.bundles}
                        onChange={(e) =>
                          setCart((old) =>
                            old.map((x) =>
                              x.key === item.key
                                ? { ...x, bundles: Number(e.target.value) }
                                : x,
                            ),
                          )
                        }
                      >
                        {Array.from({ length: 99 }, (_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="text-button"
                      onClick={() => {
                        setEditing(item);
                        setConfiguration(item.config);
                        setMessage("");
                      }}
                    >
                      Edit options
                    </button>
                    <button
                      className="text-button"
                      onClick={() =>
                        setCart((old) => old.filter((x) => x.key !== item.key))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <strong className="cart-item-total">
                  {moneyPaise(
                    quoteProduct(p, item.config).totalPaise * item.bundles,
                  )}
                </strong>
              </article>
            );
          })}
          <a className="text-link" href="/">
            Continue shopping
          </a>
        </div>
        <aside className="order-summary">
          <h2>Order summary</h2>
          <Totals totals={totals} />
          <form
            className="coupon-form"
            onSubmit={(e) => {
              e.preventDefault();
              const check = cartTotals(cart, code);
              if (check.couponError) {
                setMessage(check.couponError);
                return;
              }
              setCoupon(code.trim().toUpperCase());
              setMessage("Coupon applied.");
            }}
          >
            <label>
              Coupon code
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Try LOCAL10"
                maxLength={30}
              />
            </label>
            <button className="button secondary" disabled={!code.trim()}>
              Apply coupon
            </button>
          </form>
          {coupon && (
            <button
              className="text-button"
              onClick={() => {
                setCoupon("");
                setMessage("Coupon removed.");
              }}
            >
              Remove coupon {coupon}
            </button>
          )}
          {(totals.couponError || message) && (
            <p
              role={totals.couponError ? "alert" : "status"}
              className={totals.couponError ? "form-error" : "fineprint"}
            >
              {totals.couponError || message}
            </p>
          )}
          <p className="fineprint">
            LOCAL10: 10% off eligible merchandise from ₹500, capped at ₹300. One
            local coupon at a time.
          </p>
          <button
            className="button primary full"
            onClick={onCheckout}
            disabled={!!totals.couponError}
          >
            Continue to mock checkout
          </button>
          <p className="demo-note">No payment details are collected.</p>
        </aside>
      </div>
      {editing && (
        <Modal
          title="Edit sample configuration"
          onClose={() => setEditing(null)}
        >
          <div className="options-form">
            <ConfigFields
              product={products.find((p) => p.id === editing.productId)!}
              config={configuration}
              onChange={setConfiguration}
            />
            <p>
              Sample set:{" "}
              {moneyPaise(
                quoteProduct(
                  products.find((p) => p.id === editing.productId)!,
                  configuration,
                ).totalPaise,
              )}
            </p>
            {message && (
              <p role="alert" className="form-error">
                {message}
              </p>
            )}
            <button
              className="button primary full"
              onClick={() => {
                try {
                  const next = editCartItem(cart, editing.key, configuration);
                  setCart(next);
                  setEditing(null);
                } catch (e) {
                  setMessage(
                    e instanceof Error ? e.message : "Unable to edit item.",
                  );
                }
              }}
            >
              Save item changes
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
export function Totals({ totals }: { totals: ReturnType<typeof cartTotals> }) {
  return (
    <>
      <div>
        <span>Merchandise</span>
        <strong>{moneyPaise(totals.subtotalPaise)}</strong>
      </div>
      <div>
        <span>Delivery</span>
        <span>{moneyPaise(totals.deliveryPaise)}</span>
      </div>
      {totals.discountPaise > 0 && (
        <div>
          <span>Coupon savings</span>
          <span>−{moneyPaise(totals.discountPaise)}</span>
        </div>
      )}
      <hr />
      <div className="summary-total">
        <span>Total</span>
        <strong>{moneyPaise(totals.totalPaise)}</strong>
      </div>
      <p className="fineprint">Tax included; no additional tax is added.</p>
    </>
  );
}
export function AccountPage() {
  const [session, setSession] = useState(getSession);
  const [message, setMessage] = useState("");
  return (
    <div className="container boundary-page">
      <Breadcrumbs items={[{ name: "Demo account" }]} />
      <div className="page-heading">
        <h1>{session ? "Hello, Demo Shopper" : "Try a local demo account"}</h1>
        <p className="muted">
          No credentials or personal data are required. This is not VistaPrint
          sign-in.
        </p>
      </div>
      {session ? (
        <button
          className="button secondary"
          onClick={() => {
            signOutDemo();
            setSession(null);
          }}
        >
          Sign out of demo
        </button>
      ) : (
        <button
          className="button primary"
          onClick={() => {
            try {
              setSession(signInDemo());
            } catch (e) {
              setMessage(
                e instanceof Error ? e.message : "Session unavailable",
              );
            }
          }}
        >
          Sign in as Demo Shopper
        </button>
      )}
      {message && <p role="alert">{message}</p>}
      <nav className="account-tabs">
        <a href="/checkout">Guest / demo checkout</a>
        <a href="/my-account/orders">Local order history</a>
        <a href="/favourites">My Favourites</a>
      </nav>
      <p className="local-note">
        The guest cart stays in this browser across demo sign-in and sign-out.
        There is no remote account cart to merge. Demo sessions expire after 30
        minutes.
      </p>
    </div>
  );
}
export function CheckoutPage({
  cart,
  setCart,
  getCurrentCart,
  onNavigate,
}: {
  cart: CartItem[];
  setCart: (next: CartItem[]) => void;
  getCurrentCart: () => CartItem[];
  onNavigate: (url: string) => void;
}) {
  const [address, setAddress] = useState<Address>(() => {
    try {
      const data = JSON.parse(
        safeRead("printo-address", sessionStorage) || "null",
      );
      return data && Object.keys(validateAddress(data)).length === 0
        ? data
        : demoAddresses[0];
    } catch {
      return demoAddresses[0];
    }
  });
  const [session, setSession] = useState(getSession);
  const [guest, setGuest] = useState(!getSession());
  const [options, setOptions] = useState<
    ReturnType<typeof import("./services").deliveryFor>
  >([]);
  const [delivery, setDelivery] = useState("");
  const [payment, setPayment] = useState("Demo UPI");
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkedPin, setCheckedPin] = useState("");
  const abort = useRef<AbortController | null>(null);
  const submitLock = useRef(false);
  const confirmationAbort = useRef<AbortController | null>(null);
  const intent = useRef(
    `intent-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const mounted = useRef(true);
  const fingerprint = cartFingerprint(cart);
  const reviewRef = useRef(fingerprint);
  const [reviewed, setReviewed] = useState(fingerprint);
  const coupon = safeRead("printo-coupon") || "";
  const shipping = options.find((d) => d.id === delivery)?.pricePaise || 0;
  const totals = cartTotals(cart, coupon, shipping);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abort.current?.abort();
      confirmationAbort.current?.abort();
    };
  }, []);
  useEffect(() => {
    setDelivery("");
    setOptions([]);
    setCheckedPin("");
    abort.current?.abort();
    setStatus("idle");
  }, [address.pin]);
  useEffect(() => {
    if (reviewRef.current !== fingerprint) {
      setAccepted(false);
      setError("Your cart changed. Review the updated totals.");
      reviewRef.current = fingerprint;
    }
  }, [fingerprint]);
  const check = async () => {
    const validation = validateAddress(address);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setStatus("delivery");
    setOptions([]);
    setDelivery("");
    setCheckedPin("");
    setError("");
    try {
      const result = await deliveryService(address.pin, controller.signal);
      if (!mounted.current || controller.signal.aborted) return;
      setOptions(result);
      setDelivery(result[0].id);
      setCheckedPin(address.pin);
      setStatus("idle");
      if (!safeWrite("printo-address", address, sessionStorage))
        setError("Delivery checked, but this tab could not save the address.");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (mounted.current) {
        setError(e instanceof Error ? e.message : "Delivery check failed");
        setStatus("idle");
      }
    }
  };
  const submit = async () => {
    if (submitLock.current) return;
    setErrors(validateAddress(address));
    if (Object.keys(validateAddress(address)).length) return;
    if (checkedPin !== address.pin || !delivery) {
      setError("Check delivery for your current PIN first.");
      return;
    }
    if (reviewed !== fingerprint) {
      setError("Review the updated cart before confirming.");
      return;
    }
    submitLock.current = true;
    setStatus("submitting");
    setError("");
    const key = intent.current;
    confirmationAbort.current = new AbortController();
    try {
      const order = await placeOrder({
        items: cart,
        fingerprint,
        getCurrentCart,
        coupon,
        address,
        delivery,
        payment,
        accepted,
        idempotencyKey: key,
        signal: confirmationAbort.current.signal,
        sessionExpiresAt: !guest ? session?.expiresAt : undefined,
      });
      if (!mounted.current) return;
      setCart([]);
      onNavigate(`/order-confirmation?id=${encodeURIComponent(order.id)}`);
    } catch (e) {
      if (mounted.current) {
        setError(
          e instanceof Error ? e.message : "Unable to confirm demo order",
        );
        if (e instanceof ServiceError && e.code === "SESSION_EXPIRED") {
          setSession(null);
          setGuest(false);
        }
      }
    } finally {
      submitLock.current = false;
      if (mounted.current) setStatus("idle");
    }
  };
  if (!cart.length)
    return (
      <div className="container empty-state">
        <h1>Your cart is empty</h1>
        <a className="button primary" href="/">
          Explore products
        </a>
        <a className="text-button" href="/my-account/orders">
          Local order history
        </a>
      </div>
    );
  return (
    <div className="container checkout-page">
      <Breadcrumbs
        items={[{ name: "Cart", href: "/c/" }, { name: "Mock checkout" }]}
      />
      <div className="page-heading">
        <h1>Mock checkout</h1>
        <p className="muted">
          Use fictional details. No real order, payment or reference-site
          request will be made.
        </p>
      </div>
      <div className="cart-layout">
        <fieldset
          className="checkout-fields"
          disabled={status === "submitting"}
        >
          <section>
            <h2>1. Guest or demo account</h2>
            <p>
              {session && !guest
                ? "Signed in as Demo Shopper."
                : "Continue without an account."}
            </p>
            <div className="button-row">
              <button
                className="button secondary"
                onClick={() => {
                  setGuest(true);
                  setError("");
                }}
              >
                Continue as guest
              </button>
              <button
                className="button secondary"
                onClick={() => {
                  try {
                    setSession(signInDemo());
                    setGuest(false);
                    setError("");
                  } catch (e) {
                    setError(
                      e instanceof Error ? e.message : "Session unavailable",
                    );
                  }
                }}
              >
                Use demo sign-in
              </button>
            </div>
          </section>
          <section>
            <h2>2. Address</h2>
            <label>
              Saved demo address
              <select
                value={
                  demoAddresses.some((a) => a.id === address.id)
                    ? address.id
                    : "custom"
                }
                onChange={(e) => {
                  const a = demoAddresses.find((a) => a.id === e.target.value);
                  if (a) setAddress({ ...a });
                }}
              >
                {demoAddresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.city} · {a.pin}
                  </option>
                ))}
                <option value="custom">Edited address</option>
              </select>
            </label>
            <div className="address-grid">
              {(
                ["name", "line1", "city", "state", "pin", "phone"] as const
              ).map((key) => (
                <label key={key}>
                  {
                    {
                      name: "Recipient name",
                      line1: "Address line",
                      city: "City",
                      state: "State",
                      pin: "PIN code",
                      phone: "Mobile number",
                    }[key]
                  }
                  <input
                    value={address[key]}
                    inputMode={
                      key === "pin" || key === "phone" ? "numeric" : undefined
                    }
                    maxLength={
                      key === "pin"
                        ? 6
                        : key === "phone"
                          ? 10
                          : key === "line1"
                            ? 160
                            : 80
                    }
                    aria-invalid={!!errors[key]}
                    aria-describedby={errors[key] ? `error-${key}` : undefined}
                    onChange={(e) => {
                      setAddress((a) => ({
                        ...a,
                        id: "custom",
                        [key]: e.target.value,
                      }));
                      setErrors((old) => ({ ...old, [key]: "" }));
                    }}
                  />
                  {errors[key] && (
                    <span id={`error-${key}`} className="form-error">
                      {errors[key]}
                    </span>
                  )}
                </label>
              ))}
            </div>
            <p className="fineprint">
              Address details stay in this tab’s session storage. History keeps
              only city and PIN.
            </p>
            <button
              className="button secondary"
              disabled={status !== "idle"}
              onClick={() => void check()}
            >
              {status === "delivery"
                ? "Checking delivery…"
                : "Check delivery options"}
            </button>
            {status === "delivery" && (
              <button
                className="text-button"
                onClick={() => {
                  abort.current?.abort();
                  setStatus("idle");
                }}
              >
                Cancel delivery check
              </button>
            )}
          </section>
          <section>
            <h2>3. Delivery</h2>
            {options.length ? (
              options.map((option) => (
                <label className="checkout-choice" key={option.id}>
                  <input
                    type="radio"
                    name="checkout-delivery"
                    checked={delivery === option.id}
                    onChange={() => setDelivery(option.id)}
                  />
                  <span>
                    {option.name} · {moneyPaise(option.pricePaise)}
                    <small>
                      Demo estimate:{" "}
                      {new Date(
                        Date.now() + option.days * 86400000,
                      ).toLocaleDateString("en-IN")}{" "}
                      · {option.days} calendar days
                    </small>
                  </span>
                </label>
              ))
            ) : (
              <p className="muted">
                Check your PIN to see simulated delivery options.
              </p>
            )}
          </section>
          <section>
            <h2>4. Demo payment</h2>
            {["Demo UPI", "Demo card"].map((value) => (
              <label className="checkout-choice" key={value}>
                <input
                  type="radio"
                  name="mock-payment"
                  checked={payment === value}
                  onChange={() => setPayment(value)}
                />
                {value} · no details required
              </label>
            ))}
            <p className="fineprint">
              There are no card-number, CVV or payment-credential fields.
            </p>
          </section>
        </fieldset>
        <aside className="order-summary">
          <h2>Review your sample</h2>
          <p className="fineprint">
            {cart.reduce((n, i) => n + i.bundles, 0)} sample sets
          </p>
          <Totals totals={totals} />
          {totals.couponError && (
            <p className="form-error">
              {totals.couponError} <a href="/c/">Edit coupon</a>
            </p>
          )}
          {reviewed !== fingerprint && (
            <button
              className="button secondary full"
              onClick={() => {
                setReviewed(fingerprint);
                setError("");
              }}
            >
              Accept updated cart totals
            </button>
          )}
          <label className="checkout-choice">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            I understand this creates a local demo confirmation only.
          </label>
          {error && (
            <div role="alert" className="form-error">
              <p>{error}</p>
              <button
                className="text-button"
                disabled={status !== "idle"}
                onClick={() => {
                  setStatus("idle");
                  setError("");
                  void check();
                }}
              >
                Retry delivery check
              </button>
            </div>
          )}
          <button
            className="button primary full"
            disabled={
              status !== "idle" ||
              !accepted ||
              !delivery ||
              !!totals.couponError ||
              reviewed !== fingerprint ||
              (!guest && !session)
            }
            onClick={() => void submit()}
          >
            {status === "submitting"
              ? "Creating local confirmation…"
              : "Confirm demo order"}
          </button>
          {status === "submitting" && (
            <button
              className="text-button"
              onClick={() => confirmationAbort.current?.abort()}
            >
              Cancel local confirmation
            </button>
          )}
          <a href="/c/" className="text-button">
            Back to cart
          </a>
        </aside>
      </div>
    </div>
  );
}
export function OrdersPage({
  cart,
  setCart,
  confirmation = false,
}: {
  cart: CartItem[];
  setCart: (items: CartItem[]) => void;
  confirmation?: boolean;
}) {
  const orders = getOrders();
  const id = new URLSearchParams(location.search).get("id");
  const shown = confirmation ? orders.filter((o) => o.id === id) : orders;
  const [message, setMessage] = useState("");
  return (
    <div className="container orders-page">
      <Breadcrumbs
        items={[
          { name: confirmation ? "Local confirmation" : "Local order history" },
        ]}
      />
      <div className="page-heading">
        <h1>
          {confirmation
            ? shown.length
              ? "Your demo is confirmed"
              : "Demo confirmation unavailable"
            : "Local order history"}
        </h1>
        <p className="muted">
          Simulated confirmations stored in this browser for up to 30 days. No
          fulfilment or charge occurs.
        </p>
      </div>
      {!shown.length && (
        <p>
          No matching demo confirmations. <a href="/">Explore products</a>
        </p>
      )}
      {shown.map((order: Order) => (
        <article className="order-card" key={order.id}>
          <h2>{order.id}</h2>
          <p>
            {order.status} · {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
          <p>
            {order.city} {order.pin} · {order.delivery} · {order.payment}
          </p>
          <ul>
            {order.items.map((item) => (
              <li key={item.key}>
                {products.find((p) => p.id === item.productId)?.name ||
                  "Unavailable product"}{" "}
                · {item.config.quantity} × {item.bundles} sets
                {item.design ? ` · ${item.design}` : ""}
              </li>
            ))}
          </ul>
          <strong>{moneyPaise(order.totals.totalPaise)}</strong>
          <div className="button-row">
            <button
              className="button secondary"
              onClick={() => {
                const result = reorderItems(order, cart);
                setCart(result.items);
                setMessage(
                  result.skipped.length
                    ? `Reordered available items. Skipped: ${result.skipped.join(", ")}`
                    : "Sample items added to cart at current local prices.",
                );
              }}
            >
              Reorder sample items
            </button>
            <a className="text-link" href="/c/">
              View cart
            </a>
          </div>
        </article>
      ))}
      <p role="status">{message}</p>
      {confirmation && (
        <a className="button secondary" href="/my-account/orders">
          View local order history
        </a>
      )}
    </div>
  );
}
