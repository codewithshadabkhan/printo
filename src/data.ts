export type Category = {
  id: string;
  name: string;
  short: string;
  path: string;
  image: string;
  description: string;
};
export const categories: Category[] = [
  {
    id: "cards",
    name: "Visiting Cards",
    short: "Visiting Cards",
    path: "/business-cards",
    image: "cards",
    description:
      "Make a memorable first impression with a card that feels like you.",
  },
  {
    id: "polos",
    name: "Custom Polo T-shirts",
    short: "Polo T-shirts",
    path: "/clothing-bags/polo-t-shirts",
    image: "polo",
    description:
      "Bring your team together with a professional, personalised look.",
  },
  {
    id: "shirts",
    name: "Custom Dress Shirts",
    short: "Office Shirts",
    path: "/clothing-bags/shirts",
    image: "shirt",
    description: "A smart canvas for your company identity.",
  },
  {
    id: "tees",
    name: "Custom T-shirts",
    short: "Printed T-shirts",
    path: "/clothing-bags/t-shirts",
    image: "tshirt",
    description: "Your next idea, made wearable.",
  },
  {
    id: "winter",
    name: "Custom Winter Wear",
    short: "Winter Wear",
    path: "/clothing-bags/winter-wear",
    image: "hoodie",
    description: "Stay comfortable and keep your brand in the picture.",
  },
  {
    id: "stamps",
    name: "Custom Stamps & Ink",
    short: "Stamps & Ink",
    path: "/stamps",
    image: "stamp",
    description: "Make everyday business a little easier.",
  },
  {
    id: "signs",
    name: "Signs & Posters",
    short: "Signs & Posters",
    path: "/signs-posters",
    image: "poster",
    description: "Get your message seen, inside and out.",
  },
  {
    id: "marketing",
    name: "Marketing Materials",
    short: "Marketing Materials",
    path: "/marketing-materials",
    image: "flyer",
    description: "Turn your big ideas into something people can hold.",
  },
  {
    id: "labels",
    name: "Labels & Stickers",
    short: "Labels & Stickers",
    path: "/labels-stickers",
    image: "stickers",
    description: "The finishing touch for everything you make.",
  },
  {
    id: "packaging",
    name: "Packaging",
    short: "Packaging",
    path: "/packaging",
    image: "packaging",
    description: "Give every delivery a memorable first impression.",
  },
  {
    id: "stationery",
    name: "Custom Stationery",
    short: "Stationery",
    path: "/stationery",
    image: "notebook",
    description: "Thoughtful details for your everyday work.",
  },
  {
    id: "gifts",
    name: "Photo Gifts",
    short: "Mugs, Albums & Gifts",
    path: "/photo-gifts",
    image: "mug",
    description: "Make a little room for your favourite memories.",
  },
];
export type Product = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
  path: string;
  rating: number;
  reviews: number;
  tag?: string;
};
const rows: [
  string,
  string,
  string,
  string,
  number,
  number,
  string?,
  string?,
][] = [
  [
    "standard",
    "Standard Visiting Cards",
    "cards",
    "cards",
    200,
    100,
    "/business-cards/standard",
  ],
  [
    "rounded",
    "Rounded Corner Visiting Cards",
    "cards",
    "cards",
    250,
    100,
    "/business-cards/rounded-corner",
  ],
  [
    "letterheads",
    "Letterheads",
    "stationery",
    "flyer",
    230,
    10,
    "/stationery/letterheads",
  ],
  [
    "albums",
    "Photo Albums",
    "gifts",
    "album",
    501,
    1,
    "/photo-gifts/photo-albums",
  ],
  ["stickers", "Custom Stickers", "labels", "stickers", 150, 10],
  ["hoodies", "Customised Hoodies", "winter", "hoodie", 972, 1],
  ["polo", "Men’s Polo T-Shirts", "polos", "polo", 531, 1],
  ["premium-polo", "Premium Polo T-Shirts", "polos", "polo", 720, 1],
  ["dress-shirt", "Men’s Dress Shirts", "shirts", "shirt", 945, 1],
  ["cotton-tee", "Men’s Cotton T-Shirts", "tees", "tshirt", 405, 1],
  ["self-inking", "Self Inking Stamps", "stamps", "stamp", 320, 1],
  ["mug", "Personalised Mugs", "gifts", "mug", 272, 1],
  ["tote", "Cotton Tote Bags", "packaging", "tote", 311, 1],
  [
    "classic",
    "Classic Visiting Cards",
    "cards",
    "cards",
    230,
    100,
    "/business-cards/classic",
  ],
  [
    "spot-uv",
    "Spot UV Visiting Cards",
    "cards",
    "cards",
    580,
    100,
    "/business-cards/spot-uv",
    "New options",
  ],
  ["jacket", "Puffer Jackets", "winter", "hoodie", 2205, 1],
  ["cap", "Embroidered Caps", "polos", "cap", 310, 1],
  ["notebook", "Personalised Notebooks", "stationery", "notebook", 248, 1],
  ["flyers", "Flyers", "marketing", "flyer", 150, 25],
  ["rubber-stamp", "Basic Rubber Stamps", "stamps", "stamp", 180, 1],
  ["sheet-stickers", "Sheet Stickers", "labels", "stickers", 160, 24],
  [
    "product-labels",
    "Product & Packaging Labels",
    "labels",
    "stickers",
    160,
    24,
  ],
  ["shape-stickers", "Custom Shape Stickers", "labels", "stickers", 190, 10],
  ["paper-bags", "Custom Paper Bags", "packaging", "packaging", 480, 10],
  ["gift-bags", "Premium Gift Bags", "packaging", "tote", 880, 10],
  ["boxes", "Tuck Top Boxes", "packaging", "packaging", 250, 10],
  ["brochures", "Brochures", "marketing", "flyer", 430, 25],
  ["posters", "Posters", "signs", "poster", 465, 1],
  ["banners", "Banners", "signs", "banner", 245, 1],
  ["standees", "Standees", "signs", "banner", 1750, 1],
  ["folders", "Presentation Folders", "stationery", "folder", 560, 10],
  ["bottles", "Custom Water Bottles", "gifts", "bottle", 490, 1],
  ["pens", "Personalised Pens", "stationery", "pen", 150, 5],
  ["frames", "Photo With Frame", "gifts", "frame", 264, 1],
  [
    "files",
    "Custom Document Files",
    "stationery",
    "folder",
    250,
    5,
    undefined,
    "New",
  ],
  [
    "mailer",
    "Full-Print Mailer Boxes",
    "packaging",
    "packaging",
    15750,
    500,
    undefined,
    "New",
  ],
  ["coffee", "Vacuum Coffee Mugs", "gifts", "mug", 700, 1, undefined, "New"],
  [
    "shaped",
    "Custom Shape Visiting Cards",
    "cards",
    "cards",
    800,
    100,
    "/business-cards/custom-shape",
    "New",
  ],
  [
    "square",
    "Square Visiting Cards",
    "cards",
    "cards",
    290,
    100,
    "/business-cards/square",
  ],
  [
    "glossy",
    "Glossy Visiting Cards",
    "cards",
    "cards",
    350,
    100,
    "/business-cards/glossy",
  ],
  [
    "matte",
    "Matte Visiting Cards",
    "cards",
    "cards",
    350,
    100,
    "/business-cards/matte",
  ],
  [
    "qr",
    "QR Code Visiting Cards",
    "cards",
    "cards",
    300,
    100,
    "/business-cards/qr-code",
  ],
];
export const products: Product[] = rows.map((r, i) => ({
  id: r[0],
  name: r[1],
  category: r[2],
  image: r[3],
  price: r[4],
  quantity: r[5],
  path: r[6] || `/products/${r[0]}`,
  rating: [4.4, 4.5, 4.6, 4.7, 4.8][i % 5],
  reviews: i === 0 ? 1831 : 28 + i * 7,
  tag: r[7],
}));
export const byId = (id: string) => products.find((p) => p.id === id);
export const assortment = (ids: string[]) =>
  ids.map(byId).filter((p): p is Product => !!p);
