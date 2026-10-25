'use strict';

/**
 * Lottie preview gallery.
 *
 * Renders every animation in `src/media/lottie` on one page so they can be
 * reviewed side by side, with a light/dark switch that applies the same
 * placeholder-palette swap `LottieAnimation.vue` does at runtime.
 *
 * The page is self-contained: the assets are inlined and the player is loaded
 * from `node_modules`, so it works straight off the file system with no server.
 *
 * Usage: node scripts/lottie-preview.cjs
 */

const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'src', 'media', 'lottie');
const outputFile = path.join(projectRoot, 'lottie-preview.html');
const playerPath = 'node_modules/lottie-web/build/player/lottie_light.min.js';

/**
 * The authoring contract, mirrored from `LottieAnimation.vue` and
 * `src/media/lottie/README.md`: assets are drawn in these three placeholder
 * colours and the app swaps them for the palette of the active theme.
 */
const PLACEHOLDER_PALETTE = {
    primary: [24, 121, 78],
    accent: [60, 142, 106],
    contrast: [250, 250, 250],
};

const THEMES = {
    light: {
        primary: [24, 121, 78],
        accent: [60, 142, 106],
        contrast: [250, 250, 250],
    },
    dark: {
        primary: [105, 167, 140],
        accent: [125, 179, 155],
        contrast: [13, 31, 30],
    },
};

const COLOR_TOLERANCE = 2;
const COLOR_SHAPE_TYPES = ['fl', 'st'];

const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const toBytes = (channels) => [
    Math.round(channels[0] * 255),
    Math.round(channels[1] * 255),
    Math.round(channels[2] * 255),
];

const matchPlaceholder = (bytes) =>
    Object.keys(PLACEHOLDER_PALETTE).find((key) =>
        PLACEHOLDER_PALETTE[key].every((channel, index) => Math.abs(channel - bytes[index]) <= COLOR_TOLERANCE),
    ) ?? null;

/** Recolours one document for a theme, and reports colours outside the contract. */
const applyTheme = (node, palette, report) => {
    if (Array.isArray(node)) {
        node.forEach((child) => applyTheme(child, palette, report));
        return;
    }

    if (!isRecord(node)) {
        return;
    }

    if (typeof node.ty === 'string' && COLOR_SHAPE_TYPES.includes(node.ty)) {
        const color = node.c;

        if (isRecord(color) && color.a === 0 && Array.isArray(color.k)) {
            const key = matchPlaceholder(toBytes(color.k));

            if (key) {
                const [red, green, blue] = palette[key];
                color.k = [red / 255, green / 255, blue / 255, color.k[3] ?? 1];
            } else {
                report.push(toBytes(color.k).join(','));
            }
        }
    }

    Object.values(node).forEach((child) => applyTheme(child, palette, report));
};

const readAssets = () =>
    fs
        .readdirSync(assetsDir)
        .filter((file) => file.endsWith('.json'))
        .sort()
        .map((file) => {
            const document = JSON.parse(fs.readFileSync(path.join(assetsDir, file), 'utf8'));
            const offPalette = [];
            applyTheme(document, THEMES.light, offPalette);

            return {
                name: file.replace(/\.json$/, ''),
                // A looping asset spans the full 120 frames; a one-shot is short
                // and invisible at both ends, so it needs a replay button.
                loop: document.op > 60,
                width: document.w,
                height: document.h,
                frameRate: document.fr,
                frames: document.op,
                layers: Array.isArray(document.layers) ? document.layers.length : 0,
                offPalette: [...new Set(offPalette)],
                document,
            };
        });

