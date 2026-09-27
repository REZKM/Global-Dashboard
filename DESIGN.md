# Design system — extend

This file **is** the dashboard's theme. The server reads it when it starts and turns
every token below into a CSS variable (`--token-name`) for the dashboard and the
login pages. To restyle the site, change a value here, commit, push — Railway
redeploys and the new look is live. No other file needs to change.

It applies the **extend 2026 brand**: rich black and off-white fields, a single
sea-green accent used only for emphasis, flat surfaces, sharp corners, no shadows,
no gradients. Every colour is a brand colour, or a tint of one mixed with
`color-mix()`, so nothing here is invented.

How to edit:

- Only the backticked values in the tables are read. Everything else here is notes.
- Colours take any CSS colour (`#07b782`, `rgba(0,0,0,.4)`), a `color-mix(...)` of
  brand colours, or a reference to another token (`var(--chart-1)`).
- **Light** and **Dark** columns are the two themes (the Dark mode switch in the
  sidebar). A table with a single **Value** column applies to both.
- Keep the token names (first column) as they are — the code refers to them.
- Charts read these tokens too, so chart colours follow this file.

Brand colour reference: Rich Black `#050505` · Off White `#F4EFE9` · Graphite
`#3A3A3A` · Medium Sea Green `#07B782` · Dodger Blue `#3A86FF` · Vibrant Orange
`#FF812C` · Electric Violet `#7B61FF` · Vivid Magenta `#E1068A` · Terracota
`#C97B5D` · Desert Sand `#D9B382` · Blush Coral `#FF7A7A` · Amber `#FFB703`.

---

## Brand

Green is emphasis only — active states, links, the dot, hover — never large areas.
Buttons are rich black and turn green on hover (dark mode: off-white, same hover).

| Token | Light | Dark | Used for |
|---|---|---|---|
| `color-accent` | `#07B782` | `#07B782` | Active pills, indicators, focus rings, the brand dot |
| `color-accent-strong` | `#050505` | `#F4EFE9` | Text on accent-soft backgrounds (selected items) |
| `color-accent-soft` | `color-mix(in srgb, #07B782 14%, #FFFFFF)` | `color-mix(in srgb, #07B782 22%, #171717)` | Selected rows and pills |
| `color-on-accent` | `#050505` | `#050505` | Text and icons on the accent colour |
| `color-link` | `#07B782` | `#07B782` | Links (turn `color-heading` on hover) |
| `color-action` | `#050505` | `#F4EFE9` | Primary buttons |
| `color-on-action` | `#F4EFE9` | `#050505` | Text on primary buttons |
| `color-action-hover` | `#07B782` | `#07B782` | Primary button hover |
| `color-on-action-hover` | `#050505` | `#050505` | Text on hovered primary buttons |

## Surfaces and text

| Token | Light | Dark | Used for |
|---|---|---|---|
| `color-bg` | `#FFFFFF` | `#060606` | Page background |
| `color-surface` | `#F4EFE9` | `#171717` | Cards, panels, sidebar, modals |
| `color-surface-2` | `#FFFFFF` | `#0E0E0E` | Fills inside cards: table rows, chips, inputs |
| `color-surface-3` | `color-mix(in srgb, #050505 8%, #F4EFE9)` | `#3A3A3A` | Hover fills, tracks, stronger chips |
| `color-border` | `color-mix(in srgb, #050505 12%, #F4EFE9)` | `color-mix(in srgb, #F4EFE9 12%, #171717)` | Card and divider lines |
| `color-border-strong` | `#050505` | `color-mix(in srgb, #F4EFE9 55%, #171717)` | Inputs, secondary buttons |
| `color-heading` | `#050505` | `#F4EFE9` | Headings and headline numbers |
| `color-text` | `#3A3A3A` | `#F4EFE9` | Body text |
| `color-text-muted` | `color-mix(in srgb, #3A3A3A 78%, #FFFFFF)` | `color-mix(in srgb, #F4EFE9 72%, #060606)` | Secondary text, labels |
| `color-text-subtle` | `color-mix(in srgb, #3A3A3A 58%, #FFFFFF)` | `color-mix(in srgb, #F4EFE9 50%, #060606)` | Hints, axis labels, placeholders |
| `color-inverse` | `#050505` | `#3A3A3A` | Dark chips, tooltips, toasts |
| `color-on-inverse` | `#F4EFE9` | `#F4EFE9` | Text on the inverse colour and on chart fills |
| `color-on-inverse-muted` | `color-mix(in srgb, #F4EFE9 65%, #050505)` | `color-mix(in srgb, #F4EFE9 65%, #050505)` | Secondary text on the inverse colour |
| `color-overlay` | `rgba(5,5,5,0.16)` | `rgba(0,0,0,0.45)` | Tint over the blurred dashboard behind modals and panels |
| `color-shadow` | `transparent` | `transparent` | Shadow tint (the brand is flat — no shadows) |
| `color-scrollbar` | `color-mix(in srgb, #050505 22%, #F4EFE9)` | `#3A3A3A` | Scrollbar thumb |

