import answerCorrect from '@/media/lottie/answer-correct.json';
import answerIncorrect from '@/media/lottie/answer-incorrect.json';
import cohortWaiting from '@/media/lottie/cohort-waiting.json';
import emptyFlashcards from '@/media/lottie/empty-flashcards.json';
import emptySearch from '@/media/lottie/empty-search.json';
import emptyVocabularies from '@/media/lottie/empty-vocabularies.json';
import flashcardCreated from '@/media/lottie/flashcard-created.json';
import funGame from '@/media/lottie/fun-game.json';
import gameComplete from '@/media/lottie/game-complete.json';
import joinUs from '@/media/lottie/join-us.json';
import mastered from '@/media/lottie/mastered.json';
import noConnection from '@/media/lottie/no-connection.json';
import retention from '@/media/lottie/retention.json';
import spacedRepetition from '@/media/lottie/spaced-repetition.json';
import waitingForReview from '@/media/lottie/waiting-for-review.json';

/**
 * The animations are the contract shared with `LottieAnimation.vue`. These tests
 * guard the things that break silently at runtime: the bodymovin structure, the
 * placeholder palette the component swaps for theme colors, the loop/one-shot
 * conventions, and geometry that would render outside the canvas.
 */

interface Keyframe {
    t: number;
    s: number[];
}

interface Track {
    a: number;
    k: number | number[] | Keyframe[];
}

interface ShapeLayer {
    ty: number;
    ind: number;
    nm: string;
    ip: number;
    op: number;
    ks: { o: Track; r: Track; p: Track; a: Track; s: Track };
    shapes: unknown[];
}

interface LottieDocument {
    v: string;
    fr: number;
    ip: number;
    op: number;
    w: number;
    h: number;
    layers: ShapeLayer[];
}

interface Asset {
    document: LottieDocument;
    loop: boolean;
}

/** Kept in sync with PLACEHOLDER_PALETTE in LottieAnimation.vue. */
const PLACEHOLDER_PALETTE: Record<string, number[]> = {
    primary: [24, 121, 78],
    accent: [60, 142, 106],
    contrast: [250, 250, 250],
};

const COLOR_TOLERANCE = 2;
/** Room for strokes and round joins/caps, which are not part of the geometry check. */
const BLEED_MARGIN = 12;

const asDocument = (value: unknown): LottieDocument => value as unknown as LottieDocument;

const assets: Record<string, Asset> = {
    retention: { document: asDocument(retention), loop: true },
    'spaced-repetition': { document: asDocument(spacedRepetition), loop: true },
    'join-us': { document: asDocument(joinUs), loop: true },
    'fun-game': { document: asDocument(funGame), loop: true },
    'game-complete': { document: asDocument(gameComplete), loop: true },
    'empty-flashcards': { document: asDocument(emptyFlashcards), loop: true },
    'waiting-for-review': { document: asDocument(waitingForReview), loop: true },
    'cohort-waiting': { document: asDocument(cohortWaiting), loop: true },
    'empty-vocabularies': { document: asDocument(emptyVocabularies), loop: true },
    'empty-search': { document: asDocument(emptySearch), loop: true },
    'no-connection': { document: asDocument(noConnection), loop: true },
    'answer-correct': { document: asDocument(answerCorrect), loop: false },
    'answer-incorrect': { document: asDocument(answerIncorrect), loop: false },
    mastered: { document: asDocument(mastered), loop: false },
    'flashcard-created': { document: asDocument(flashcardCreated), loop: false },
};

const asArray = (value: number | number[]): number[] => (Array.isArray(value) ? value : [value]);

/** Value of a property at `frame`, approximating lottie's "hold last keyframe" rule. */
const valueAt = (track: Track, frame: number): number[] => {
    if (track.a === 0) {
        return asArray(track.k as number | number[]);
    }

    const keyframes = track.k as Keyframe[];
    const current = keyframes.filter((keyframe) => keyframe.t <= frame).pop() ?? keyframes[0];

    return current.s;
};

