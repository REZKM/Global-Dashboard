# Design system

This file **is** the dashboard's theme. The server reads it when it starts and turns
every token below into a CSS variable (`--token-name`) for the dashboard and the
login pages. To restyle the site, change a value here, commit, push — Railway
redeploys and the new look is live. No other file needs to change.

How to edit:

- Only the backticked values in the tables are read. Everything else here is notes.
- Colours take any CSS colour (`#07b782`, `rgba(0,0,0,.4)`) or a reference to another
  token (`var(--chart-1)`).
- **Light** and **Dark** columns are the two themes (the Dark mode switch in the
  sidebar). A table with a single **Value** column applies to both.
- Keep the token names (first column) as they are — the code refers to them.
- Charts read these tokens too, so chart colours follow this file.

---

## Brand

| Token | Light | Dark | Used for |
|---|---|---|---|
| `color-accent` | `#07b782` | `#16c48e` | Primary buttons, active pills, focus rings, highlights |
| `color-accent-strong` | `#047a57` | `#4fdcad` | Links and accent text on surfaces |
| `color-accent-soft` | `#e3f6ef` | `rgba(22,196,142,0.16)` | Selected rows, soft accent backgrounds |
| `color-on-accent` | `#ffffff` | `#04130d` | Text and icons on top of the accent colour |

## Surfaces and text

| Token | Light | Dark | Used for |
|---|---|---|---|
| `color-bg` | `#f4f5f3` | `#111312` | Page background |
| `color-surface` | `#ffffff` | `#1b1e1d` | Cards, panels, sidebar, modals |
| `color-surface-2` | `#f3f4f2` | `#232726` | Subtle fills: table headers, chips, inputs |
| `color-surface-3` | `#e8eae7` | `#2d3230` | Hover fills, tracks, stronger chips |
| `color-border` | `#e2e4e0` | `#2e3331` | Card and divider lines |
| `color-border-strong` | `#c8ccc7` | `#454b48` | Inputs, emphasised outlines |
| `color-text` | `#141816` | `#eef1ef` | Headings and main text |
| `color-text-muted` | `#555d59` | `#b1b9b5` | Secondary text, labels |
| `color-text-subtle` | `#7a827e` | `#858d89` | Hints, axis labels, placeholders |
| `color-inverse` | `#171c1a` | `#2b302e` | Dark chips, tooltips, toasts |
| `color-on-inverse` | `#f4f6f5` | `#f4f6f5` | Text on the inverse colour |
| `color-on-inverse-muted` | `#aab3ae` | `#aab3ae` | Secondary text on the inverse colour |
| `color-overlay` | `rgba(15,20,18,0.28)` | `rgba(0,0,0,0.55)` | Backdrop behind modals and panels |
| `color-shadow` | `rgba(16,24,20,0.08)` | `rgba(0,0,0,0.45)` | Shadow tint |
| `color-scrollbar` | `#cfd3ce` | `#3d4340` | Scrollbar thumb |

## Status

Reserved for meaning (up/down, warnings). Never used as a chart series colour.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `color-positive` | `#0f8a4f` | `#3ccf82` | Increases, success |
| `color-positive-soft` | `#e4f5ea` | `rgba(60,207,130,0.16)` | Success backgrounds |
| `color-negative` | `#c93838` | `#f07373` | Decreases, errors, required fields |
| `color-negative-soft` | `#fbe9e9` | `rgba(240,115,115,0.16)` | Error backgrounds |
| `color-warning` | `#a86a0d` | `#e8ac4a` | Warnings, data-quality flags |
| `color-warning-soft` | `#fcf1dd` | `rgba(232,172,74,0.16)` | Warning backgrounds |
| `color-info` | `#2a6fc4` | `#6aa6ee` | Informational badges |
| `color-info-soft` | `#e6effb` | `rgba(106,166,238,0.16)` | Informational backgrounds |

## Charts

Categorical colours, assigned in this order (series 1 = first brand/metric, and so on).
This set is checked for colour-blind safety in both themes; if you change it, keep
eight clearly different hues.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `chart-1` | `#2a78d6` | `#3987e5` | Series 1 (blue) |
| `chart-2` | `#eb6834` | `#d95926` | Series 2 (orange) |
| `chart-3` | `#1baf7a` | `#199e70` | Series 3 (aqua) |
| `chart-4` | `#eda100` | `#c98500` | Series 4 (yellow) |
| `chart-5` | `#e87ba4` | `#d55181` | Series 5 (magenta) |
| `chart-6` | `#008300` | `#008300` | Series 6 (green) |
| `chart-7` | `#4a3aa7` | `#9085e9` | Series 7 (violet) |
| `chart-8` | `#e34948` | `#e66767` | Series 8 (red) |
| `chart-other` | `#9aa19d` | `#6c7470` | "Other" / remainder slices |
| `chart-grid` | `#eceeeb` | `#2a2f2d` | Gridlines |
| `chart-text` | `#6b736f` | `#9aa29e` | Axis labels and chart text |
| `chart-heat` | `#1baf7a` | `#199e70` | Heatmap cells (drawn from light to full strength) |