## Status

Reserved for meaning (up/down, warnings), never used as a chart series colour.
Deepened versions of brand colours so small text stays readable.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `color-positive` | `color-mix(in srgb, #07B782 72%, #050505)` | `#07B782` | Increases, success |
| `color-positive-soft` | `color-mix(in srgb, #07B782 14%, #FFFFFF)` | `color-mix(in srgb, #07B782 22%, #171717)` | Success backgrounds |
| `color-negative` | `color-mix(in srgb, #C97B5D 62%, #050505)` | `#FF7A7A` | Decreases, errors, required fields |
| `color-negative-soft` | `color-mix(in srgb, #FF7A7A 16%, #FFFFFF)` | `color-mix(in srgb, #FF7A7A 20%, #171717)` | Error backgrounds |
| `color-warning` | `color-mix(in srgb, #FFB703 58%, #050505)` | `#FFB703` | Warnings, data-quality flags |
| `color-warning-soft` | `color-mix(in srgb, #FFB703 16%, #FFFFFF)` | `color-mix(in srgb, #FFB703 18%, #171717)` | Warning backgrounds |
| `color-info` | `color-mix(in srgb, #3A86FF 80%, #050505)` | `#3A86FF` | Informational badges |
| `color-info-soft` | `color-mix(in srgb, #3A86FF 12%, #FFFFFF)` | `color-mix(in srgb, #3A86FF 20%, #171717)` | Informational backgrounds |

## Charts

Categorical colours from the brand's secondary palette, assigned in this order.
Series 1–6 are checked for colour-blind safety on the card colour in both themes
(orange and green are deepened slightly for the dark theme). Series 7–8 are only
for rare cases with more than six series. Change the order only with care.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `chart-1` | `#3A86FF` | `#3A86FF` | Series 1 (Dodger Blue) |
| `chart-2` | `#FF812C` | `#E07227` | Series 2 (Vibrant Orange) |
| `chart-3` | `#07B782` | `#06A172` | Series 3 (Medium Sea Green) |
| `chart-4` | `#7B61FF` | `#7B61FF` | Series 4 (Electric Violet) |
| `chart-5` | `#E1068A` | `#E1068A` | Series 5 (Vivid Magenta) |
| `chart-6` | `#C97B5D` | `#C97B5D` | Series 6 (Terracota) |
| `chart-7` | `#3A3A3A` | `#D9B382` | Series 7 (Graphite / Desert Sand) |
| `chart-8` | `#D9B382` | `#8C8C8C` | Series 8 |
| `chart-other` | `color-mix(in srgb, #3A3A3A 45%, #F4EFE9)` | `#3A3A3A` | "Other" / remainder slices |
| `chart-grid` | `color-mix(in srgb, #050505 8%, #F4EFE9)` | `color-mix(in srgb, #F4EFE9 10%, #171717)` | Gridlines |
| `chart-text` | `color-mix(in srgb, #3A3A3A 78%, #FFFFFF)` | `color-mix(in srgb, #F4EFE9 65%, #060606)` | Axis labels and chart text |
| `chart-heat` | `#07B782` | `#07B782` | Heatmap cells (drawn from light to full strength) |

## Metric colours

Which chart colour each metric uses in KPI cards, sparklines and metric charts.

