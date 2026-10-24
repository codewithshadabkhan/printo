# Reference audit

Audit date: 2026-10-24. Reference: https://www.vistaprint.in/. Phase 1 completed before application implementation.

## Method and evidence

The workspace was empty (no package manifest, source, styles, components, AGENTS.md, or Git history). Available tooling: Node 22.14, npm 10.9, cached packages, Playwright and installed Chrome/Chromium. The web reader can retrieve public page content and links. Direct curl failed DNS resolution; Chrome and Chromium headless launches aborted under sandbox restrictions. No external forms were submitted, files uploaded, authentication attempted, or purchases made.

Labels used throughout: **O-text** = observed in retrieved page text/link structure; **O-rendered** = observed in a rendered browser (none); **E** = estimate/implementation choice; **B** = blocked; **S** = local simulation. Retrieved content has different crawl ages; it is not a live, authenticated session. Product option loading and cart placeholders are not evidence of a working backend.

## Actual inspection coverage

- [x] Homepage /: text from header through footer, category links, five merchandising sections, company introduction.
- [x] /business-cards: category shape, paper/texture, specialty and industry sections; footer.
- [x] /business-cards/standard: gallery semantics, product description, loading options, delivery controls, corners/quantity, browse/upload entry points, specifications, information and review controls; footer.
- [x] /business-cards/standard/templates with reference-supplied query: template gallery text, filters, colour choices, breadcrumbs and review pagination. Reader reports an older crawl; freshness unverified.
- [x] /signs-posters: navigation groups, best sellers and additional signage sections; footer.
- [x] /diwali-gifting-sale: linked assortment, product swatches and FAQ headings.
- [x] /customer-care/help-centre/: popular articles, search and six topic families; footer.
- [x] /c/: shared shell and placeholder separators only. Empty versus loading cart content cannot be established.
- [x] /my-account/: account/sidebar shell only; private dashboard not accessed.
- [x] /copyright-and-trademark-complaints: public policy route available, no reuse licence established.
- [ ] Search: guessed /search?query=business%20cards failed; actual submitted search URL unverified.
- [ ] Every individual product, design editor, projects, favourites, checkout, authenticated pages, external company services: unverified/deferred. Catalogue is substantially larger than this batch.
- [ ] Desktop 1440, tablet 768, mobile 390 reference screenshots: B (browser launch failure).
- [ ] Computed styles, full visual scroll inspection, hover/focus/disabled/error transitions: B.

## Page anatomy (O-text)

Shared shell: search input; help, projects, favourites, account and cart links; dense product-family navigation and extensive nested link lists; single-slide promotional region on merchandising pages. Mobile and desktop footer variants are both present in reader output; this suggests responsive variants, but their visibility rules are not observable.

Homepage section order: category exploration → popular products → trending → labels/packaging → further products → new products → company introduction/three service statements → guarantee/returns → footer link groups → country/payment marks → legal line. Some product lists are repeated in retrieved markup; this may represent responsive variants, not repeated visible sections. Local implementation renders one instance.

Category template: business-card shapes, paper finishes, specialty choices and industry inspiration. Signs category has a topic navigation group before its assortment. Product template: six-image gallery, heading/rating, description and bullet list, options, design entry actions, specifications and informational content, reviews, footer. Gallery markup documents click-to-expand and keyboard zoom/pan, but actual behaviour is unverified. Template gallery exposes filter names and selected chip text, but applying filters was not possible through the reader.

## Visual measurements and responsive status

No CSS/computed measurements are available. Exact fonts, colours, widths, shadows, radii, spacing, hover transitions, sticky behaviour, hero image/content and breakpoint thresholds remain B. Do not treat local token values as reference measurements.
The accessible Cloudinary URL for a category asset requests ar_4:5 and width 450 (O-text asset metadata). PDP URL requests gallery transformation or width 816. Crop subject, final intrinsic sizes and visual placement are unverified.

The local reconstruction uses a white commerce shell, dark text, blue emphasis, pale product stages, compact navigation, generously separated merchandising rows and original product illustrations (E). At 1440: full utility header, navigation and six category tiles; at 768: compact header/search, three tiles; at 390: menu drawer, two tiles. These are deliberate responsive choices, not observed reference rules. Header is not sticky because reference stickiness is unknown.

## States and restrictions

Link targets and named controls are O-text. Hover, focus, selected styling, autoplay, slider timing, validation, live option/pricing changes, account menus and mobile drawer mechanics are unverified. Search results, favourite persistence, cart, pricing, filters and design preview in the local version are S. Reference sign-in/private flows were not pursued. No checkout or payment integration is included.

## Follow-up batch

1. Restore rendered-browser access and capture all representative templates at three requested widths.
2. Measure shell, sections, fonts, crops, sticky behaviour and navigation states.
3. Replace estimated tokens and illustrations only with licensed assets.
4. Inspect additional categories/products in named batches and update route/interaction coverage.

## Implementation handoff

Batch 1 now includes 12 category routes, 42 mock product routes and their original-design galleries, plus search, saved items, cart, help, sale and account/service boundaries. The working UI remains an approximation, not a visually verified faithful match. Build/lint/model/DOM checks passed; browser screenshot and responsive verification are still blocked. See validation-results.md and docs/implemented-routes.md.

## Phase 4 update

Public product, gallery, cart/account shell and help pages were retrieved again without submitting anything. There is still no reference network trace or loaded product quote. The nine Phase 4 documents distinguish observed surfaces from all independent local pricing, dependencies, editor/upload, coupon, session, address/delivery, checkout and order behaviour. Earlier statements that the local app has no upload or checkout describe the pre-Phase-4 batch; those features now exist solely as browser-local simulations.
