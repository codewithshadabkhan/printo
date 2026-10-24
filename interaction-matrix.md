# Interaction matrix

Verification legend: O-text = control/link present in reader output; B = rendered reference blocked; S = implemented local simulation; QA results recorded separately in validation-results.md. No hover, pricing, submission or selected-style outcomes were verified on the reference.

| Page      | Component              | Trigger                  | Visible result                          | State changes                   | Verification status                              |
| --------- | ---------------------- | ------------------------ | --------------------------------------- | ------------------------------- | ------------------------------------------------ |
| All       | Promotion              | sale link                | sale assortment                         | route                           | target O-text; local S                           |
| All       | Logo                   | activate                 | homepage                                | route                           | reference graphic unavailable; local replacement |
| All       | Search                 | submit text              | matching local products / empty message | query URL                       | field O-text; result B/S                         |
| All       | Search                 | clear                    | empty input                             | query cleared                   | reference B; local E                             |
| All       | Desktop nav            | hover/click/focus        | grouped panel                           | expanded                        | links O-text; trigger/result B/E                 |
| All       | Desktop nav            | Escape / outside pointer | close panel                             | collapsed                       | B/E                                              |
| Mobile    | Menu                   | activate                 | modal drawer with categories            | modal open                      | B/E                                              |
| Mobile    | Menu                   | Escape/close             | restore trigger focus                   | modal closed                    | B/E                                              |
| All       | Account/projects       | activate                 | access-boundary screen                  | route                           | shell O-text; private boundary                   |
| All       | Cart                   | activate                 | mock line items / empty state           | route                           | shell O-text; S                                  |
| Home      | Category tile          | activate                 | category template                       | route                           | target O-text where verified                     |
| Home      | Product rail           | arrows / swipe           | next items                              | scroll position; disabled edges | counters O-text; mechanics B/E                   |
| Home/list | Product                | activate                 | details                                 | route                           | O-text for standard; others S                    |
| List      | Favourite              | toggle                   | filled/unfilled heart, feedback         | browser-local saved IDs         | reference B; S                                   |
| Category  | Group links            | activate                 | relevant section/product                | hash/route                      | O-text sections; local E                         |
| Product   | Thumbnail              | activate                 | selected artwork                        | gallery index                   | six images O-text; B/S artwork                   |
| Product   | Main image             | activate                 | expanded artwork dialog                 | modal                           | markup O-text; result B/E                        |
| Product   | Expanded artwork       | +/- / arrows             | zoom/pan original asset                 | transform                       | keyboard instructions O-text; B/E                |
| Product   | Delivery/corners/stock | select                   | selected option, mock price             | configuration                   | labels O-text; values/result B/S                 |
| Product   | Quantity               | change                   | recalculated mock price                 | quantity                        | control O-text; backend B/S                      |
| Product   | Browse                 | activate                 | template gallery                        | route/query                     | reference destination O-text                     |
| Product   | Upload                 | activate                 | explicit unavailable-upload information | modal                           | entry O-text; no files uploaded                  |
| Product   | Add sample             | activate                 | mock cart confirmation                  | persisted cart                  | local-only S, reference flow unverified          |
| Product   | Specs/FAQ              | activate                 | expand/collapse                         | disclosure                      | labels O-text; mechanics B/E                     |
| Gallery   | Search/filter          | enter/check              | matching original designs and count     | query/filter/page               | names O-text; outcomes B/S                       |
| Gallery   | Filter chip/reset      | remove                   | unfiltered matching set                 | filters reset                   | clear control O-text; B/S                        |
| Gallery   | Sort                   | select                   | reordered local designs                 | sort/page                       | S; reference gallery sort unverified             |
| Gallery   | Pagination             | activate                 | new local subset                        | page                            | template pagination unverified; S                |
| Gallery   | Preview                | activate                 | original template preview, name field   | modal                           | S                                                |
| Gallery   | Save design            | toggle                   | saved icon                              | persisted favourites            | B/S                                              |
| Cart      | Quantity/remove        | change                   | totals / empty cart                     | persisted cart                  | reference content B; S                           |
| Cart      | Review order           | activate                 | clear local-demo boundary               | modal                           | S; no checkout                                   |
| Help      | Article search/topic   | enter/activate           | local answers                           | query/category                  | controls O-text; answers S                       |
| Help      | FAQ                    | activate                 | answer expands                          | open                            | local E                                          |
| Footer    | Mobile group           | activate                 | links expand                            | open                            | duplicate button groups O-text; mechanics B/E    |
| Unknown   | Route                  | direct navigation        | useful not-found                        | route                           | local E                                          |

## State coverage

Default and loading labels can be read in reference text; visual states remain B. Local design covers hover/focus/active, selected options, disabled rail/page controls, empty search/cart/favourites, form required constraints, unavailable-service messages, confirmation toasts and native modal behaviour. No artificial network/loading claims are made for synchronous local data.

## Local verification completed

The React DOM journey verifies primary menu open/Escape, header search form submission, product configuration and computed sample price, browse URL/configuration retention, gallery colour filter/reset/empty results/pagination, saved-design persistence, safe business-name rendering, preview/cart actions, cart sets/totals/removal, review dialog, saved-design page, help search, account/not-found boundaries, mobile-drawer cancel and zoom/pan state. These are jsdom checks with mocked browser primitives. Native focus trapping, actual hover/focus appearance, touch swipe, resize/overflow and browser errors remain unverified.

## Phase 4 local extension (supersedes earlier local flow limitations)

Upload now opens `/editor` for local file reads; no reference upload is made. Cart now supports canonical option edits, coupons and `/checkout`. The local account root provides credential-free demo sessions, and confirmation/history/reorder are implemented at independent local routes. Product quote requests are cancellable Promise mocks; filters and configuration persist in the URL. These are L/S implementations, not newly verified reference transitions. The current evidence/test/limitations mapping is in `functional-spec.md`; detailed steps are in `user-journeys.md`.