| Token | Value | Used for |
|---|---|---|
| `metric-posts` | `var(--chart-4)` | Posts |
| `metric-engagement` | `var(--chart-1)` | Engagements / Total Interactions |
| `metric-avg` | `var(--chart-5)` | Average per post |
| `metric-reach` | `var(--chart-3)` | Reach |
| `metric-impressions` | `var(--chart-2)` | Impressions |
| `metric-likes` | `var(--chart-5)` | Likes / reactions |
| `metric-comments` | `var(--chart-1)` | Comments |
| `metric-shares` | `var(--chart-2)` | Shares |
| `metric-saves` | `var(--chart-4)` | Saves |
| `metric-clicks` | `var(--chart-6)` | Post clicks |
| `metric-video` | `var(--chart-6)` | Video views |
| `metric-stories` | `var(--chart-5)` | Stories |
| `metric-rate` | `var(--chart-3)` | Engagement rate (ERF / ER / ERi) |
| `metric-followers` | `var(--chart-2)` | Followers |

## Platform colours

Each network's own brand colour, used for its icon badge and wherever a chart shows
platforms side by side.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `platform-instagram` | `#c13584` | `#d6479a` | Instagram |
| `platform-facebook` | `#1877f2` | `#3b8cf5` | Facebook |
| `platform-x` | `#050505` | `#F4EFE9` | X (Twitter) |
| `platform-x-text` | `#F4EFE9` | `#050505` | Text on the X badge |
| `platform-youtube` | `#ff0000` | `#ff4343` | YouTube |
| `platform-tiktok` | `#25f4ee` | `#25f4ee` | TikTok |
| `platform-tiktok-text` | `#050505` | `#050505` | Text on the TikTok badge |
| `platform-linkedin` | `#0a66c2` | `#3d8ad6` | LinkedIn |
| `platform-snapchat` | `#fffc00` | `#fffc00` | Snapchat |
| `platform-snapchat-text` | `#050505` | `#050505` | Text on the Snapchat badge |
| `platform-other` | `#3A3A3A` | `color-mix(in srgb, #F4EFE9 45%, #171717)` | Any other network |

## Typography

The brand typeface is **JUST Sans** (Latin) with **Kanun AR** (Arabic). Neither is on
Google Fonts; until their font files are added to the project, pages fall back to
**Poppins** (the brand website's UI font), loaded from `font-url`. Set `font-url`
to `none` to use system fonts only. Headings are ExBold and UPPERCASE; nothing is
smaller than the brand's 12px digital floor.

| Token | Value | Used for |
|---|---|---|
| `font-url` | `https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap` | Web font stylesheet |
| `font-sans` | `'JUST Sans', 'Kanun AR', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif` | All text |
| `font-size-2xs` | `12px` | Tiny tags, badge letters |
| `font-size-xs` | `12px` | Uppercase labels, table headers, footnotes |
| `font-size-sm` | `13px` | Secondary text, pills, chart labels |
| `font-size-base` | `14px` | Body text, tables, buttons |
| `font-size-md` | `15px` | Emphasised body, card titles |
| `font-size-lg` | `17px` | Panel and widget headings |
| `font-size-xl` | `24px` | Section headings |
| `font-size-2xl` | `30px` | KPI values, page title |
| `font-size-3xl` | `40px` | Hero numbers |
| `font-weight-regular` | `400` | Body text |
| `font-weight-medium` | `500` | Labels, pills |
| `font-weight-semibold` | `600` | Lead text, card titles |
| `font-weight-bold` | `700` | Buttons (sign-off weight), headings |
| `font-weight-heavy` | `800` | Section headings and headline numbers (ExBold) |
| `line-height-tight` | `1.15` | Headings, numbers |
| `line-height-base` | `1.5` | Body text |
| `heading-case` | `uppercase` | Letter case of section headings and the page title |

## Shape and depth

Flat and sharp: no radii, no shadows. Depth comes from colour fields (off-white
cards on white, black panels). The only curve is the perfect circle — dots.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `radius-sm` | `0px` | `0px` | Chips, badges, small buttons |
| `radius-md` | `0px` | `0px` | Buttons, inputs, table rows |
| `radius-lg` | `0px` | `0px` | Cards, panels, modals |
| `radius-pill` | `0px` | `0px` | Pills and toggles |
| `shadow-sm` | `none` | `none` | Cards at rest |
| `shadow-md` | `none` | `none` | Hovered cards, dropdowns |
| `shadow-lg` | `none` | `none` | Modals and side panels |
| `overlay-blur` | `6px` | `6px` | How strongly the dashboard is blurred behind modals, panels and pop-ups |

## Layout

| Token | Value | Used for |
|---|---|---|
| `sidebar-width` | `256px` | Width of the filter sidebar |
| `content-max-width` | `1480px` | Maximum width of the dashboard content |