## Metric colours

Which chart colour each metric uses in KPI cards, sparklines and metric charts.

| Token | Value | Used for |
|---|---|---|
| `metric-posts` | `var(--chart-7)` | Posts |
| `metric-engagement` | `var(--chart-1)` | Engagements / Total Interactions |
| `metric-avg` | `var(--chart-5)` | Average per post |
| `metric-reach` | `var(--chart-3)` | Reach |
| `metric-impressions` | `var(--chart-4)` | Impressions |
| `metric-likes` | `var(--chart-8)` | Likes / reactions |
| `metric-comments` | `var(--chart-1)` | Comments |
| `metric-shares` | `var(--chart-2)` | Shares |
| `metric-saves` | `var(--chart-7)` | Saves |
| `metric-clicks` | `var(--chart-5)` | Post clicks |
| `metric-video` | `var(--chart-6)` | Video views |
| `metric-stories` | `var(--chart-5)` | Stories |
| `metric-rate` | `var(--chart-2)` | Engagement rate (ERF / ER / ERi) |
| `metric-followers` | `var(--chart-4)` | Followers |

## Platform colours

Each network's own brand colour, used for its icon badge and wherever a chart shows
platforms side by side.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `platform-instagram` | `#c13584` | `#d6479a` | Instagram |
| `platform-facebook` | `#1877f2` | `#3b8cf5` | Facebook |
| `platform-x` | `#141816` | `#e6e9e7` | X (Twitter) |
| `platform-x-text` | `#ffffff` | `#141816` | Text on the X badge |
| `platform-youtube` | `#ff0000` | `#ff4343` | YouTube |
| `platform-tiktok` | `#25f4ee` | `#25f4ee` | TikTok |
| `platform-tiktok-text` | `#000000` | `#000000` | Text on the TikTok badge |
| `platform-linkedin` | `#0a66c2` | `#3d8ad6` | LinkedIn |
| `platform-snapchat` | `#fffc00` | `#fffc00` | Snapchat |
| `platform-snapchat-text` | `#111111` | `#111111` | Text on the Snapchat badge |
| `platform-other` | `#5b635f` | `#7d8581` | Any other network |

## Typography

`font-url` is the web-font stylesheet loaded on every page; set it to `none` to use
system fonts only.

| Token | Value | Used for |
|---|---|---|
| `font-url` | `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap` | Web font stylesheet |
| `font-sans` | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` | All text |
| `font-size-2xs` | `10px` | Tiny tags, badge letters |
| `font-size-xs` | `11px` | Uppercase labels, table headers, footnotes |
| `font-size-sm` | `12px` | Secondary text, pills, chart labels |
| `font-size-base` | `13px` | Body text, tables, buttons |
| `font-size-md` | `14px` | Emphasised body, card titles |
| `font-size-lg` | `16px` | Panel and widget headings |
| `font-size-xl` | `20px` | Section headings |
| `font-size-2xl` | `26px` | KPI values, page title |
| `font-size-3xl` | `32px` | Hero numbers |
| `font-weight-regular` | `400` | Body text |
| `font-weight-medium` | `500` | Labels, pills |
| `font-weight-semibold` | `600` | Buttons, card titles |
| `font-weight-bold` | `700` | Headings, KPI values |
| `line-height-tight` | `1.25` | Headings, numbers |
| `line-height-base` | `1.5` | Body text |

## Shape and depth

| Token | Light | Dark | Used for |
|---|---|---|---|
| `radius-sm` | `6px` | `6px` | Chips, badges, small buttons |
| `radius-md` | `10px` | `10px` | Buttons, inputs, table rows |
| `radius-lg` | `14px` | `14px` | Cards, panels, modals |
| `radius-pill` | `999px` | `999px` | Pills and toggles |
| `shadow-sm` | `0 1px 2px var(--color-shadow)` | `0 1px 2px var(--color-shadow)` | Cards at rest |
| `shadow-md` | `0 2px 4px var(--color-shadow), 0 6px 16px var(--color-shadow)` | `0 2px 4px var(--color-shadow), 0 6px 16px var(--color-shadow)` | Hovered cards, dropdowns |
| `shadow-lg` | `0 12px 40px var(--color-shadow)` | `0 12px 40px var(--color-shadow)` | Modals and side panels |

## Layout

| Token | Value | Used for |
|---|---|---|
| `sidebar-width` | `248px` | Width of the filter sidebar |
| `content-max-width` | `1480px` | Maximum width of the dashboard content |
