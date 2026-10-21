'use strict';

/**
 * Play Store image renderer.
 *
 * Takes the raw app screenshots from `play-store/raw/<device>/` and composes the
 * final branded marketing images (headline + app screenshot) for each device type
 * into:
 *
 *   play-store/rendered/<device>/
 *
 * Dimensions follow Google Play's screenshot requirements:
 *   - PNG (24-bit, no alpha), smallest side >= 320px, largest side <= 3840px and
 *     no more than twice the smallest side.
 *   - Large screens (tablets): 9:16 portrait, between 1,080 and 7,680px.
 *
 * The layout is derived from the canvas width, so every device keeps the same
 * proportions. Everything is driven by `screens.json`. Upload the output manually.
 *
 * Usage: node scripts/play-store/render.cjs
 */

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const config = require('./screens.json');

const projectRoot = path.resolve(__dirname, '..', '..');
const rawDir = path.join(projectRoot, 'play-store', 'raw');
const renderedDir = path.join(projectRoot, 'play-store', 'rendered');

const brand = config.brand;

// The phone canvas is the design reference; every other size scales from it.
const REFERENCE_WIDTH = 1080;

const escapeXml = (value) =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

/**
 * Very small greedy word-wrap that estimates glyph widths. Good enough for
 * short marketing headlines and avoids pulling in a font-metrics dependency.
 */
function wrapText(text, fontSize, maxWidth) {
    const averageGlyphRatio = 0.55;
    const maxChars = Math.max(8, Math.floor(maxWidth / (fontSize * averageGlyphRatio)));
    const words = String(text).split(/\s+/);
    const lines = [];
    let current = '';

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length > maxChars && current) {
            lines.push(current);
            current = word;
        } else {
            current = candidate;
        }
    }
    if (current) {
        lines.push(current);
    }
    return lines;
}

/** Computes the shared vertical rhythm for a device, scaled from the reference. */
function layoutFor(device, screen) {
    const { width, height } = device.canvas;
    const scale = width / REFERENCE_WIDTH;

    const headlineFontSize = 84 * scale;
    const headlineLineHeight = 100 * scale;
    const headlineTop = 96 * scale;
    const headlineLines = wrapText(screen.headline, headlineFontSize, width - 140 * scale);
    const headlineBottom = headlineTop + headlineLines.length * headlineLineHeight;

    const footerFontSize = 38 * scale;
    const footerBaseline = height - 46 * scale;

    const screenshotTop = headlineBottom + 72 * scale;
    const screenshotBottomLimit = footerBaseline - footerFontSize - 24 * scale;

    return {
        scale,
        headlineFontSize,
        headlineLineHeight,
        headlineTop,
        headlineLines,
        footerFontSize,
        footerBaseline,
        screenshotTop,
        screenshotBottomLimit,
    };
}

function decoration(width, height) {
    return (
        `<circle cx="${width - 40}" cy="40" r="${Math.round(width * 0.31)}" fill="${
            brand.backgroundAccent
        }" opacity="0.35" />` +
        `<circle cx="20" cy="${height - 120}" r="${Math.round(width * 0.28)}" fill="${
            brand.backgroundAccentDeep
        }" opacity="0.28" />` +
        `<circle cx="${width - 60}" cy="${height - 40}" r="${Math.round(width * 0.2)}" fill="${
            brand.backgroundAccent
        }" opacity="0.22" />`
    );
}

function buildBackgroundSvg(device, screen, layout) {
    const { width, height } = device.canvas;
    const { headlineFontSize, headlineLineHeight, headlineTop, headlineLines, footerFontSize, footerBaseline } = layout;

    const firstBaseline = headlineTop + headlineFontSize * 0.82;
    const tspans = headlineLines
        .map(
            (line, index) =>
                `<tspan x="${width / 2}" y="${firstBaseline + index * headlineLineHeight}">${escapeXml(line)}</tspan>`,
        )
        .join('');

    const headline =
        `<text font-family="${brand.headlineFont}" font-size="${headlineFontSize}" font-weight="bold" ` +
        `fill="${brand.headlineColor}" text-anchor="middle">${tspans}</text>`;

    const footer = config.footer
        ? `<text x="${width / 2}" y="${footerBaseline}" font-family="${
              brand.headlineFont
          }" font-size="${footerFontSize}" ` +
          `font-weight="600" letter-spacing="${1.5 * layout.scale}" fill="${brand.footerColor}" text-anchor="middle">` +
          `${escapeXml(config.footer)}</text>`
        : '';

    return Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
            `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">` +
            `<stop offset="0" stop-color="${brand.background}"/>` +
            `<stop offset="1" stop-color="${brand.backgroundAccentDeep}"/>` +
            `</linearGradient></defs>` +
            `<rect width="${width}" height="${height}" fill="url(#bg)"/>` +
            decoration(width, height) +
            headline +
            footer +
            `<rect x="0" y="0" width="${width}" height="${height}" fill="none" ` +
            `stroke="${brand.backgroundAccentDeep}" stroke-opacity="0.25" stroke-width="${Math.max(
                2,
                Math.round(2 * layout.scale),
            )}"/>` +
            `</svg>`,
    );
}

