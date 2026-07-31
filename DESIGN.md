# DESIGN.md — BIOPEAK Event Capture

## Visual theme

Light healthcare-tech product UI. Airy grey shell, white form surface, muted coral accent. Restrained color strategy (coral ≤10%).

## Color

| Token | Hex | Role |
|-------|-----|------|
| `--bg` | `#F8F9FA` | Page background |
| `--surface` | `#FFFFFF` | Form container |
| `--ink` | `#1A1A1A` | Headings, primary text |
| `--muted` | `#666666` | Labels |
| `--muted-soft` | `#999999` | Placeholders, hints |
| `--accent` | `#D5756C` | CTA, focus rings |
| `--accent-hover` | `#C4655C` | CTA hover |
| `--success-bg` | `#E6F4EA` | Success banner |
| `--success-ink` | `#2E7D32` | Success text |
| `--border` | `#E5E7EB` | Input borders |
| `--splash-bg` | `#000000` | Splash only |

Use OKLCH equivalents in CSS where practical; hex above is source of truth from product screenshot.

## Typography

- **Family:** Manrope (Google Fonts) — geometric, clinical, not Inter/DM Sans.
- **Scale:** fluid clamp; body ~1rem; title ~1.5–1.75rem; strong weight contrast on CTA.
- Labels: 0.875rem, medium weight, `--muted`.

## Components

- **Form surface:** white, ~16–20px radius, soft shadow, max-width ~400px centered.
- **Inputs:** rounded (~12px), light border, coral focus ring.
- **Primary button:** pill (`border-radius: 999px`), coral fill, white text.
- **Success:** mint banner matching admin “Active” badge language.
- **Splash:** full-viewport black; Lottie centered; crossfade to form.

## Layout

Single centered column. Logo → short line → fields → CTA. No sidebar, cards-in-cards, or stat strips.

## Motion

- Splash: Lottie play-once, then opacity crossfade (~400ms, ease-out-quart).
- Form: subtle rise/fade on reveal.
- Respect `prefers-reduced-motion`: skip Lottie or show static end frame; instant form.
