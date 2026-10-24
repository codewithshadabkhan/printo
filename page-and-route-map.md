# Page and route map

All reference URLs use https://www.vistaprint.in. Inspection is text-only unless stated. Query strings on the gallery are supported locally.

| Template         | Reference route                                    | How discovered        | Reference status          | Local scope                                         |
| ---------------- | -------------------------------------------------- | --------------------- | ------------------------- | --------------------------------------------------- |
| Home             | /                                                  | supplied URL          | O-text header to footer   | implemented                                         |
| Category         | /business-cards                                    | primary nav           | O-text                    | implemented shape/paper sections                    |
| Category         | /signs-posters                                     | primary nav           | O-text                    | implemented topic/products                          |
| Product          | /business-cards/standard                           | popular tile/category | O-text, options loading   | implemented mock options                            |
| Gallery          | /business-cards/standard/templates                 | product browse action | O-text, older crawl       | implemented original templates/filter/page/preview  |
| Sale listing     | /diwali-gifting-sale                               | promotion             | O-text                    | implemented mock assortment                         |
| Help             | /customer-care/help-centre/                        | utility help          | O-text                    | implemented local articles/search                   |
| Cart             | /c/                                                | utility cart          | shell only                | simulated empty/filled cart                         |
| Account          | /my-account/                                       | sign in               | shell only                | local access-boundary page                          |
| Policy           | /copyright-and-trademark-complaints                | footer                | text available            | informational boundary page                         |
| Search           | actual endpoint unknown                            | visible search field  | guessed URL blocked       | /search?q=… is a local convention                   |
| Other categories | many header targets                                | link text             | discovered, not inspected | selected paths use category template with mock data |
| Other products   | many nested links                                  | link text             | discovered, not inspected | selected paths use generic product template         |
| Private/services | projects, favourites, editor, checkout, logo tools | navigation            | deferred/unverified       | local favourites; other destinations explain scope  |

## Selected local category paths

/business-cards, /clothing-bags/polo-t-shirts, /clothing-bags/shirts, /clothing-bags/t-shirts, /clothing-bags/winter-wear, /stamps, /signs-posters, /marketing-materials, /labels-stickers, /packaging, /stationery, /photo-gifts. Paths other than the two inspected categories are local conventions unless independently verified. Exact implemented products/paths are exported in src/data.ts.

## Navigation

Home → category tile/nav → category → product → gallery → preview dialog → mock cart.
Header search → local results → product. Utility favourites → saved mock products/designs. Help → local topics. Footer company links use real external destinations where known; unimplemented policy/service destinations show an explicit information page.
Direct navigation and refresh are handled by Vite SPA fallback and the provided production static server.

## Coverage boundaries

This is batch 1, not the entire catalogue. Hundreds of nested product links, their options, industry pages, design services, advice content, alternate locales and authenticated flows remain unverified. Unknown local paths return a useful not-found page rather than masquerading as reproduced pages.

Phase 4 additions: `/editor`, `/checkout`, `/order-confirmation`, `/my-account/orders`, and credential-free demo behaviour at `/my-account/`. These are independent local routes/flows; earlier local account/upload/checkout boundary entries describe the preceding batch. Exact query behaviour and current scope are in user-journeys.md and docs/implemented-routes.md.