export const homeSections = [
  {
    title: "Our Most Popular Products",
    items: assortment([
      "standard",
      "rounded",
      "letterheads",
      "albums",
      "stickers",
      "hoodies",
      "polo",
      "dress-shirt",
      "cotton-tee",
      "self-inking",
      "mug",
      "tote",
    ]),
  },
  {
    title: "Trending",
    items: assortment([
      "classic",
      "spot-uv",
      "jacket",
      "cap",
      "premium-polo",
      "notebook",
      "flyers",
      "rubber-stamp",
    ]),
  },
  {
    title: "Labels, Stickers and Packaging",
    items: assortment([
      "sheet-stickers",
      "product-labels",
      "shape-stickers",
      "paper-bags",
      "gift-bags",
      "boxes",
    ]),
  },
  {
    title: "Explore More",
    items: assortment([
      "folders",
      "brochures",
      "posters",
      "banners",
      "standees",
      "frames",
      "bottles",
      "pens",
    ]),
  },
  {
    title: "New Arrivals",
    items: assortment([
      "files",
      "mailer",
      "coffee",
      "shaped",
      "notebook",
      "bottles",
    ]),
  },
];
export type Template = {
  id: string;
  name: string;
  colour: string;
  theme: string;
  orientation: string;
  industry: string;
};
export const templates: Template[] = Array.from({ length: 24 }, (_, i) => ({
  id: `design-${i + 1}`,
  name: [
    "Mira Studio",
    "The Good Company",
    "North & Co.",
    "Bloom Botanical",
    "Forma Architecture",
    "Everyday Creative",
  ][i % 6],
  colour: ["Green", "Cream", "Black", "Blue"][i % 4],
  theme: ["Minimal", "Bold & Colourful", "Elegant"][i % 3],
  orientation: i % 5 === 0 ? "Vertical" : "Horizontal",
  industry: [
    "Arts & Design",
    "Professional Services",
    "Beauty & Spa",
    "Food & Beverage",
  ][i % 4],
}));
export const helpArticles = [
  {
    title: "How can I track my order?",
    topic: "Orders & delivery",
    answer:
      "This local study does not connect to order tracking. On a real store, your order history and dispatch email are the places to check delivery progress.",
  },
  {
    title: "Can I change or cancel an order?",
    topic: "Orders & delivery",
    answer:
      "No real orders are created here. You can freely change quantities and remove sample items from your local cart.",
  },
  {
    title: "What delivery options are available?",
    topic: "Orders & delivery",
    answer:
      "The product page demonstrates standard and same-day delivery selections. Availability and delivery estimates are simulated and are not checked against a postcode.",
  },
  {
    title: "Is there support for bulk orders?",
    topic: "Product information",
    answer:
      "Explore the quantity selector to preview example volume pricing. The values here are illustrative; no quotation or bulk enquiry is submitted.",
  },
  {
    title: "How do I prepare a visiting card design?",
    topic: "Design & Print",
    answer:
      "Keep important information away from the edges, use clear text and check your spelling. Our original sample card preview lets you try a business name without uploading a file.",
  },
  {
    title: "Where are my saved designs?",
    topic: "Design & Print",
    answer:
      "Use the heart on a design or product to save it in this browser. Open My Favourites to find it again. Browser storage is used instead of an account.",
  },
  {
    title: "How do payments work?",
    topic: "Account & billing",
    answer:
      "There is no payment collection in this local recreation. The cart stops at an informational review dialog.",
  },
  {
    title: "What if I need help with a product?",
    topic: "Product information",
    answer:
      "Browse the sample product details and specifications. These articles are written for this local study and do not represent official VistaPrint customer support.",
  },
];
