# Lottie animations

Vector animations consumed by [`LottieAnimation.vue`](../LottieAnimation.vue).

The files are plain [bodymovin/Lottie](https://lottiefiles.com/what-is-lottie) JSON documents,
bundled by webpack so they work offline (the app ships as a Capacitor/Android app).

They come in two families:

| Family    | Canvas, frames         | Notes                                                         |
| --------- | ---------------------- | ------------------------------------------------------------- |
| **Scene** | `200 x 200`, `0 - 120` | `4s`. Authored so it can loop seamlessly.                     |
| **Burst** | `120 x 120`, `0 - 45`  | `1.5s`. Kept small because it is used as an icon-sized burst. |

## Playback

The family describes the artwork, not how it is played: the consumer decides that with the
`loop` prop, and one asset can be used both ways (`fun-game` loops on an intro slide and
on the guessing game's empty state).

-   **Looping** is the default, and what every animation on screen does. A state that is
    being looked at keeps moving instead of settling into a still frame.
-   **One-shot** (`:loop="false"`) is only for the bursts that a `complete` handler
    unmounts once they have played: the flashcard-created burst and the Leitner mastery
    celebration. A looping animation never fires `complete` — lottie fires `loopComplete`
    instead — so looping those would leave them mounted: the celebration would never end,
    and the bursts would pile up as overlays.

The `fallback` slot stands in when an animation cannot play at all: a failed load, or
motion reduced. It is also what a finished one-shot settles into, so it should be a
complete static illustration of the same idea rather than a bare icon of last resort.

## Canvas conventions

| Property     | Value        | Notes                                             |
| ------------ | ------------ | ------------------------------------------------- |
| Frame rate   | `30 fps`     |                                                   |
| Scene        | `200 x 200`  |                                                   |
| Burst        | `120 x 120`  | Centre its layers on `[60, 60]`.                  |
| Shape layers | `ty: 4`, SVG | Rendered with `lottie_light` (SVG renderer only). |

Remember that `ks.p` defaults to `[100, 100]` in the authoring helpers, which is the
centre of a `200 x 200` canvas. A `120 x 120` burst has to centre its layers on
`[60, 60]` explicitly, or the artwork lands off-canvas.

Inside a shape layer the **first group paints on top**, unlike layers where the first
entry is also on top — keep that in mind when stacking a mark over a shape (the tick over
the `mastered` card, the heart over the `flashcard-created` card).

A one-shot is mounted once and then left in the DOM, so it must be **invisible on the
first _and_ the last frame**: the surface never shows a frozen symbol, and reduced motion
(which renders the last frame when there is no `fallback` slot) stays silent.

## Geometry

Shape geometry must be **layer-local**; the layer transform (`ks.p`) places it on the
canvas. Writing composition-absolute coordinates into a layer that is already offset by
`[100, 100]` silently pushes the artwork off-canvas — `tests/unit/lottie-assets.spec.ts`
guards against exactly that.

## Color contract

Animations must **not** hardcode brand colors. They use three placeholder colors which
`LottieAnimation.vue` swaps at runtime for the matching CSS custom property, so a single
asset works in both the light and dark themes:

| Placeholder | RGB             | Replaced with                  |
| ----------- | --------------- | ------------------------------ |
| Primary     | `24, 121, 78`   | `--ion-color-primary`          |
| Accent      | `60, 142, 106`  | `--ion-color-primary-tint`     |
| Contrast    | `250, 250, 250` | `--ion-color-primary-contrast` |

Use the _Contrast_ placeholder only for content drawn on top of a _Primary_ shape (for
example the `+` glyph of `join-us`), because the contrast token is light in the light
theme and dark in the dark theme.

The consuming component may re-point the variables (the guessing game maps them to
`--ion-color-warning` for the incorrect-answer burst), so `primary` and `accent` should
always read as "main" and "secondary" rather than as literal brand tokens.

Use the _Contrast_ placeholder whenever the mark sits on top of another animated shape
(such as the tick on the `mastered` card): it follows the theme, so it stays legible in
both.

## Motion contract

Easing mirrors the design tokens in `src/styles/variables.css`:

-   `cubic-bezier(0.2, 0, 0, 1)` → `--ease-standard`
-   `cubic-bezier(0.3, 0, 0, 1)` → `--ease-emphasized`

Loops must be seamless: keep every layer invisible on the first **and** last frame, or
animate a property that is continuous across the loop (for example a full `360°` rotation).

## Accessibility

`LottieAnimation.vue` never autoplays when `prefers-reduced-motion: reduce` is set; the
static `fallback` slot of the consuming component is rendered instead. The same slot is
also what a finished one-shot settles into, and what a failed load falls back to, so it is
worth treating as part of the composition rather than as an edge case.
