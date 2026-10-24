/**
 * A decoded Lottie/bodymovin document, as imported from this folder.
 *
 * `LottieAnimation.vue` reads `w`/`h` for the aspect ratio and hands everything
 * else to lottie-web untouched, so the rest of the payload is opaque to us.
 * Imported JSON already carries `w`/`h` as numbers, which is why callers can
 * pass it straight through without casting.
 */
export type LottieAnimationData = Record<string, unknown> & { w: number; h: number };