async function renderScreen(device, screen) {
    const rawPath = path.join(rawDir, device.id, `${screen.id}.png`);
    if (!fs.existsSync(rawPath)) {
        throw new Error(`missing raw capture: ${path.relative(projectRoot, rawPath)}`);
    }

    const { width: canvasWidth, height: canvasHeight, screenshotWidth: maxScreenshotWidth } = device.canvas;
    const layout = layoutFor(device, screen);
    const { scale, screenshotTop, screenshotBottomLimit } = layout;

    // Fit the screenshot to the space between the headline and the footer, but
    // never wider than the configured cap (keeps every screen the same width).
    const availableHeight = screenshotBottomLimit - screenshotTop;
    const raw = await sharp(rawPath).metadata();
    const availableWidth = Math.floor((availableHeight * raw.width) / raw.height);
    const screenshotWidth = Math.max(1, Math.min(maxScreenshotWidth, availableWidth));

    const { data: baseBuffer, info } = await sharp(rawPath)
        .resize({ width: screenshotWidth })
        .png()
        .toBuffer({ resolveWithObject: true });

    const shotWidth = info.width;
    const shotHeight = info.height;
    const shotLeft = Math.round((canvasWidth - shotWidth) / 2);
    const top = Math.round(screenshotTop);
    const radius = Math.round(46 * scale);

    const mask = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${shotWidth}" height="${shotHeight}">` +
            `<rect x="0" y="0" width="${shotWidth}" height="${shotHeight}" rx="${radius}" ry="${radius}" fill="#fff"/>` +
            `</svg>`,
    );

    const rounded = await sharp(baseBuffer)
        .composite([{ input: mask, blend: 'dest-in' }])
        .png()
        .toBuffer();

    const borderWidth = Math.max(3, Math.round(3 * scale));
    const border = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${shotWidth}" height="${shotHeight}">` +
            `<rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${shotWidth - borderWidth}" ` +
            `height="${shotHeight - borderWidth}" rx="${radius}" ry="${radius}" ` +
            `fill="none" stroke="${brand.screenshotBorder}" stroke-width="${borderWidth}"/>` +
            `</svg>`,
    );

    const shadowPad = Math.round(60 * scale);
    const shadow = await sharp(
        Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${shotWidth + shadowPad * 2}" ` +
                `height="${shotHeight + shadowPad * 2}">` +
                `<rect x="${shadowPad}" y="${shadowPad}" width="${shotWidth}" height="${shotHeight}" ` +
                `rx="${radius}" ry="${radius}" fill="rgba(0,0,0,0.42)"/>` +
                `</svg>`,
        ),
    )
        .blur(Math.round(26 * scale))
        .png()
        .toBuffer();

    const outDir = path.join(renderedDir, device.id);
    const outPath = path.join(outDir, `${screen.id}.png`);

    await sharp(buildBackgroundSvg(device, screen, layout))
        .composite([
            { input: shadow, top: top - shadowPad + Math.round(22 * scale), left: shotLeft - shadowPad },
            { input: rounded, top, left: shotLeft },
            { input: border, top, left: shotLeft },
        ])
        // Google Play requires 24-bit PNGs without an alpha channel.
        .removeAlpha()
        .png()
        .toFile(outPath);

    return { outPath, width: shotWidth, height: shotHeight };
}

async function main() {
    fs.mkdirSync(renderedDir, { recursive: true });

    let failures = 0;
    let total = 0;

    for (const device of config.devices) {
        fs.mkdirSync(path.join(renderedDir, device.id), { recursive: true });
        console.log(`${device.label} (${device.canvas.width}x${device.canvas.height})`);
        for (const screen of config.screens) {
            total += 1;
            try {
                const { width, height } = await renderScreen(device, screen);
                console.log(`  rendered ${device.id}/${screen.id} (screenshot ${width}x${height})`);
            } catch (error) {
                failures += 1;
                console.error(`  FAILED ${device.id}/${screen.id}: ${error.message}`);
            }
        }
    }

    if (failures > 0) {
        console.error(`\n${failures} of ${total} render(s) failed.`);
        process.exitCode = 1;
        return;
    }
    console.log(`\nRendered ${total} image(s) into play-store/rendered/.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
