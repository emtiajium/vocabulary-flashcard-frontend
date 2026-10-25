# Lottie animations

Vector animations consumed by [`LottieAnimation.vue`](../LottieAnimation.vue).

These are plain [bodymovin/Lottie](https://lottiefiles.com/what-is-lottie) JSON documents. They are imported by the app and bundled for offline use on the web/PWA and Capacitor/Android.

## Animation formats

All animations use **30 fps** and shape layers (`ty: 4`). The canvas size and duration depend on the intended use:

| Format         | Canvas      | Frames (`ip` to `op`) | Duration    | Typical use                                                                                        |
| -------------- | ----------- | --------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| Standard scene | `200 x 200` | `0` to `120`          | 4 seconds   | Explanatory and empty-state animations                                                             |
| Extended scene | `200 x 200` | `0` to `180`          | 6 seconds   | `spaced-repetition`, whose full five-box journey needs more time                                   |
| Feedback burst | `120 x 120` | `0` to `45`           | 1.5 seconds | Compact feedback such as `answer-correct`, `answer-incorrect`, `mastered`, and `flashcard-created` |

**Do not assume every 200 x 200 animation has 120 frames.** Read `fr`, `ip`, and `op` from the JSON. When changing an animation's duration, also update its expected frame count in `tests/unit/lottie-assets.spec.ts` without relaxing checks for the other assets.

## Playback and usage

The consuming component decides playback with the `loop` prop; the canvas size alone does not determine whether an asset loops.

-   Use **looping** (`:loop="true"`) for animations that remain visible while a state or explanation is displayed.
-   Use **one-shot** playback (`:loop="false"`) for short feedback animations when the consumer deliberately handles completion. Do not leave a one-shot mounted unintentionally or repeatedly create completion overlays.
-   A `complete` event applies to a non-looping playback; looping playback instead emits `loopComplete`. Do not depend on a `complete` handler to remove a looping animation.
-   `LeitnerSystemsFlow.vue`'s final-box overlay is configured to **loop** in the supplied component, even though it celebrates mastery. It uses `start.json` (or a replacement trophy animation). This is separate from the `mastered.json` feedback-burst asset.
-   The development preview may deliberately replay one-shot animations for inspection. That does **not** mean they should loop in their actual UI usages.

The `fallback` slot should present a suitable static alternative for failed playback and reduced-motion users. For a one-shot, check how its specific consumer handles completion and fallback; do not assume that all one-shots unmount themselves.

## Canvas and shape conventions

-   Use Lottie **shape layers** (`ty: 4`) compatible with the `lottie_light` SVG player. Avoid external image assets and unsupported features.
-   Use a 200 x 200 scene centred near `[100, 100]` or a 120 x 120 burst centred near `[60, 60]`, as appropriate.
-   The layer's `ks.p` is an **explicit transform**, not an intrinsic Lottie default. If a helper defaults it to `[100, 100]`, override that for a 120 x 120 burst.
-   Shape geometry should be **layer-local**. A shape with composition-absolute vertices must not also be shifted by an extra `[100, 100]` layer position. The asset tests check that drawn points stay within the canvas plus a small bleed margin.
-   **Layer order and group order affect paint order.** Check the rendered stacking of a mark over a badge, a card over a box, and foreground pieces over background pieces. Verify the actual preview rather than relying on assumptions about order.
-   A feedback burst should start and end **invisible**, so no frozen icon remains visible at the seam. The asset tests also require seamless loops for the scene assets they cover.

## Placeholder colour contract

Animation JSON must use **only** the three documented placeholder RGB colours below, not hard-coded brand colours. [`LottieAnimation.vue`](../LottieAnimation.vue) replaces them with CSS variables for the active theme.

| Placeholder | RGB             | Replaced with                  |
| ----------- | --------------- | ------------------------------ |
| Primary     | `24, 121, 78`   | `--ion-color-primary`          |
| Accent      | `60, 142, 106`  | `--ion-color-primary-tint`     |
| Contrast    | `250, 250, 250` | `--ion-color-primary-contrast` |

Use **Contrast** for marks that need to stand out against a filled Primary/Accent shape, such as a checkmark in a badge. Always inspect legibility in **both light and dark themes**. The consuming component may remap the CSS colours for a specific context, so the placeholders represent roles rather than fixed visual hues.

Do not introduce additional green shades, pure white, or transparent-white fills as separate colours. A fill that needs no colour should be removed instead of being given an unsupported RGBA colour.

## Motion and visual design

Easing generally follows the tokens in `src/styles/variables.css`:

-   `cubic-bezier(0.2, 0, 0, 1)` (`--ease-standard`)
-   `cubic-bezier(0.3, 0, 0, 1)` (`--ease-emphasized`)

For loops, make the animation seamless by hiding elements at both ends or returning every visible transform to its initial state (a complete 360-degree rotation is another possibility). Avoid an abrupt visual reset.

Keep the illustrations within one recognisable vocabulary-learning visual system:

-   Rounded **flashcards** and the folded **Leitner boxes** represent words and progress.
-   Consistent rounded **avatars** represent members and cohorts.
-   Small, restrained **checkmarks, crosses, stars/trophies, and sparkles** represent feedback and success.
-   The spaced-repetition explanation uses a **calendar** to show review days rather than hours. Do not imply precise intervals, scoring, or automatic correctness decisions unless the actual app supplies them.
-   The UI owns essential copy. Text embedded as vector outlines inside an animation is decorative and should remain intelligible at its actual rendered CSS size, particularly on mobile.

## Accessibility

Respect `prefers-reduced-motion: reduce`. `LottieAnimation.vue` is documented to display the consuming component's static `fallback` rather than autoplay under reduced motion. Provide a meaningful fallback whenever a visual state needs to be communicated, and do not rely on movement alone for important information.

## Development and verification

The gallery is generated from the JSON currently in the repository. **Regenerate it after changing animation files**; an older `lottie-preview.html` contains older embedded copies of the JSON.

```bash
npm run lottie:preview
npm test -- --runInBand tests/unit/lottie-assets.spec.ts
npm run ci
```

Before committing a new or revised animation:

1. Confirm that `fr`, `ip`, `op`, canvas dimensions, shape layers, and keyframes match its intended format.
2. Check that every fill and stroke colour uses the three placeholders.
3. Preview the complete animation in light and dark themes at realistic in-app sizes.
4. Check canvas boundaries and the first/last frames (or loop seam).
5. Ensure the asset is included in `tests/unit/lottie-assets.spec.ts` if it should be protected by the shared asset contract. **New files are not automatically covered simply because they are in `src/media/lottie`.**
6. Check the consuming Vue component's `loop`, completion handling, and fallback behaviour.
