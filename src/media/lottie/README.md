# Lottie animations

Vector animations consumed by [`LottieAnimation.vue`](../LottieAnimation.vue) on the
kick-off/onboarding slides (`src/views/kick-off/Intro.vue`).

The files are plain [bodymovin/Lottie](https://lottiefiles.com/what-is-lottie) JSON documents,
bundled by webpack so they work offline (the app ships as a Capacitor/Android app).

## Canvas conventions

| Property     | Value                     | Notes                                              |
| ------------ | ------------------------- | -------------------------------------------------- |
| Frame rate   | `30 fps`                  |                                                    |
| Composition  | `200 x 200`, `0 - 120`    | `4s`; looping assets are seamless at this length.   |
| Shape layers | `ty: 4`, SVG              | Rendered with `lottie_light` (SVG renderer only).   |

## Geometry

Shape geometry must be **layer-local**; the layer transform (`ks.p`) places it on the
canvas. Writing composition-absolute coordinates into a layer that is already offset by
`[100, 100]` silently pushes the artwork off-canvas — `tests/unit/lottie-assets.spec.ts`
guards against exactly that.

## Color contract

Animations must **not** hardcode brand colors. They use three placeholder colors which
`LottieAnimation.vue` swaps at runtime for the matching CSS custom property, so a single
asset works in both the light and dark themes:

| Placeholder | RGB             | Replaced with                       |
| ----------- | --------------- | ----------------------------------- |
| Primary     | `24, 121, 78`   | `--ion-color-primary`               |
| Accent      | `60, 142, 106`  | `--ion-color-primary-tint`          |
| Contrast    | `250, 250, 250` | `--ion-color-primary-contrast`      |

Use the _Contrast_ placeholder only for content drawn on top of a _Primary_ shape (for
example the `+` glyph of `join-us`), because the contrast token is light in the light
theme and dark in the dark theme.

## Motion contract

Easing mirrors the design tokens in `src/styles/variables.css`:

- `cubic-bezier(0.2, 0, 0, 1)` → `--ease-standard`
- `cubic-bezier(0.3, 0, 0, 1)` → `--ease-emphasized`

Loops must be seamless: keep every layer invisible on the first **and** last frame, or
animate a property that is continuous across the loop (for example a full `360°` rotation).

## Accessibility

`LottieAnimation.vue` never autoplays when `prefers-reduced-motion: reduce` is set; the
static `fallback` slot of the consuming component is rendered instead.