const collectColors = (node: unknown, colors: number[][] = []): number[][] => {
    if (Array.isArray(node)) {
        node.forEach((child) => collectColors(child, colors));
        return colors;
    }

    if (typeof node !== 'object' || node === null) {
        return colors;
    }

    const candidate = node as { ty?: string; c?: { a: number; k: number[] } };

    if (
        candidate.c &&
        candidate.c.a === 0 &&
        Array.isArray(candidate.c.k) &&
        ['fl', 'st'].includes(candidate.ty ?? '')
    ) {
        colors.push(candidate.c.k);
    }

    Object.values(candidate).forEach((child) => collectColors(child, colors));

    return colors;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/** Every animated property (`a: 1`) in the document, regardless of where it sits. */
const collectTracks = (node: unknown, tracks: unknown[][] = []): unknown[][] => {
    if (Array.isArray(node)) {
        node.forEach((child) => collectTracks(child, tracks));
        return tracks;
    }

    if (!isRecord(node)) {
        return tracks;
    }

    if (node.a === 1 && Array.isArray(node.k)) {
        tracks.push(node.k);
    }

    Object.values(node).forEach((child) => collectTracks(child, tracks));

    return tracks;
};

const staticValue = (track: unknown, fallback: number[]): number[] => {
    if (!isRecord(track) || track.k === undefined) {
        return fallback;
    }

    if (Array.isArray(track.k)) {
        return track.k.every((item) => typeof item === 'number') ? (track.k as number[]) : (track.k as Keyframe[])[0].s;
    }

    return [track.k as number];
};

/**
 * Bounding points of the artwork of one layer, in layer space, with the nested
 * group transforms folded in. Rotations are ignored: they can only shrink a
 * rotated box back towards the circle the check already tolerates.
 */
const collectPoints = (items: unknown[], offset: number[], scale: number): number[][] => {
    const points: number[][] = [];

    items.forEach((item) => {
        if (!isRecord(item)) {
            return;
        }

        if (item.ty === 'gr' && Array.isArray(item.it)) {
            const parts = item.it as Record<string, unknown>[];
            const transform = parts.find((child) => child.ty === 'tr') ?? {};
            const position = staticValue(transform.p, [0, 0]);
            const anchor = staticValue(transform.a, [0, 0]);
            const size = staticValue(transform.s, [100, 100]);

            points.push(
                ...collectPoints(
                    parts,
                    [offset[0] + position[0] - anchor[0], offset[1] + position[1] - anchor[1]],
                    scale * (size[0] / 100),
                ),
            );
            return;
        }

        if (item.ty === 'sh') {
            const path = item.ks as { k?: { v?: number[][] } };
            (path.k?.v ?? []).forEach((vertex) => {
                points.push([offset[0] + vertex[0] * scale, offset[1] + vertex[1] * scale]);
            });
            return;
        }

        if (['el', 'rc', 'sr'].includes(item.ty as string)) {
            const center = staticValue(item.p, [0, 0]);
            const radius = item.ty === 'sr' ? staticValue(item.or, [0])[0] : staticValue(item.s, [0, 0])[0] / 2;
            const radiusY = item.ty === 'sr' ? radius : staticValue(item.s, [0, 0])[1] / 2;

            points.push(
                [offset[0] + (center[0] - radius) * scale, offset[1] + (center[1] - radiusY) * scale],
                [offset[0] + (center[0] + radius) * scale, offset[1] + (center[1] + radiusY) * scale],
            );
        }
    });

    return points;
};

const drawnPoints = (layer: ShapeLayer, document: LottieDocument): number[][] => {
    const local = collectPoints(layer.shapes, [0, 0], 1);
    const anchor = staticValue(layer.ks.a, [0, 0]);
    const positions =
        layer.ks.p.a === 0 ? [asArray(layer.ks.p.k as number[])] : (layer.ks.p.k as Keyframe[]).map((k) => k.s);
    const scale = Math.max(
        ...(layer.ks.s.a === 0
            ? [asArray(layer.ks.s.k as number[])[0] / 100]
            : (layer.ks.s.k as Keyframe[]).map((keyframe) => keyframe.s[0] / 100)),
    );

    return positions.flatMap((position) =>
        local.map((point) => [
            position[0] + (point[0] - anchor[0]) * scale,
            position[1] + (point[1] - anchor[1]) * scale,
        ]),
    );
};

describe('Lottie animation assets', () => {
    describe.each(Object.entries(assets))('%s', (_name, asset) => {
        const { document, loop } = asset;

        it('SHOULD be a valid shape-layer composition', () => {
            expect(document.v).toEqual(expect.any(String));
            expect(document.fr).toBe(30);
            expect(document.ip).toBe(0);
            expect(document.op).toBe(loop ? 120 : 45);
            expect(document.w).toBe(loop ? 200 : 120);
            expect(document.h).toBe(loop ? 200 : 120);
            expect(Array.isArray(document.layers)).toBe(true);
            expect(document.layers.length).toBeGreaterThan(0);

            document.layers.forEach((layer) => {
                expect(layer.ty).toBe(4);
                expect(layer.shapes.length).toBeGreaterThan(0);
                expect(layer.ip).toBe(0);
                expect(layer.op).toBe(document.op);
                expect(Object.keys(layer.ks)).toEqual(expect.arrayContaining(['o', 'r', 'p', 'a', 's']));
            });
        });

        it('SHOULD express every keyframe as an object, the only shape the runtime parses', () => {
            const tracks = collectTracks(document);

            expect(tracks.length).toBeGreaterThan(0);

            tracks.forEach((keyframes) => {
                keyframes.forEach((keyframe) => {
                    // A bare `[time, value]` array makes lottie bail out silently.
                    expect(Array.isArray(keyframe)).toBe(false);
                    expect(isRecord(keyframe)).toBe(true);

                    if (!isRecord(keyframe)) {
                        return;
                    }

                    expect(typeof keyframe.t).toBe('number');
                    expect(Array.isArray(keyframe.s)).toBe(true);
                });
            });
        });

        it('SHOULD only use the documented placeholder palette so theming can swap it', () => {
            const colors = collectColors(document.layers);

            expect(colors.length).toBeGreaterThan(0);

            colors.forEach((color) => {
                const bytes = color.slice(0, 3).map((channel) => Math.round(channel * 255));
                const matches = Object.values(PLACEHOLDER_PALETTE).some((placeholder) =>
                    placeholder.every((channel, index) => Math.abs(channel - bytes[index]) <= COLOR_TOLERANCE),
                );

                expect(matches).toBe(true);
            });
        });

        it('SHOULD draw every layer inside the composition', () => {
            document.layers.forEach((layer) => {
                drawnPoints(layer, document).forEach(([x, y]) => {
                    expect(x).toBeGreaterThanOrEqual(-BLEED_MARGIN);
                    expect(x).toBeLessThanOrEqual(document.w + BLEED_MARGIN);
                    expect(y).toBeGreaterThanOrEqual(-BLEED_MARGIN);
                    expect(y).toBeLessThanOrEqual(document.h + BLEED_MARGIN);
                });
            });
        });

        if (loop) {
            it('SHOULD loop seamlessly', () => {
                document.layers.forEach((layer) => {
                    const startOpacity = valueAt(layer.ks.o, document.ip)[0];
                    const endOpacity = valueAt(layer.ks.o, document.op)[0];

                    // Invisible at the loop seam: the restart cannot be perceived.
                    if (startOpacity === 0 && endOpacity === 0) {
                        return;
                    }

                    (['o', 'p', 'a', 's'] as const).forEach((property) => {
                        expect(valueAt(layer.ks[property], document.ip)).toEqual(
                            valueAt(layer.ks[property], document.op),
                        );
                    });

                    const startRotation = valueAt(layer.ks.r, document.ip)[0];
                    const endRotation = valueAt(layer.ks.r, document.op)[0];

                    expect(Math.abs(endRotation - startRotation) % 360).toBe(0);
                });
            });
        } else {
            it('SHOULD be invisible on the first and the last frame', () => {
                document.layers.forEach((layer) => {
                    expect(valueAt(layer.ks.o, document.ip)[0]).toBe(0);
                    expect(valueAt(layer.ks.o, document.op)[0]).toBe(0);
                });
            });
        }
    });
});
