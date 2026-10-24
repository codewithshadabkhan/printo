import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { categories, products, type Product, type Template } from "./data";
import { money, searchProducts } from "./model";
export function Icon({
  name,
  size = 24,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const paths: Record<string, ReactNode> = {
    search: (
      <>
        <circle cx="10.7" cy="10.7" r="6.7" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7.5" r="3.5" />
        <path d="M4 21v-3a8 8 0 0 1 16 0v3" />
      </>
    ),
    cart: (
      <>
        <path d="m2 3 3 1 3 12h11l3-10H6" />
        <circle cx="9" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
      </>
    ),
    heart: (
      <path d="M12 21 3.5 12.7C-2 7.3 5.8.6 12 6.8 18.2.6 26 7.3 20.5 12.7Z" />
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9a3 3 0 1 1 5 2.3c-1.1.7-2 1-2 3M12 17v.1" />
      </>
    ),
    folder: <path d="M3 6h7l2 3h9v12H3ZM3 6V4h7l2 2h9v3" />,
    menu: <path d="M3 5h18M3 12h18M3 19h18" />,
    close: <path d="m5 5 14 14M5 19 19 5" />,
    right: <path d="m9 5 7 7-7 7" />,
    left: <path d="m15 5-7 7 7 7" />,
    down: <path d="m6 9 6 6 6-6" />,
    check: <path d="m4 12 5 5L20 6" />,
    plus: <path d="M12 4v16M4 12h16" />,
    minus: <path d="M4 12h16" />,
    trash: (
      <>
        <path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7" />
      </>
    ),
    filter: (
      <>
        <path d="M3 6h18M3 12h18M3 18h18" />
        <circle cx="8" cy="6" r="2" fill="white" />
        <circle cx="16" cy="12" r="2" fill="white" />
        <circle cx="9" cy="18" r="2" fill="white" />
      </>
    ),
    expand: <path d="M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    upload: (
      <>
        <path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.right}
    </svg>
  );
}
export function Modal({
  title,
  onClose,
  children,
  className = "",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-heading">
        <h2 id={id}>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function SearchForm({
  initial = "",
  compact = false,
}: {
  initial?: string;
  compact?: boolean;
}) {
  const [query, setQuery] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const id = compact ? "mobile-search" : "site-search";
  const suggestions = query.trim()
    ? searchProducts(products, query).slice(0, 5)
    : [];
  const choose = (path: string) => {
    setOpen(false);
    history.pushState(null, "", path);
    window.dispatchEvent(new Event("popstate"));
  };
  return (
    <div className="search-shell">
      <form
        className={`search-form ${compact ? "compact" : ""}`}
        action="/search"
        role="search"
      >
        <label className="sr-only" htmlFor={id}>
          Search products
        </label>
        <input
          id={id}
          name="q"
          maxLength={200}
          placeholder="Search for products"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={`${id}-suggestions`}
          aria-activedescendant={
            open && active >= 0 ? `${id}-suggestion-${active}` : undefined
          }
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setActive(-1);
            }
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
              setActive((i) =>
                suggestions.length
                  ? (i +
                      (e.key === "ArrowDown" ? 1 : -1) +
                      suggestions.length) %
                    suggestions.length
                  : -1,
              );
            }
            if (
              e.key === "Enter" &&
              open &&
              active >= 0 &&
              suggestions[active]
            ) {
              e.preventDefault();
              choose(suggestions[active].path);
            }
          }}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="clear-search"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setActive(-1);
              setOpen(false);
            }}
          >
            <Icon name="close" size={17} />
          </button>
        )}
        <button aria-label="Search products" className="search-submit">
          <Icon name="search" size={23} />
        </button>
      </form>
      <div
        id={`${id}-suggestions`}
        role="listbox"
        aria-label="Local product suggestions"
        className="search-suggestions"
        hidden={!open || !suggestions.length}
      >
        {suggestions.map((p, i) => (
          <button
            type="button"
            role="option"
            tabIndex={-1}
            id={`${id}-suggestion-${i}`}
            aria-selected={active === i}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(p.path)}
            key={p.id}
          >
            {p.name}
            <Icon name="right" size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}
const navGroups = [
  { name: "Visiting Cards", ids: ["cards"] },
  { name: "Signs & Marketing", ids: ["signs", "marketing"] },
  { name: "Stationery & Office", ids: ["stationery"] },
  { name: "Labels & Packaging", ids: ["labels", "packaging"] },
  { name: "Stamps & Ink", ids: ["stamps"] },
  { name: "Clothing & Bags", ids: ["polos", "shirts", "tees", "winter"] },
  { name: "Photo Gifts", ids: ["gifts"] },
  { name: "Drinkware", ids: ["gifts"] },
];
export function SiteHeader({
  cartCount,
  savedCount,
  route,
}: {
  cartCount: number;
  savedCount: number;
  route: string;
}) {
  const [menu, setMenu] = useState<number | null>(null);
  const [drawer, setDrawer] = useState(false);
  const wrap = useRef<HTMLElement>(null);
  useEffect(() => {
    setMenu(null);
    setDrawer(false);
  }, [route]);
  useEffect(() => {
    const listener = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node))
        setMenu(null);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const expanded = wrap.current?.querySelector<HTMLButtonElement>(
          '.nav-item[aria-expanded="true"]',
        );
        setMenu(null);
        expanded?.focus();
      }
    };
    document.addEventListener("pointerdown", listener);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", listener);
      document.removeEventListener("keydown", key);
    };
  }, []);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <header className="site-header" ref={wrap}>
        <div className="header-main">
          <button
            className="icon-button menu-toggle"
            aria-label="Open navigation menu"
            onClick={() => setDrawer(true)}
          >
            <Icon name="menu" />
          </button>
          <a
            className="wordmark"
            href="/"
            aria-label="VistaPrint local study home"
          >
            vista<span>print</span>
            <span className="brand-dot">•</span>
          </a>
          <div className="desktop-search">
            <SearchForm key={route} />
          </div>
          <div className="utility-links">
            <a className="help-link" href="/customer-care/help-centre/">
              <Icon name="help" />
              <span>
                Help is here<small>02522-669393</small>
              </span>
            </a>
            <a className="project-link" href="/my-account/projects">
              <Icon name="folder" />
              <span>My Projects</span>
            </a>
            <a className="favourites-link" href="/favourites">
              <Icon name="heart" />
              <span>My Favourites</span>
              {savedCount > 0 && (
                <b className="count small-count">{savedCount}</b>
              )}
            </a>
            <a className="account-link" href="/my-account/">
              <Icon name="user" />
              <span>Sign In</span>
            </a>
            <a className="cart-link" href="/c/">
              <span className="cart-icon">
                <Icon name="cart" />
                {cartCount > 0 && <b className="count">{cartCount}</b>}
              </span>
              <span>Cart</span>
            </a>
          </div>
        </div>
        <div className="mobile-search">
          <SearchForm key={route} compact />
        </div>
        <nav
          className="desktop-nav"
          aria-label="Product categories"
          onMouseLeave={() => setMenu(null)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node))
              setMenu(null);
          }}
        >
          <div className="nav-items">
            {navGroups.map((group, i) => (
              <button
                key={group.name}
                className={menu === i ? "nav-item active" : "nav-item"}
                aria-expanded={menu === i}
                aria-controls={`mega-${i}`}
                onMouseEnter={() => setMenu(i)}
                onClick={() => setMenu(menu === i ? null : i)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setMenu(i);
                    requestAnimationFrame(() =>
                      document
                        .querySelector<HTMLElement>(`#mega-${i} a`)
                        ?.focus(),
                    );
                  }
                }}
              >
                {group.name}
              </button>
            ))}
            <a className="nav-item" href="/services/design">
              Design Services
            </a>
            <a className="nav-item sale-link" href="/diwali-gifting-sale">
              Diwali Sale
            </a>
          </div>
          {menu !== null && (
            <div className="mega-menu" id={`mega-${menu}`}>
              <div>
                <p className="eyebrow">Make it yours</p>
                <h2>{navGroups[menu].name}</h2>
                <p className="muted">
                  Thoughtful products.
                  <br />A lasting impression.
                </p>
              </div>
              {navGroups[menu].ids.map((id) => {
                const cat = categories.find((c) => c.id === id)!;
                return (
                  <div className="mega-group" key={id}>
                    <a className="mega-title" href={cat.path}>
                      {cat.name} <Icon name="right" size={15} />
                    </a>
                    {products
                      .filter((p) => p.category === id)
                      .slice(0, 7)
                      .map((p) => (
                        <a key={p.id} href={p.path}>
                          {p.name}
                        </a>
                      ))}
                  </div>
                );
              })}
              <a
                className="mega-feature"
                href={
                  categories.find((c) => c.id === navGroups[menu].ids[0])!.path
                }
              >
                <img
                  src={`/assets/${categories.find((c) => c.id === navGroups[menu].ids[0])!.image}.svg`}
                  alt=""
                />
                <span>
                  Explore the collection <Icon name="arrow" size={18} />
                </span>
              </a>
            </div>
          )}
        </nav>
      </header>
      <div className="promotion">
        <span>
          The Diwali Gifting Sale is on <span className="promo-divider">|</span>{" "}
          <strong>Up to 30% off</strong>
        </span>
        <a href="/diwali-gifting-sale">
          Shop now <Icon name="right" size={14} />
        </a>
      </div>
      {drawer && (
        <Modal
          title="Explore our products"
          onClose={() => setDrawer(false)}
          className="menu-drawer"
        >
          <a className="drawer-home" href="/">
            Home <Icon name="right" size={18} />
          </a>
          {navGroups.map((group) => (
            <details key={group.name}>
              <summary>
                {group.name}
                <Icon name="down" size={18} />
              </summary>
              <div className="drawer-links">
                {group.ids.map((id) => {
                  const cat = categories.find((c) => c.id === id)!;
                  return (
                    <div key={id}>
                      <a className="bold" href={cat.path}>
                        Shop all {cat.name}
                      </a>
                      {products
                        .filter((p) => p.category === id)
                        .slice(0, 5)
                        .map((p) => (
                          <a key={p.id} href={p.path}>
                            {p.name}
                          </a>
                        ))}
                    </div>
                  );
                })}
              </div>
            </details>
          ))}
          <a className="drawer-home" href="/diwali-gifting-sale">
            Diwali Gifting Sale <Icon name="right" size={18} />
          </a>
          <a className="drawer-home" href="/my-account/projects">
            My Projects
          </a>
          <a className="drawer-home" href="/customer-care/help-centre/">
            Help Centre
          </a>
        </Modal>
      )}
    </>
  );
}
export function Breadcrumbs({
  items,
}: {
  items: { name: string; href?: string }[];
}) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <a href="/">Home</a>
        </li>
        {items.map((item, i) => (
          <li key={i}>
            <Icon name="right" size={11} />
            {item.href ? (
              <a href={item.href}>{item.name}</a>
            ) : (
              <span aria-current="page">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function ProductCard({
  product,
  saved,
  onSave,
}: {
  product: Product;
  saved: boolean;
  onSave: (id: string) => void;
}) {
  return (
    <article className="product-card">
      <div className="product-image">
        <a href={product.path} tabIndex={-1} aria-hidden="true">
          <img src={`/assets/${product.image}.svg`} alt="" loading="lazy" />
        </a>
        {product.tag && <span className="badge">{product.tag}</span>}
        <button
          className={`save-button ${saved ? "saved" : ""}`}
          aria-label={`${saved ? "Remove" : "Save"} ${product.name} ${saved ? "from" : "to"} favourites`}
          aria-pressed={saved}
          onClick={() => onSave(product.id)}
        >
          <Icon name="heart" size={19} />
        </button>
      </div>
      <div className="product-copy">
        <a className="product-name" href={product.path}>
          {product.name}
        </a>
        <div
          className="stars"
          aria-label={`${product.rating} out of 5, ${product.reviews} reviews`}
        >
          <span aria-hidden="true">★★★★★</span>
          <span className="rating-value">
            {product.rating} <span className="muted">({product.reviews})</span>
          </span>
        </div>
        <p className="product-price">
          {product.quantity} from <strong>{money(product.price)}</strong>
        </p>
      </div>
    </article>
  );
}
export function ProductRail({
  title,
  items,
  saved,
  onSave,
}: {
  title: string;
  items: Product[];
  saved: string[];
  onSave: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const id = useId();
  const update = () => {
    const el = ref.current;
    if (el)
      setEdges({
        start: el.scrollLeft < 4,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      });
  };
  useEffect(() => {
    const observer = new ResizeObserver(update);
    if (ref.current) observer.observe(ref.current);
    update();
    return () => observer.disconnect();
  }, []);
  const scroll = (direction: number) => {
    const el = ref.current;
    if (el)
      el.scrollBy({
        left: direction * (el.clientWidth + 24),
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  };
  return (
    <section className="section product-section" aria-labelledby={id}>
      <div className="section-heading">
        <h2 id={id}>{title}</h2>
        <div className="rail-arrows">
          <button
            aria-label={`Previous ${title}`}
            className="round-button"
            disabled={edges.start}
            onClick={() => scroll(-1)}
          >
            <Icon name="left" size={19} />
          </button>
          <button
            aria-label={`Next ${title}`}
            className="round-button"
            disabled={edges.end}
            onClick={() => scroll(1)}
          >
            <Icon name="right" size={19} />
          </button>
        </div>
      </div>
      <div className="product-rail" ref={ref} onScroll={update}>
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            saved={saved.includes(product.id)}
            onSave={onSave}
          />
        ))}
      </div>
      <p className="rail-hint">
        Scroll to explore <Icon name="arrow" size={16} />
      </p>
    </section>
  );
}
export function ProductGrid({
  items,
  saved,
  onSave,
}: {
  items: Product[];
  saved: string[];
  onSave: (id: string) => void;
}) {
  return (
    <div className="product-grid">
      {items.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          saved={saved.includes(p.id)}
          onSave={onSave}
        />
      ))}
    </div>
  );
}
export function TemplateArt({
  template,
  name,
  product,
}: {
  template: Template;
  name?: string;
  product?: Product;
}) {
  const text = name || template.name;
  if (product && product.category !== "cards")
    return (
      <div
        className={`merchandise-template colour-${template.colour.toLowerCase()}`}
      >
        <img
          src={`/assets/${product.image}.svg`}
          alt={`Original ${product.name} illustration`}
        />
        <div className="merchandise-identity">
          <span className="sample-name">{text}</span>
          <small>Identity preview · illustrative placement only</small>
        </div>
      </div>
    );
  return (
    <div
      className={`template-stage theme-${template.theme.split(" ")[0].toLowerCase()} colour-${template.colour.toLowerCase()} ${template.orientation === "Vertical" ? "vertical" : ""}`}
    >
      <div className="sample-card">
        <span className="sample-monogram" aria-hidden="true">
          {text.trim().slice(0, 1).toUpperCase() || "M"}
          <span>✳</span>
        </span>
        <div className="sample-name">{text}</div>
        <span className="sample-tagline">A GOOD INTRODUCTION.</span>
        <div className="sample-details">
          YOUR NAME · YOUR NEXT CHAPTER
          <br />
          hello@example.com
        </div>
        <span className="sample-line" />
      </div>
    </div>
  );
}
const footerGroups = [
  {
    title: "Let us help",
    links: [
      ["My Account", "/my-account/"],
      ["Contact us", "/customer-care/help-centre/"],
      ["Bulk Order Inquiry", "/services/bulk"],
    ],
  },
  {
    title: "Our Company",
    links: [
      ["Careers", "https://careers.vistaprint.com"],
      ["For investors", "https://ir.cimpress.com"],
      ["For media", "https://news.vistaprint.com"],
      ["Sustainability", "https://sustainability.vistaprint.com"],
      ["Annual Returns", "/information/annual-returns"],
      ["Corporate Social Responsibility", "/information/responsibility"],
    ],
  },
  {
    title: "Our policies",
    links: [
      ["Terms and Conditions", "/information/terms"],
      ["Vista Privacy and Cookie Policy", "/information/privacy"],
      ["Copyright matters", "/copyright-and-trademark-complaints"],
      ["Patents & trademarks", "/information/trademarks"],
    ],
  },
];
export function SiteFooter() {
  return (
    <footer>
      <div className="guarantee">
        <span className="guarantee-mark">
          <Icon name="check" size={30} />
        </span>
        <div>
          <strong>Easy Returns</strong>
          <p>
            <a href="/customer-care/help-centre/">
              Free Replacement or Full Refund
            </a>
          </p>
        </div>
      </div>
      <div className="footer-main">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="/" className="wordmark">
              vista<span>print</span>
              <span className="brand-dot">•</span>
            </a>
            <p>
              Ideas made real.
              <br />
              Your business made personal.
            </p>
          </div>
          {footerGroups.map((group) => (
            <details className="footer-group" open key={group.title}>
              <summary>
                {group.title}
                <Icon name="plus" size={18} />
              </summary>
              <div>
                {group.links.map(([label, href]) => (
                  <a key={label} href={href}>
                    {label}
                  </a>
                ))}
              </div>
            </details>
          ))}
        </div>
        <div className="footer-bottom">
          <div>
            <span className="country">🇮🇳 India · English</span>
            <p>A CIMPRESS company © 2001–2026 VistaPrint.</p>
            <p>
              Local UI study. Original replacement artwork. Not affiliated with
              VistaPrint.
            </p>
          </div>
          <div
            className="payment-marks"
            aria-label="Payment methods shown for visual reference only"
          >
            <span>VISA</span>
            <span>●●</span>
            <span>AMEX</span>
          </div>
        </div>
        <p className="footer-fineprint">
          Sample prices and product options are illustrative. This local
          recreation does not accept orders or payments.
        </p>
      </div>
    </footer>
  );
}
export function EmptyState({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={40} />
      </span>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
