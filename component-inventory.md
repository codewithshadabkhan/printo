# Component inventory

Shared components are planned before implementation; final locations are in src/components.tsx and src/App.tsx.

| Component       | Content / responsibilities                                               | Reference evidence                                  |
| --------------- | ------------------------------------------------------------------------ | --------------------------------------------------- |
| SiteHeader      | logo replacement, search, utility links, desktop categories, menu drawer | named controls/links O-text; layout E               |
| PromotionBar    | sale message and sale route                                              | O-text, one slide; no observed autoplay             |
| MegaMenu        | category/product groups, keyboard and pointer opening                    | nested links O-text; activation E                   |
| MobileMenu      | modal navigation with category expansion                                 | E; behaviour unverified                             |
| SearchForm      | query entry, explicit submission, clear; local matching                  | field O-text, results S                             |
| Breadcrumbs     | semantic ordered path links                                              | gallery O-text                                      |
| CategoryTile    | original 4:5 product illustration, title, link                           | content/image links O-text                          |
| ProductCard     | artwork, price/quantity, link, favourite control                         | content O-text; favourite state S                   |
| ProductRail     | horizontal scroll, previous/next, disabled boundary buttons              | slide counters O-text; precise behaviour E          |
| CategoryPage    | reusable heading, group links, product grids                             | two categories O-text; others S                     |
| ProductPage     | media gallery, thumbnail selection, options, price, actions              | control names O-text, values/pricing S              |
| TemplateGallery | search, filter groups/chips, pagination, sort, saved previews            | filters O-text; sort/algorithm S                    |
| PreviewDialog   | original card visual, name preview, cart action                          | S; not the proprietary editor                       |
| CartPage        | line-item groups, quantities, removal, totals, empty state               | reference shell only; S                             |
| HelpPage        | article search/topic buttons and expandable answers                      | topic/search existence O-text; answer copy original |
| AccessBoundary  | account/projects/service limitation information                          | account shell O-text                                |
| SiteFooter      | guarantee, three grouped links, country, payment text, legal             | O-text; responsive visibility E                     |
| Modal / Toast   | native dialog focus handling, live-region feedback                       | E/S; no claimed reference parity                    |

## Accessibility conventions

Native buttons/anchors, labels/selects/checkboxes, semantic landmarks, skip link, aria-expanded/disclosure relationships, visible focus, dialog focus restoration/Escape, minimum 44px interactive targets where layout allows, alt text for original product artwork, current page indicators, reduced-motion support. Colour is accompanied by selected text or radio state.

Phase 4 implementation locations: central configuration/price/design/cart/storage/service modules feed reusable `ConfigFields`, `Configurator`, `EditorPage`, `CartPage`, `AccountPage`, `CheckoutPage`, `OrdersPage` and `Totals` in `src/functional-ui.tsx`. `src/url-state.ts` owns list query restoration. The previous pre-Phase-4 upload/checkout boundary descriptions are superseded for these explicit local routes.
