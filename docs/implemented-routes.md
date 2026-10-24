# Implemented route inventory

Generated from the local catalogue. Product/category/galleries outside inspected reference routes use mock data and original artwork. All gallery actions are local simulations.

Counts: 12 category routes, 42 product routes, 42 gallery routes, 24 original sample designs.

## Shared/secondary routes

| Route                                                   | Local behaviour                     | Reference verification                   |
| ------------------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| /                                                       | Homepage and five product rails     | text/link structure inspected            |
| /search?q=cards                                         | local search/category/sort          | search endpoint unverified               |
| /favourites                                             | browser-local products/designs      | reference favourite behaviour unverified |
| /c/                                                     | local cart and review boundary      | reference shell only                     |
| /customer-care/help-centre/                             | original help answers/search/topics | reference topic names inspected          |
| /diwali-gifting-sale                                    | sample gift assortment              | reference linked assortment inspected    |
| /my-account/ and /my-account/projects                   | access-boundary information         | account shell only                       |
| /services/design and /services/bulk                     | service-boundary information        | actual service flow unverified           |
| /information/\* and /copyright-and-trademark-complaints | scope-boundary information          | no policy text copied                    |
| unknown routes                                          | not-found screen                    | local behaviour                          |

## Categories

| Route                        | Title                | Reference                      |
| ---------------------------- | -------------------- | ------------------------------ |
| /business-cards              | Visiting Cards       | text inspected                 |
| /clothing-bags/polo-t-shirts | Custom Polo T-shirts | local convention / uninspected |
| /clothing-bags/shirts        | Custom Dress Shirts  | local convention / uninspected |
| /clothing-bags/t-shirts      | Custom T-shirts      | local convention / uninspected |
| /clothing-bags/winter-wear   | Custom Winter Wear   | local convention / uninspected |
| /stamps                      | Custom Stamps & Ink  | local convention / uninspected |
| /signs-posters               | Signs & Posters      | text inspected                 |
| /marketing-materials         | Marketing Materials  | local convention / uninspected |
| /labels-stickers             | Labels & Stickers    | local convention / uninspected |
| /packaging                   | Packaging            | local convention / uninspected |
| /stationery                  | Custom Stationery    | local convention / uninspected |
| /photo-gifts                 | Photo Gifts          | local convention / uninspected |

## Products and galleries

Each listed product also supports a local gallery at its path plus /templates. Quantity, stock, corners and delivery query parameters are accepted where appropriate.

| Product route                  | Product                       | Reference                                     |
| ------------------------------ | ----------------------------- | --------------------------------------------- |
| /business-cards/standard       | Standard Visiting Cards       | text inspected; live options unavailable      |
| /business-cards/rounded-corner | Rounded Corner Visiting Cards | local template; individual product unverified |
| /stationery/letterheads        | Letterheads                   | local template; individual product unverified |
| /photo-gifts/photo-albums      | Photo Albums                  | local template; individual product unverified |
| /products/stickers             | Custom Stickers               | local template; individual product unverified |
| /products/hoodies              | Customised Hoodies            | local template; individual product unverified |
| /products/polo                 | Men’s Polo T-Shirts           | local template; individual product unverified |
| /products/premium-polo         | Premium Polo T-Shirts         | local template; individual product unverified |
| /products/dress-shirt          | Men’s Dress Shirts            | local template; individual product unverified |
| /products/cotton-tee           | Men’s Cotton T-Shirts         | local template; individual product unverified |
| /products/self-inking          | Self Inking Stamps            | local template; individual product unverified |
| /products/mug                  | Personalised Mugs             | local template; individual product unverified |
| /products/tote                 | Cotton Tote Bags              | local template; individual product unverified |
| /business-cards/classic        | Classic Visiting Cards        | local template; individual product unverified |
| /business-cards/spot-uv        | Spot UV Visiting Cards        | local template; individual product unverified |
| /products/jacket               | Puffer Jackets                | local template; individual product unverified |
| /products/cap                  | Embroidered Caps              | local template; individual product unverified |
| /products/notebook             | Personalised Notebooks        | local template; individual product unverified |
| /products/flyers               | Flyers                        | local template; individual product unverified |
| /products/rubber-stamp         | Basic Rubber Stamps           | local template; individual product unverified |
| /products/sheet-stickers       | Sheet Stickers                | local template; individual product unverified |
| /products/product-labels       | Product & Packaging Labels    | local template; individual product unverified |
| /products/shape-stickers       | Custom Shape Stickers         | local template; individual product unverified |
| /products/paper-bags           | Custom Paper Bags             | local template; individual product unverified |
| /products/gift-bags            | Premium Gift Bags             | local template; individual product unverified |
| /products/boxes                | Tuck Top Boxes                | local template; individual product unverified |
| /products/brochures            | Brochures                     | local template; individual product unverified |
| /products/posters              | Posters                       | local template; individual product unverified |
| /products/banners              | Banners                       | local template; individual product unverified |
| /products/standees             | Standees                      | local template; individual product unverified |
| /products/folders              | Presentation Folders          | local template; individual product unverified |
| /products/bottles              | Custom Water Bottles          | local template; individual product unverified |
| /products/pens                 | Personalised Pens             | local template; individual product unverified |
| /products/frames               | Photo With Frame              | local template; individual product unverified |
| /products/files                | Custom Document Files         | local template; individual product unverified |
| /products/mailer               | Full-Print Mailer Boxes       | local template; individual product unverified |
| /products/coffee               | Vacuum Coffee Mugs            | local template; individual product unverified |
| /business-cards/custom-shape   | Custom Shape Visiting Cards   | local template; individual product unverified |
| /business-cards/square         | Square Visiting Cards         | local template; individual product unverified |
| /business-cards/glossy         | Glossy Visiting Cards         | local template; individual product unverified |
| /business-cards/matte          | Matte Visiting Cards          | local template; individual product unverified |
| /business-cards/qr-code        | QR Code Visiting Cards        | local template; individual product unverified |

All routes have SPA fallback support through the provided production request handler. No public deployment is configured.

## Phase 4 route additions and changes

| Route                                      | Behaviour                                                | Evidence                                           |
| ------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------- |
| /editor?product=standard&template=design-1 | Local front/back editor, file read, preview              | Independent simplified implementation              |
| /editor?product=standard&resume=1          | Resume explicit local draft                              | Independent browser storage rule                   |
| /checkout                                  | Guest/demo account, address, delivery, mock confirmation | Reference flow unverified                          |
| /order-confirmation?id=DEMO-…              | Local saved confirmation or unavailable state            | No real order                                      |
| /my-account/orders                         | Local snapshots and current-price reorder                | Reference navigation observed; outcomes unverified |
| /my-account/                               | Credential-free demo sign-in/out                         | Replaces the previous local-only account boundary  |

Category/list/gallery query parameters now restore local filter/sort/page state. Product options are centrally validated and retained in the URL. Account/service routes outside these selected additions remain scope-boundary pages.
