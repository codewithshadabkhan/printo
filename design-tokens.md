# Design tokens

## Evidence

No rendered/computed reference CSS could be captured. **All numerical tokens below are E (local estimates), not measurements.** Cloudinary category aspect ratio 4:5 is observed URL metadata. Exact reference font files and licences are unknown.

| Concern         | Local choice                                          | Purpose                                                 |
| --------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| Font            | Arial, Helvetica, sans-serif                          | available system replacement; no remote font dependency |
| Text            | #151515, muted #626262                                | primary and secondary copy                              |
| Brand action    | #0078a9                                               | links, selected controls                                |
| Surface         | white, #f5f5f5                                        | shell and neutral stages                                |
| Border          | #d6d6d6                                               | 1px separators/inputs                                   |
| Promo           | #e7f3f8                                               | compact announcement region                             |
| Footer          | #1b1b1b                                               | light text and dividers                                 |
| Main gutter     | clamp(20px, 4.45vw, 64px)                             | responsive page margin                                  |
| Content         | max 1440px                                            | constrained wide layout                                 |
| Body            | 14–16px, line-height 1.5                              | commerce copy                                           |
| Page heading    | 28–40px, weight 700, tracking -0.8px                  | product/category heading                                |
| Section heading | 24–30px, weight 700                                   | merchandising rows                                      |
| Button          | min-height 48px, 24px horizontal padding              | clear touch target                                      |
| Fields          | min-height 48px, 1px border                           | search/options                                          |
| Radius          | 8px media, 4px fields, pill actions                   | consistent local treatment                              |
| Spacing         | 4, 8, 12, 16, 24, 32, 48, 64px                        | rhythm                                                  |
| Focus           | 3px blue outline, 3px offset                          | visible keyboard focus                                  |
| Media           | 4:5 category, 1:1 product, 1.6:1 gallery              | category ratio observed; others estimated               |
| Motion          | 160ms colour/transform; disabled under reduced-motion | restrained feedback                                     |
| Dialog          | white, max 820px, native modal backdrop               | focus trapping via dialog                               |

## Responsive design choices (E)

At 1100px and below: hide desktop utility labels/navigation, show drawer trigger. At 700px and below: two category columns, stacked PDP/cart, one-column topic panels, collapsible footer. At 701–1100: three category columns. Desktop has six category columns; merchandising rails show four cards and scroll. Do not claim these breakpoints match VistaPrint.
No gradients or shadows on interface cards except subtle original asset lighting and overlay elevation. No autoplay or scroll-triggered effects are inferred.
