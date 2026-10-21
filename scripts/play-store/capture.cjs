'use strict';

/**
 * Play Store screenshot capture.
 *
 * Drives the running app with Playwright for each supported device type
 * (phone, 7-inch tablet, 10-inch tablet), stubs the Google sign-in library,
 * intercepts the backend API and answers with deterministic fixtures, then
 * saves one raw PNG per screen into `play-store/raw/<device>/`.
 *
 * The app must be running with the screenshot flag enabled, e.g.
 *   VUE_APP_STORE_SCREENSHOTS=true npm run serve
 *
 * Usage: node scripts/play-store/capture.cjs
 */

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const config = require('./screens.json');
const fixtures = require('./fixtures.cjs');

const projectRoot = path.resolve(__dirname, '..', '..');
const rawDir = path.join(projectRoot, 'play-store', 'raw');
const apiUrlPattern = '**/rest/ielts-service/**';

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function sendJson(route, body, status = 200) {
    return route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
    });
}

function handleApiRequest(route) {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^.*\/rest\/ielts-service/, '');
    const method = request.method();

    if (pathname.startsWith('/v1/leitner-systems/items/count/')) {
        const box = pathname.split('/').pop();
        return sendJson(route, fixtures.leitnerCounts[box] ?? 0);
    }

    if (pathname === '/v1/cohorts/self') {
        return sendJson(route, fixtures.cohort);
    }

    if (pathname === '/v1/vocabularies/definitions/random-search') {
        return sendJson(route, fixtures.guessingGame);
    }

    if (pathname === '/v1/vocabularies/search' && method === 'POST') {
        return sendJson(route, fixtures.buildSearchResponse());
    }

    if (pathname === '/v1/vocabularies/bootstrap') {
        return sendJson(route, fixtures.buildSearchResponse());
    }

    if (pathname === `/v1/vocabularies/${fixtures.VOCABULARY_ID}`) {
        return sendJson(route, fixtures.carrionVocabulary);
    }

    if (pathname.startsWith('/v1/vocabularies/')) {
        return sendJson(route, fixtures.carrionVocabulary);
    }

    return sendJson(route, {});
}

async function captureScreen(browser, device, screen) {
    const context = await browser.newContext({
        viewport: device.capture.viewport,
        deviceScaleFactor: device.capture.deviceScaleFactor,
        isMobile: true,
        hasTouch: true,
        locale: 'en-US',
        timezoneId: 'UTC',
        ignoreHTTPSErrors: true,
        colorScheme: screen.colorScheme === 'dark' ? 'dark' : 'light',
        reducedMotion: 'reduce',
    });

    // The app calls window.google.accounts.id.initialize() on load. Stub it so
    // the screenshots never depend on Google's servers.
    await context.addInitScript(() => {
        window.google = {
            accounts: {
                id: {
                    initialize: () => undefined,
                    renderButton: () => undefined,
                    prompt: () => undefined,
                    disableAutoSelect: () => undefined,
                },
            },
        };
    });

    await context.route(apiUrlPattern, handleApiRequest);
    await context.route('**/accounts.google.com/**', (route) => route.abort());

    const page = await context.newPage();
    const url = `${config.capture.baseUrl}${screen.route}`;
    const target = path.join(rawDir, device.id, `${screen.id}.png`);

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        if (screen.waitFor) {
            await page.locator(screen.waitFor).first().waitFor({ state: 'visible', timeout: 30000 });
        }
        if (screen.waitForText) {
            await page.getByText(screen.waitForText, { exact: false }).first().waitFor({ timeout: 30000 });
        }

        for (const action of screen.actions || []) {
            if (action.click) {
                await page.locator(action.click).first().click();
            }
            if (action.fill) {
                await page.locator(action.fill.selector).first().fill(action.fill.text);
            }
            if (action.waitFor) {
                await page.locator(action.waitFor).first().waitFor({ state: 'visible', timeout: 15000 });
            }
            await sleep(400);
        }

        await page.evaluate(async () => {
            await document.fonts.ready;
            const waitForImage = (image) =>
                image.complete
                    ? Promise.resolve()
                    : new Promise((resolve) => {
                          image.addEventListener('load', resolve, { once: true });
                          image.addEventListener('error', resolve, { once: true });
                      });
            await Promise.race([
                Promise.all(Array.from(document.querySelectorAll('img')).map(waitForImage)),
                new Promise((resolve) => setTimeout(resolve, 15000)),
            ]);
        });
        await sleep(700);

        await page.screenshot({ path: target, animations: screen.allowAnimations ? 'allow' : 'disabled' });
        console.log(`  captured ${device.id}/${screen.id}`);
        return true;
    } catch (error) {
        console.error(`  FAILED ${device.id}/${screen.id}: ${error.message}`);
        try {
            await page.screenshot({ path: target, animations: screen.allowAnimations ? 'allow' : 'disabled' });
            console.error(`  (saved a best-effort capture for debugging)`);
        } catch {
            // ignore secondary failure
        }
        return false;
    } finally {
        await context.close();
    }
}

async function main() {
    fs.mkdirSync(rawDir, { recursive: true });
    const browser = await chromium.launch();
    let failures = 0;
    let total = 0;

    // Optional screen id filter(s), e.g. `node capture.cjs 05-daily-game`.
    const filters = process.argv.slice(2).filter((argument) => !argument.startsWith('-'));
    const screens = config.screens.filter(
        (screen) => filters.length === 0 || filters.some((filter) => screen.id.includes(filter)),
    );

    if (!screens.length) {
        console.error(`No screens matched: ${filters.join(', ')}`);
        process.exitCode = 1;
        return;
    }

    try {
        for (const device of config.devices) {
            fs.mkdirSync(path.join(rawDir, device.id), { recursive: true });
            console.log(`${device.label} (${device.id})`);
            for (const screen of screens) {
                total += 1;
                const ok = await captureScreen(browser, device, screen);
                if (!ok) {
                    failures += 1;
                }
            }
        }
    } finally {
        await browser.close();
    }

    if (failures > 0) {
        console.error(`\n${failures} of ${total} capture(s) failed.`);
        process.exitCode = 1;
        return;
    }
    console.log(`\nCaptured ${total} screen(s) into play-store/raw/.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
