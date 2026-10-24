import { useEffect, useRef, useState } from "react";
import {
  Configurator,
  EditorPage,
  CartPage,
  AccountPage,
  CheckoutPage,
  OrdersPage,
  type AddItem,
} from "./functional-ui";
import { configFromParams, configParams, type Config } from "./configuration";
import { loadCart, saveCart, CART_KEY } from "./storage";
import { useListingState } from "./url-state";
export { configureMock } from "./services";
import {
  categories,
  products,
  homeSections,
  templates,
  helpArticles,
  type Category,
  type Product,
  type Template,
} from "./data";
import {
  addCartItem,
  defaultConfig,
  filterTemplates,
  makeCartItem,
  parseSaved,
  searchProducts,
  type CartItem,
} from "./model";
import {
  Breadcrumbs,
  EmptyState,
  Icon,
  Modal,
  ProductGrid,
  ProductRail,
  SiteFooter,
  SiteHeader,
  TemplateArt,
} from "./components";
const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
type BrowseProps = { saved: string[]; onSave: (id: string) => void };
type Add = AddItem;
export function App() {
  const [route, setRoute] = useState(location.pathname + location.search);
  const [initialCart] = useState(loadCart);
  const [cart, setCart] = useState<CartItem[]>(initialCart.items);
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const [storageNotice, setStorageNotice] = useState(initialCart.notice);
  const addGuard = useRef({ key: "", time: 0 });
  const navigate = (url: string) => {
    history.pushState(null, "", url);
    window.dispatchEvent(new Event("popstate"));
  };
  const [saved, setSaved] = useState<string[]>(() =>
    parseSaved(readStorage("printo-saved-v1")),
  );
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const notify = (message: string) => {
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(""), 4500);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!saveCart(cart))
      setStorageNotice(
        "Browser storage is unavailable or full. Changes are temporary until this page closes.",
      );
  }, [cart]);
  useEffect(() => {
    if (!writeStorage("printo-saved-v1", saved))
      setStorageNotice(
        "Saved items are temporary because browser storage is full or disabled.",
      );
  }, [saved]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (
        event.key &&
        event.key !== CART_KEY &&
        event.key !== "printo-saved-v1"
      )
        return;
      const next = loadCart();
      setCart(next.items);
      if (next.notice) setStorageNotice(next.notice);
      setSaved(parseSaved(readStorage("printo-saved-v1")));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    const update = () => {
      setRoute(location.pathname + location.search);
      window.scrollTo(0, 0);
      requestAnimationFrame(() =>
        document.getElementById("main")?.focus({ preventScroll: true }),
      );
    };
    const click = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest) return;
      const a = target.closest("a");
      if (
        !a ||
        a.target ||
        a.hasAttribute("download") ||
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const url = new URL(a.href, location.origin);
      if (
        url.origin !== location.origin ||
        !a.getAttribute("href")?.startsWith("/")
      )
        return;
      e.preventDefault();
      history.pushState(null, "", url.pathname + url.search + url.hash);
      update();
      if (url.hash)
        requestAnimationFrame(() =>
          document.getElementById(url.hash.slice(1))?.scrollIntoView(),
        );
    };
    const submit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      if (form.getAttribute("action") !== "/search") return;
      e.preventDefault();
      const query = String(new FormData(form).get("q") || "").trim();
      history.pushState(null, "", `/search?q=${encodeURIComponent(query)}`);
      update();
    };
    window.addEventListener("popstate", update);
    document.addEventListener("click", click);
    document.addEventListener("submit", submit);
    return () => {
      window.removeEventListener("popstate", update);
      document.removeEventListener("click", click);
      document.removeEventListener("submit", submit);
    };
  }, []);
  useEffect(() => {
    const recover = (event: Event) => {
      const image = event.target;
      if (image instanceof HTMLImageElement && !image.dataset.fallback) {
        image.dataset.fallback = "true";
        image.alt = `Image unavailable: ${image.alt || "product illustration"}`;
        image.src = "/assets/image-unavailable.svg";
      }
    };
    document.addEventListener("error", recover, true);
    return () => document.removeEventListener("error", recover, true);
  }, []);
  const onSave = (id: string) => {
    setSaved((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
    notify(
      saved.includes(id)
        ? "Removed from your favourites."
        : "Saved to your favourites in this browser.",
    );
  };
  const add: Add = (p, config, design, document) => {
    try {
      const item = makeCartItem(p.id, config, design, document);
      const now = Date.now();
      if (
        addGuard.current.key === item.key &&
        now - addGuard.current.time < 400
      )
        return;
      const next = addCartItem(cartRef.current, item);
      addGuard.current = { key: item.key, time: now };
      cartRef.current = next;
      setCart(next);
      notify(`${p.name} added to your sample cart.`);
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Unable to add that sample.",
      );
    }
  };
  const path = route.split("?")[0].replace(/\/$/, "") || "/";
  const category = categories.find((c) => c.path === path);
  const product = products.find((p) => p.path === path);
  const isGallery = path.endsWith("/templates");
  const title =
    path === "/"
      ? "Personalised printing for your business"
      : category?.name ||
        product?.name ||
        (isGallery
          ? "Visiting Card Designs & Templates"
          : path === "/c"
            ? "Your cart"
            : path === "/search"
              ? "Search products"
              : path === "/favourites"
                ? "My Favourites"
                : path.includes("help-centre")
                  ? "Help is here"
                  : "Local UI Study");
  useEffect(() => {
    document.title = `${title} | VistaPrint Local Study`;
  }, [title]);
  const browse = { saved, onSave };
  let page;
  if (path === "/") page = <Home {...browse} />;
  else if (category)
    page = <CategoryPage key={route} category={category} {...browse} />;
  else if (product)
    page = (
      <ProductPage key={route} product={product} onAdd={add} {...browse} />
    );
  else if (isGallery && products.some((p) => `${p.path}/templates` === path))
    page = (
      <Gallery
        key={route}
        product={products.find((p) => `${p.path}/templates` === path)!}
        onAdd={add}
        {...browse}
      />
    );
  else if (path === "/search") page = <SearchPage key={route} {...browse} />;
  else if (path === "/favourites")
    page = <Favourites onAdd={add} {...browse} />;
  else if (path === "/c")
    page = (
      <CartPage
        cart={cart}
        setCart={setCart}
        onCheckout={() => navigate("/checkout")}
      />
    );
  else if (path === "/editor") page = <EditorPage key={route} onAdd={add} />;
  else if (path === "/checkout")
    page = (
      <CheckoutPage
        cart={cart}
        setCart={setCart}
        getCurrentCart={() => cartRef.current}
        onNavigate={navigate}
      />
    );
  else if (path === "/order-confirmation" || path === "/my-account/orders")
    page = (
      <OrdersPage
        cart={cart}
        setCart={setCart}
        confirmation={path === "/order-confirmation"}
      />
    );
  else if (path === "/my-account") page = <AccountPage />;
  else if (path === "/customer-care/help-centre") page = <Help />;
  else if (path === "/diwali-gifting-sale") page = <Sale {...browse} />;
  else if (
    path.startsWith("/my-account") ||
    path.startsWith("/services") ||
    path.startsWith("/information") ||
    path === "/copyright-and-trademark-complaints"
  )
    page = <Boundary path={path} />;
  else
    page = (
      <EmptyState title="We couldn’t find that page" icon="search">
        <p>This route is outside the current recreation.</p>
        <a className="button primary" href="/">
          Explore products
        </a>
      </EmptyState>
    );
  return (
    <>
      <SiteHeader
        cartCount={cart.reduce((sum, i) => sum + i.bundles, 0)}
        savedCount={saved.length}
        route={route}
      />
      {storageNotice && (
        <p className="storage-notice" role="status">
          {storageNotice}
          <button className="text-button" onClick={() => setStorageNotice("")}>
            Dismiss
          </button>
        </p>
      )}
      <main id="main" tabIndex={-1} key={path}>
        {page}
      </main>
      <SiteFooter />
      <div
        className={`toast ${toast ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <>
            <Icon name="check" size={21} />
            <span>{toast}</span>
            <a href="/c/">View cart</a>
            <button
              className="icon-button"
              onClick={() => setToast("")}
              aria-label="Dismiss notification"
            >
              <Icon name="close" size={17} />
            </button>
          </>
        )}
      </div>
    </>
  );
}
function Home(props: BrowseProps) {
  return (
    <>
      <div className="container home">
        <h1 className="sr-only">Personalised printing for your business</h1>
        <section className="section category-section" aria-labelledby="explore">
          <div className="section-heading">
            <h2 id="explore">Explore all categories</h2>
            <span className="section-note">
              A little inspiration. A world of possibilities.
            </span>
          </div>
          <div className="category-grid">
            {categories.map((c) => (
              <a className="category-tile" key={c.id} href={c.path}>
                <div className="category-art">
                  <img
                    src={`/assets/${c.image}.svg`}
                    alt={`Original ${c.name.toLowerCase()} illustration`}
                    loading={
                      [
                        "cards",
                        "polos",
                        "shirts",
                        "tees",
                        "winter",
                        "stamps",
                      ].includes(c.id)
                        ? "eager"
                        : "lazy"
                    }
                  />
                </div>
                <span>
                  {c.name}
                  <Icon name="right" size={15} />
                </span>
              </a>
            ))}
          </div>
        </section>
        {homeSections.map((section) => (
          <ProductRail key={section.title} {...section} {...props} />
        ))}
      </div>
      <section className="about-section">
        <div className="container">
          <p className="eyebrow">Made for your next big thing</p>
          <h2>VistaPrint India: Your ideas, in print.</h2>
          <p className="about-intro">
            From your first introduction to your next milestone, make something
            that feels like your business. Discover personal touches for your
            work, your team and your everyday.
          </p>
          <div className="value-grid">
            <div>
              <span className="value-icon">01</span>
              <h3>Small quantities. Big possibilities.</h3>
              <p>
                Start with what you need and find something that works for you.
              </p>
            </div>
            <div>
              <span className="value-icon">02</span>
              <h3>Your design, made personal.</h3>
              <p>
                Explore original sample designs and make your next idea
                tangible.
              </p>
            </div>
            <div>
              <span className="value-icon">03</span>
              <h3>A little peace of mind.</h3>
              <p>Thoughtful products and helpful details, all in one place.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
function CategoryPage({
  category,
  ...props
}: { category: Category } & BrowseProps) {
  const [listing, setListing] = useListingState("category");
  const items = products
    .filter((p) => p.category === category.id)
    .filter((p) =>
      listing.band === "under500"
        ? p.price < 500
        : listing.band === "from500"
          ? p.price >= 500
          : true,
    )
    .sort((a, b) =>
      listing.sort === "low"
        ? a.price - b.price
        : listing.sort === "high"
          ? b.price - a.price
          : 0,
    );
  const isCards = category.id === "cards";
  return (
    <div className="container category-page">
      <Breadcrumbs items={[{ name: category.name }]} />
      <div className="category-intro">
        <div>
          <p className="eyebrow">Made for your business</p>
          <h1>{category.name}</h1>
          <p>{category.description}</p>
          <div className="category-jumps">
            <a href="#category-products">
              {isCards ? "Shop by shapes" : "Explore products"}{" "}
              <Icon name="down" size={15} />
            </a>
            {isCards && (
              <a href="#papers">
                Papers & textures <Icon name="down" size={15} />
              </a>
            )}
            <a href="/customer-care/help-centre/">Need a little help?</a>
          </div>
        </div>
        <div className="intro-art">
          <img
            src={`/assets/${category.image}.svg`}
            alt="Original product mockup"
          />
        </div>
      </div>
      <div className="results-toolbar category-controls">
        <p role="status">{items.length} sample products</p>
        <label>
          Price range
          <select
            value={listing.band}
            onChange={(e) => setListing({ band: e.target.value, page: 1 })}
          >
            <option value="all">All prices</option>
            <option value="under500">Under ₹500</option>
            <option value="from500">₹500 and above</option>
          </select>
        </label>
        <label>
          Sort by
          <select
            value={listing.sort}
            onChange={(e) => setListing({ sort: e.target.value, page: 1 })}
          >
            <option value="featured">Featured</option>
            <option value="low">Price: Low to high</option>
            <option value="high">Price: High to low</option>
          </select>
        </label>
      </div>
      {!items.length && (
        <div className="empty-state">
          <h2>No products match this price range</h2>
          <button
            className="button secondary"
            onClick={() => setListing({ band: "all", page: 1 })}
          >
            Clear category filters
          </button>
        </div>
      )}
      <section className="section" id="category-products">
        <div className="section-heading">
          <div>
            <h2>
              {isCards
                ? "Shop by shapes"
                : category.id === "signs"
                  ? "Best Sellers"
                  : "Explore the collection"}
            </h2>
            <p className="muted">
              {isCards
                ? "A shape for every kind of introduction."
                : "Find the right fit for your next idea."}
            </p>
          </div>
        </div>
        <ProductGrid
          items={
            isCards
              ? items.filter((p) =>
                  [
                    "standard",
                    "classic",
                    "rounded",
                    "square",
                    "shaped",
                  ].includes(p.id),
                )
              : items
          }
          {...props}
        />
      </section>
      {isCards && (
        <>
          <section className="section" id="papers">
            <h2>Shop by papers & textures</h2>
            <p className="muted section-subtitle">
              The right finish makes all the difference.
            </p>
            <ProductGrid
              items={items.filter((p) =>
                ["glossy", "matte", "spot-uv"].includes(p.id),
              )}
              {...props}
            />
          </section>
          <section className="section">
            <h2>Shop specialty business cards</h2>
            <p className="muted section-subtitle">
              Create a connection beyond your first impression.
            </p>
            <ProductGrid
              items={items.filter((p) => p.id === "qr")}
              {...props}
            />
          </section>
        </>
      )}
      {category.id === "signs" && (
        <section className="section topic-grid">
          {[
            "Trade Shows & Events",
            "Indoor & Outdoor Signs",
            "Office Signs",
            "Table Coverings",
          ].map((name, i) => (
            <div key={name}>
              <h3>{name}</h3>
              <p className="muted">
                Explore our local selection of signage and printed materials.
              </p>
              <a
                href={
                  products.filter((p) => p.category === "signs")[i % 3].path
                }
              >
                Explore options <Icon name="arrow" size={17} />
              </a>
            </div>
          ))}
        </section>
      )}
      <div className="local-note">
        Catalogue preview · Artwork and prices are local examples. Reference
        coverage is documented in the audit.
      </div>
    </div>
  );
}
function ProductPage({
  product,
  onAdd,
  ...props
}: { product: Product; onAdd: Add } & BrowseProps) {
  const cat = categories.find((c) => c.id === product.category)!;
  const [config, setConfig] = useState(() =>
    configFromParams(product, new URLSearchParams(location.search)),
  );
  useEffect(() => {
    history.replaceState(null, "", `${product.path}?${configParams(config)}`);
  }, [product.path, config]);
  const [view, setView] = useState(0);
  const [modal, setModal] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isCard = product.category === "cards";
  const images = [
    product.image,
    isCard ? "cards" : product.image,
    isCard ? "flyer" : product.image,
  ];
  return (
    <div className="container product-page">
      <Breadcrumbs
        items={[{ name: cat.name, href: cat.path }, { name: product.name }]}
      />
      <div className="product-layout">
        <div className="gallery">
          <button
            className={`main-product-image gallery-view-${view}`}
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
              setModal("zoom");
            }}
            aria-label={`Expand ${product.name} image`}
          >
            <img
              src={`/assets/${images[view]}.svg`}
              alt={`Original ${product.name} sample, view ${view + 1}`}
            />
            <span className="expand-icon">
              <Icon name="expand" size={19} />
            </span>
          </button>
          <div className="thumbnails" aria-label="Product images">
            {images.map((image, i) => (
              <button
                key={i}
                aria-label={`View product image ${i + 1}`}
                aria-pressed={view === i}
                className={view === i ? "selected" : ""}
                onClick={() => setView(i)}
              >
                <img src={`/assets/${image}.svg`} alt="" />
              </button>
            ))}
          </div>
          <p className="image-note">
            Original sample artwork · product imagery replacement
          </p>
        </div>
        <div className="product-options">
          <p className="eyebrow">Make a lasting impression</p>
          <h1>{product.name}</h1>
          <a href="#product-reviews" className="review-link">
            <span className="stars" aria-hidden="true">
              ★★★★★
            </span>{" "}
            {product.rating}{" "}
            <span className="muted">({product.reviews} reviews)</span>
          </a>
          <p className="product-description">
            {isCard
              ? "A professional introduction, with your own personal touch."
              : "Everyday essentials with a little more you."}
          </p>
          <ul className="product-features">
            <li>
              {isCard
                ? "Choose from original designs and make one your own."
                : "Personalise a sample with your business identity."}
            </li>
            <li>
              {isCard
                ? "Glossy and matte finishes available."
                : "A thoughtful addition to your next project."}
            </li>
            <li>
              Need a hand? <a href="/services/design">Explore design support</a>
            </li>
          </ul>
          <Configurator
            product={product}
            config={config}
            onChange={setConfig}
            onAdd={onAdd}
            onUpload={() => {
              history.pushState(
                null,
                "",
                `/editor?product=${product.id}&upload=1&${configParams(config)}`,
              );
              window.dispatchEvent(new Event("popstate"));
            }}
          />
          <div className="product-assurance">
            <Icon name="check" size={18} />
            <span>Make it yours, one detail at a time.</span>
          </div>
        </div>
      </div>
      <section className="product-details section">
        <h2>
          A little more about your {isCard ? "visiting cards" : "product"}
        </h2>
        <p>
          Explore the details, choose your options and preview a design. This
          local catalogue uses original artwork and example configurations.
        </p>
        <details>
          <summary>
            Specs & Templates
            <Icon name="plus" size={18} />
          </summary>
          <div>
            <p>
              {isCard
                ? "Sample finished size: 89 × 51 mm. Keep important text inside the safe area and extend backgrounds into the bleed."
                : "Dimensions and material options depend on the final product. The illustrations here are examples only."}
            </p>
            <a href={`${product.path}/templates`}>Explore original templates</a>
          </div>
        </details>
        <details>
          <summary>
            Product Options
            <Icon name="plus" size={18} />
          </summary>
          <div>
            <p>
              Change the quantity{isCard ? ", paper stock and corners" : ""}{" "}
              above to see a sample price. Same-day delivery adds a fixed demo
              fee; postcode eligibility is not checked.
            </p>
          </div>
        </details>
        <details>
          <summary>
            Frequently asked questions
            <Icon name="plus" size={18} />
          </summary>
          <div>
            <h3>Can I use my own design?</h3>
            <p>
              Uploads are not connected in this local study. You can personalise
              the business name in an original sample template.
            </p>
            <h3>Will this place an order?</h3>
            <p>No. Your sample configuration stays in this browser.</p>
          </div>
        </details>
      </section>
      <section id="product-reviews" className="section reviews-section">
        <h2>Customer reviews</h2>
        <div className="review-summary">
          <strong>{product.rating}</strong>
          <span>
            <span className="stars">★★★★★</span>
            <br />
            {product.reviews}{" "}
            {product.id === "standard"
              ? "reviews in the reference snapshot"
              : "sample reviews"}
          </span>
        </div>
        <p className="muted">
          Ratings outside the inspected standard card are sample values.
          Customer review text and live review filtering are not reproduced.
        </p>
      </section>
      <ProductRail
        title="You might also like"
        items={products
          .filter((p) => p.category === product.category && p.id !== product.id)
          .slice(0, 8)}
        {...props}
      />
      {modal === "zoom" && (
        <Modal
          title={product.name}
          onClose={() => setModal("")}
          className="image-modal"
        >
          <div
            className="zoom-stage"
            tabIndex={0}
            aria-label="Product image. Use plus and minus to zoom, arrow keys to pan."
            onKeyDown={(e) => {
              if (
                [
                  "+",
                  "=",
                  "-",
                  "ArrowLeft",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowDown",
                ].includes(e.key)
              ) {
                e.preventDefault();
                if (e.key === "+" || e.key === "=")
                  setZoom((z) => Math.min(3, z + 0.25));
                else if (e.key === "-") setZoom((z) => Math.max(1, z - 0.25));
                else
                  setPan((p) => ({
                    x:
                      p.x +
                      (e.key === "ArrowLeft"
                        ? 20
                        : e.key === "ArrowRight"
                          ? -20
                          : 0),
                    y:
                      p.y +
                      (e.key === "ArrowUp"
                        ? 20
                        : e.key === "ArrowDown"
                          ? -20
                          : 0),
                  }));
              }
            }}
          >
            <img
              style={{
                transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
              }}
              src={`/assets/${images[view]}.svg`}
              alt={`Expanded original ${product.name} illustration`}
            />
          </div>
          <div className="zoom-controls">
            <button
              className="icon-button"
              aria-label="Zoom out"
              disabled={zoom <= 1}
              onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
            >
              <Icon name="minus" />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button
              className="icon-button"
              aria-label="Zoom in"
              disabled={zoom >= 3}
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            >
              <Icon name="plus" />
            </button>
            <button
              className="text-button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
            >
              Reset
            </button>
          </div>
          <p className="muted">Use + / − to zoom and arrow keys to pan.</p>
        </Modal>
      )}
    </div>
  );
}
function Gallery({
  product,
  onAdd,
  ...props
}: { product: Product; onAdd: Add } & BrowseProps) {
  const config = configFromParams(
    product,
    new URLSearchParams(location.search),
  );
  const [listing, setListing] = useListingState("gallery");
  const { query, filters, sort, page } = listing;
  const setQuery = (query: string) => setListing({ query, page: 1 });
  const setFilters = (
    value:
      | Record<string, string[]>
      | ((old: Record<string, string[]>) => Record<string, string[]>),
  ) =>
    setListing({
      filters: typeof value === "function" ? value(listing.filters) : value,
      page: 1,
    });
  const setSort = (sort: string) => setListing({ sort, page: 1 });
  const setPage = (page: number | ((old: number) => number)) =>
    setListing({
      page: typeof page === "function" ? page(listing.page) : page,
    });
  const [filterOpen, setFilterOpen] = useState(false);
  const [preview, setPreview] = useState<Template | null>(null);
  const [name, setName] = useState("");
  const filtered = filterTemplates(templates, query, filters).sort((a, b) =>
    sort === "name"
      ? a.name.localeCompare(b.name)
      : sort === "newest"
        ? Number(b.id.split("-")[1]) - Number(a.id.split("-")[1])
        : 0,
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 9));
  const actualPage = Math.min(page, pages);
  const selected = Object.values(filters).flat().length;
  const toggle = (key: string, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: (current[key] || []).includes(value)
        ? current[key].filter((x) => x !== value)
        : [...(current[key] || []), value],
    }));
  };
  const filterContent = (
    <>
      <div className="filter-heading">
        <h2>Filter by</h2>
        <button
          className="text-button"
          onClick={() => {
            setFilters({});
          }}
          disabled={!selected}
        >
          Clear all
        </button>
      </div>
      {Object.entries({
        colour: ["Green", "Cream", "Black", "Blue"],
        orientation: ["Horizontal", "Vertical"],
        theme: ["Minimal", "Bold & Colourful", "Elegant"],
        industry: [
          "Arts & Design",
          "Professional Services",
          "Beauty & Spa",
          "Food & Beverage",
        ],
      }).map(([key, values]) => (
        <fieldset className="filter-fieldset" key={key}>
          <legend>
            {key === "colour"
              ? "Design colour"
              : key === "orientation"
                ? "Product orientation"
                : key === "theme"
                  ? "Styles & themes"
                  : "Industry"}
          </legend>
          {values.map((value) => (
            <label key={value}>
              <input
                type="checkbox"
                checked={(filters[key] || []).includes(value)}
                onChange={() => toggle(key, value)}
              />
              {key === "colour" && (
                <i className={`colour-dot ${value.toLowerCase()}`} />
              )}
              <span>{value}</span>
            </label>
          ))}
        </fieldset>
      ))}
    </>
  );
  return (
    <div className="container gallery-page">
      <Breadcrumbs
        items={[
          {
            name: categories.find((c) => c.id === product.category)!.name,
            href: categories.find((c) => c.id === product.category)!.path,
          },
          { name: product.name, href: product.path },
          { name: "Templates" },
        ]}
      />
      <div className="page-heading">
        <h1>
          {product.category === "cards"
            ? "Visiting Cards Designs & Templates"
            : `${product.name} Designs`}
        </h1>
        <p className="muted">
          Find a look that fits your business — and make it your own.
        </p>
      </div>
      <div className="gallery-toolbar">
        <label className="template-search">
          <Icon name="search" size={20} />
          <input
            aria-label="Search templates"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            placeholder="Search templates"
          />
          {query && (
            <button
              className="icon-button"
              aria-label="Clear template search"
              onClick={() => {
                setQuery("");
              }}
            >
              <Icon name="close" size={17} />
            </button>
          )}
        </label>
        <button
          className="button secondary filter-toggle"
          onClick={() => setFilterOpen(true)}
        >
          <Icon name="filter" size={18} />
          Filters{selected ? ` (${selected})` : ""}
        </button>
        <label className="sort-label">
          Sort by
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
            }}
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="name">Name: A–Z</option>
          </select>
        </label>
      </div>
      <div className="gallery-layout">
        <aside className="filters" aria-label="Template filters">
          {filterContent}
        </aside>
        <div className="gallery-results">
          <div className="results-heading">
            <p role="status">
              <strong>{filtered.length}</strong> original designs
            </p>
            <span className="muted">Local sample collection</span>
          </div>
          {selected > 0 && (
            <div className="filter-chips">
              {Object.entries(filters).flatMap(([key, values]) =>
                values.map((value) => (
                  <button
                    key={value}
                    onClick={() => toggle(key, value)}
                    aria-label={`Remove ${value} filter`}
                  >
                    {value}
                    <Icon name="close" size={13} />
                  </button>
                )),
              )}
            </div>
          )}
          {filtered.length ? (
            <>
              <div className="template-grid">
                {filtered
                  .slice((actualPage - 1) * 9, actualPage * 9)
                  .map((t) => (
                    <article className="template-card" key={t.id}>
                      <div className="template-image">
                        <button
                          className="template-open"
                          aria-label={`Preview ${t.name} ${t.id}`}
                          onClick={() => {
                            setPreview(t);
                            setName("");
                          }}
                        >
                          <TemplateArt template={t} product={product} />
                          <span className="preview-label">
                            Preview design <Icon name="expand" size={15} />
                          </span>
                        </button>
                        <button
                          className={`save-button ${props.saved.includes(t.id) ? "saved" : ""}`}
                          aria-label={`${props.saved.includes(t.id) ? "Remove" : "Save"} ${t.id}`}
                          aria-pressed={props.saved.includes(t.id)}
                          onClick={() => props.onSave(t.id)}
                        >
                          <Icon name="heart" size={18} />
                        </button>
                      </div>
                      <div className="template-caption">
                        <strong>{t.name}</strong>
                        <span>
                          {t.theme} · {t.orientation}
                        </span>
                      </div>
                    </article>
                  ))}
              </div>
              <nav aria-label="Template pages" className="pagination">
                <button
                  className="round-button"
                  disabled={actualPage === 1}
                  aria-label="Previous page"
                  onClick={() => setPage((p) => p - 1)}
                >
                  <Icon name="left" size={18} />
                </button>
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    key={i}
                    aria-current={actualPage === i + 1 ? "page" : undefined}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="round-button"
                  disabled={actualPage === pages}
                  aria-label="Next page"
                  onClick={() => setPage((p) => p + 1)}
                >
                  <Icon name="right" size={18} />
                </button>
              </nav>
            </>
          ) : (
            <EmptyState icon="search" title="No designs found">
              <p>Try a different search or remove a filter.</p>
              <button
                className="button secondary"
                onClick={() => {
                  setListing({ query: "", filters: {}, page: 1 });
                }}
              >
                Reset search and filters
              </button>
            </EmptyState>
          )}
        </div>
      </div>
      {filterOpen && (
        <Modal
          title="Filter designs"
          onClose={() => setFilterOpen(false)}
          className="filter-modal"
        >
          {filterContent}
          <button
            className="button primary full"
            onClick={() => setFilterOpen(false)}
          >
            Show {filtered.length} designs
          </button>
        </Modal>
      )}
      {preview && (
        <Preview
          template={preview}
          product={product}
          configuration={config}
          name={name}
          setName={setName}
          onClose={() => setPreview(null)}
          onAdd={() => {
            onAdd(
              product,
              config,
              `${preview.name}${name.trim() ? ` · ${name.trim()}` : ""}`,
            );
            setPreview(null);
          }}
        />
      )}
    </div>
  );
}
function Preview({
  template,
  product,
  configuration,
  name,
  setName,
  onClose,
  onAdd,
}: {
  template: Template;
  product?: Product;
  configuration?: Config;
  name: string;
  setName: (s: string) => void;
  onClose: () => void;
  onAdd: () => void;
}) {
  return (
    <Modal
      title="Make a good introduction"
      onClose={onClose}
      className="preview-modal"
    >
      <div className="preview-layout">
        <TemplateArt template={template} name={name} product={product} />
        <div>
          <p className="eyebrow">Original sample design</p>
          <h3>{template.name}</h3>
          <label>
            Business name
            <input
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              placeholder={template.name}
            />
          </label>
          <p className="muted">
            Try your name on this original layout. This is a local preview, not
            the VistaPrint design editor.
          </p>
          <a
            className="button secondary full"
            href={`/editor?product=${product?.id || "standard"}&template=${template.id}&${configParams(configuration || defaultConfig(product || products[0]))}`}
          >
            Open local design editor
          </a>
          <button className="button primary full" onClick={onAdd}>
            Add sample to cart <Icon name="cart" size={19} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
function SearchPage(props: BrowseProps) {
  const [listing, setListing] = useListingState("search");
  const { query, sort, category } = listing;
  const setSort = (sort: string) => setListing({ sort, page: 1 });
  const setCategory = (category: string) => setListing({ category, page: 1 });
  const results = searchProducts(products, query)
    .filter((p) => category === "all" || p.category === category)
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : 0,
    );
  return (
    <div className="container search-page">
      <Breadcrumbs items={[{ name: "Search" }]} />
      <div className="page-heading">
        <h1>{query ? `Results for “${query}”` : "Explore our products"}</h1>
        <p className="muted">Find something for your next big idea.</p>
      </div>
      <div className="results-toolbar">
        <p role="status">{results.length} products</p>
        <label>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="relevance">Featured</option>
            <option value="low">Price: Low to high</option>
            <option value="high">Price: High to low</option>
          </select>
        </label>
      </div>
      {results.length ? (
        <ProductGrid items={results} {...props} />
      ) : (
        <EmptyState title="No products found" icon="search">
          <p>Try “cards”, “mugs” or “shirts”, or explore all categories.</p>
          <a className="button primary" href="/search">
            Browse all products
          </a>
        </EmptyState>
      )}
      <p className="local-note">
        Search uses the local sample catalogue. Results and ranking are
        simulated.
      </p>
    </div>
  );
}
function Favourites({ saved, onSave, onAdd }: BrowseProps & { onAdd: Add }) {
  const items = products.filter((p) => saved.includes(p.id));
  const designs = templates.filter((t) => saved.includes(t.id));
  const [preview, setPreview] = useState<Template | null>(null);
  const [name, setName] = useState("");
  return (
    <div className="container favourites-page">
      <Breadcrumbs items={[{ name: "My Favourites" }]} />
      <div className="page-heading">
        <h1>My Favourites</h1>
        <p className="muted">
          A little inspiration, saved for later in this browser.
        </p>
      </div>
      {!items.length && !designs.length ? (
        <EmptyState title="Find something you love" icon="heart">
          <p>Tap the heart on a product or design to save it here.</p>
          <a className="button primary" href="/">
            Explore products
          </a>
        </EmptyState>
      ) : (
        <>
          <ProductGrid items={items} saved={saved} onSave={onSave} />
          {designs.length > 0 && (
            <section className="section">
              <h2>Your saved designs</h2>
              <div className="template-grid">
                {designs.map((t) => (
                  <article key={t.id} className="template-card">
                    <button
                      className="template-open"
                      aria-label={`Preview saved ${t.name}`}
                      onClick={() => {
                        setPreview(t);
                        setName("");
                      }}
                    >
                      <TemplateArt template={t} />
                    </button>
                    <div className="template-caption">
                      <strong>{t.name}</strong>
                      <button
                        className="text-button"
                        onClick={() => onSave(t.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
      {preview && (
        <Preview
          template={preview}
          name={name}
          setName={setName}
          onClose={() => setPreview(null)}
          onAdd={() => {
            onAdd(
              products[0],
              defaultConfig(products[0]),
              `${preview.name}${name ? ` · ${name}` : ""}`,
            );
            setPreview(null);
          }}
        />
      )}
    </div>
  );
}
function Help() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All topics");
  const articles = helpArticles.filter(
    (a) =>
      (topic === "All topics" || a.topic === topic) &&
      `${a.title} ${a.answer}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  return (
    <>
      <section className="help-hero">
        <div className="container">
          <p className="eyebrow">A little guidance goes a long way</p>
          <h1>Help is here.</h1>
          <label className="help-search">
            <Icon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for articles"
              aria-label="Search help articles"
            />
            {query && (
              <button
                className="icon-button"
                aria-label="Clear help search"
                onClick={() => setQuery("")}
              >
                <Icon name="close" size={18} />
              </button>
            )}
          </label>
          <p>Looking for your next step? Let’s find it together.</p>
        </div>
      </section>
      <div className="container help-content">
        <div className="section-heading">
          <h2>Browse Help Centre</h2>
        </div>
        <div className="help-topics" role="group" aria-label="Help topics">
          {[
            "All topics",
            "Orders & delivery",
            "Product information",
            "Design & Print",
            "Account & billing",
          ].map((t) => (
            <button
              key={t}
              aria-pressed={t === topic}
              className={t === topic ? "selected" : ""}
              onClick={() => setTopic(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <section className="section help-articles">
          <h2>{query ? "Search results" : "Popular questions"}</h2>
          <p className="muted" role="status">
            {articles.length} local help articles
          </p>
          {articles.length ? (
            articles.map((a) => (
              <details key={a.title}>
                <summary>
                  {a.title}
                  <Icon name="plus" size={20} />
                </summary>
                <p>{a.answer}</p>
              </details>
            ))
          ) : (
            <p>No articles matched. Try another search or topic.</p>
          )}
        </section>
        <div className="help-contact">
          <Icon name="help" size={35} />
          <div>
            <h2>A note about this Help Centre</h2>
            <p>
              These answers explain the local demo. For official support, visit{" "}
              <a href="https://www.vistaprint.in/customer-care/help-centre/">
                VistaPrint’s Help Centre
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
function Sale(props: BrowseProps) {
  return (
    <div className="container sale-page">
      <Breadcrumbs items={[{ name: "Diwali Gifting Sale" }]} />
      <div className="sale-intro">
        <p className="eyebrow">A little thought. A lasting connection.</p>
        <h1>
          Celebrate the people
          <br />
          who make it possible.
        </h1>
        <p>Thoughtful gifts, personalised for your team and your everyday.</p>
        <span className="sale-pill">Diwali gifting · Sample collection</span>
      </div>
      <section className="section">
        <h2>Make their day, your way.</h2>
        <p className="muted section-subtitle">
          A selection of gifts and everyday favourites.
        </p>
        <ProductGrid
          items={products.filter((p) =>
            ["gifts", "polos", "winter", "stationery"].includes(p.category),
          )}
          {...props}
        />
      </section>
      <details className="sale-faq">
        <summary>
          About the sale shown here
          <Icon name="plus" size={18} />
        </summary>
        <p>
          The reference promotion linked to a Diwali gifting assortment. This
          local version uses example prices and does not apply real promotional
          offers.
        </p>
      </details>
    </div>
  );
}
function Boundary({ path }: { path: string }) {
  const account = path.startsWith("/my-account");
  return (
    <div className="container boundary-page">
      <Breadcrumbs
        items={[{ name: account ? "My Account" : "More information" }]}
      />
      {account && (
        <nav className="account-tabs" aria-label="Account sections">
          <a href="/my-account/">Dashboard</a>
          <a href="/my-account/projects">My Projects</a>
          <a href="/favourites">My Favourites</a>
        </nav>
      )}
      <EmptyState
        icon={account ? "user" : "help"}
        title={
          account ? "Your workspace starts here" : "About this local recreation"
        }
      >
        <p>
          {account
            ? "Account access is outside this local UI study. No credentials or personal data are collected."
            : "This service or information page is outside the inspected page coverage. No request is submitted from this screen."}
        </p>
        <p>
          You can browse products, save favourites and try sample designs
          without an account.
        </p>
        <div className="button-row">
          <a className="button primary" href="/">
            Explore products
          </a>
          <a className="button secondary" href="/favourites">
            My Favourites
          </a>
        </div>
      </EmptyState>
    </div>
  );
}