const buildHtml = (assets) => {
    const inline = JSON.stringify(assets).replace(/</g, '\\u003c');

    return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Lottie gallery</title>
        <style>
            :root {
                --page: #f2f7f4;
                --card: #fafafa;
                --border: #dbe1df;
                --text: #0d1f1e;
                --muted: #52605e;
                --primary: #18794e;
                --pill: #eaf2ee;
            }

            body.dark {
                --page: #0d1f1e;
                --card: #1d2822;
                --border: #26332c;
                --text: #eef2f0;
                --muted: #9fb0ab;
                --primary: #69a78c;
                --pill: #1c2a22;
            }

            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                padding: 32px;
                background: var(--page);
                color: var(--text);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            header {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 12px;
                margin-bottom: 8px;
            }

            h1 {
                margin: 0;
                font-size: 22px;
            }

            .count {
                padding: 4px 12px;
                border-radius: 999px;
                background: var(--pill);
                color: var(--primary);
                font-size: 13px;
                font-weight: 600;
            }

            .spacer {
                flex: 1;
            }

            button {
                padding: 8px 14px;
                border: 1px solid var(--border);
                border-radius: 10px;
                background: var(--card);
                color: var(--primary);
                font: inherit;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
            }

            button:hover {
                border-color: var(--primary);
            }

            .lede {
                max-width: 70ch;
                margin: 0 0 24px;
                color: var(--muted);
                font-size: 14px;
                line-height: 1.5;
            }

            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 16px;
            }

            .card {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 16px;
                border: 1px solid var(--border);
                border-radius: 16px;
                background: var(--card);
            }

            .card__head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
            }

            .card__name {
                margin: 0;
                font-size: 15px;
                font-weight: 700;
                word-break: break-word;
            }

            .tag {
                flex: 0 0 auto;
                padding: 2px 8px;
                border-radius: 999px;
                background: var(--pill);
                color: var(--muted);
                font-size: 11px;
                font-weight: 600;
                text-transform: none;
            }

            .stage {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 180px;
                padding: 8px;
            }

            .stage > div {
                width: 160px;
                max-width: 100%;
            }

            .meta {
                margin: 0;
                color: var(--muted);
                font-size: 12px;
                line-height: 1.5;
            }

            .warn {
                color: #b3261e;
                font-weight: 600;
            }

        </style>
    </head>
    <body>
        <header>
            <h1>Lottie gallery</h1>
            <span class="count" id="count"></span>
            <span class="spacer"></span>
            <button type="button" id="theme">Switch to dark</button>
        </header>

        <p class="lede">
            Every animation in <code>src/media/lottie</code>, rendered with the same player and the same
            placeholder-palette swap the app uses, so switching theme here is what the app does at runtime. The
            loading spinner is not here: it is plain CSS in <code>src/views/shared/Spinner.vue</code> so it can paint
            before any JavaScript loads. One-shots are tagged as such but looped on this page, because they are
            invisible on their first and last frame and would otherwise play once and disappear.
        </p>

        <div class="grid" id="grid"></div>

        <script src="${playerPath}"></script>
        <script>
            const ASSETS = ${inline};

            const THEMES = ${JSON.stringify(THEMES)};

            const COLOR_TOLERANCE = ${COLOR_TOLERANCE};
            const PLACEHOLDERS = ${JSON.stringify(PLACEHOLDER_PALETTE)};
            const COLOR_SHAPES = ${JSON.stringify(COLOR_SHAPE_TYPES)};

            const clone = (value) => JSON.parse(JSON.stringify(value));

            const matchPlaceholder = (bytes) =>
                Object.keys(PLACEHOLDERS).find((key) =>
                    PLACEHOLDERS[key].every((channel, index) => Math.abs(channel - bytes[index]) <= COLOR_TOLERANCE),
                ) ?? null;

            const theme = (node, palette) => {
                if (Array.isArray(node)) {
                    node.forEach((child) => theme(child, palette));
                    return;
                }

                if (!node || typeof node !== 'object') {
                    return;
                }

                if (typeof node.ty === 'string' && COLOR_SHAPES.includes(node.ty)) {
                    const color = node.c;

                    if (color && color.a === 0 && Array.isArray(color.k)) {
                        const key = matchPlaceholder(color.k.slice(0, 3).map((channel) => Math.round(channel * 255)));

                        if (key) {
                            const [red, green, blue] = palette[key];
                            color.k = [red / 255, green / 255, blue / 255, color.k[3] ?? 1];
                        }
                    }
                }

                Object.values(node).forEach((child) => theme(child, palette));
            };

            const players = new Map();
            let currentTheme = 'light';

            const render = (asset, container) => {
                const existing = players.get(container);

                if (existing) {
                    existing.destroy();
                }

                const document = clone(asset.document);
                theme(document, THEMES[currentTheme]);

                players.set(
                    container,
                    lottie.loadAnimation({
                        container,
                        renderer: 'svg',
                        // One-shots are invisible at both ends by contract, so
                        // playing them once would leave an empty card. They loop
                        // here, skipping the two invisible frames, so the card
                        // always shows something. The app still plays them once.
                        loop: true,
                        autoplay: true,
                        animationData: document,
                        ...(asset.loop ? {} : { initialSegment: [1, asset.frames - 1] }),
                    }),
                );
            };

            const grid = document.getElementById('grid');
            document.getElementById('count').textContent = ASSETS.length + ' animations';

            const containers = [];

            ASSETS.forEach((asset) => {
                const card = document.createElement('article');
                card.className = 'card';

                const head = document.createElement('div');
                head.className = 'card__head';

                const name = document.createElement('h2');
                name.className = 'card__name';
                name.textContent = asset.name;

                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = asset.loop ? 'looping' : 'one-shot';

                head.append(name, tag);

                const stage = document.createElement('div');
                stage.className = 'stage';

                const surface = document.createElement('div');
                stage.append(surface);

                const meta = document.createElement('p');
                meta.className = 'meta';
                meta.innerHTML =
                    asset.width + 'x' + asset.height + ' &middot; ' + asset.frames + ' frames @ ' + asset.frameRate + 'fps &middot; ' + asset.layers + ' layers';

                if (asset.offPalette.length) {
                    const warn = document.createElement('span');
                    warn.className = 'warn';
                    warn.textContent = ' colours outside the palette: ' + asset.offPalette.join(' / ');
                    meta.append(warn);
                }

                card.append(head, stage, meta);

                grid.append(card);
                containers.push({ asset, surface });
            });

            containers.forEach(({ asset, surface }) => render(asset, surface));

            document.getElementById('theme').addEventListener('click', (event) => {
                currentTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.body.classList.toggle('dark', currentTheme === 'dark');
                event.currentTarget.textContent = currentTheme === 'light' ? 'Switch to dark' : 'Switch to light';
                containers.forEach(({ asset, surface }) => render(asset, surface));
            });
        </script>
    </body>
</html>
`;
};

const assets = readAssets();

if (!assets.length) {
    console.error(`No animations found in ${assetsDir}`);
    process.exitCode = 1;
} else if (!fs.existsSync(path.join(projectRoot, playerPath))) {
    console.error(`Missing the Lottie player at ${playerPath}. Run npm install first.`);
    process.exitCode = 1;
} else {
    fs.writeFileSync(outputFile, buildHtml(assets));

    const offPalette = assets.filter((asset) => asset.offPalette.length);
    process.stdout.write(`Wrote ${outputFile} with ${assets.length} animations.\n`);

    if (offPalette.length) {
        offPalette.forEach((asset) =>
            process.stdout.write(`  ${asset.name}: colours outside the palette (${asset.offPalette.join(' / ')})\n`),
        );
    }

    process.stdout.write('Open it in a browser. No server needed.\n');
}
