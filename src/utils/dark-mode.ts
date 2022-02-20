import { ThemeDetection } from '@ionic-native/theme-detection';
import Platform from '@/utils/Platform';

export function setDarkMode(): void {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add('dark');
}

export function setLightMode(): void {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add('light');
}

export function setThemeMode(mode: 'light' | 'dark'): void {
    if (mode === 'light') {
        setLightMode();
    } else {
        setDarkMode();
    }
}

export async function setThemeBasedOnSystem(): Promise<void> {
    try {
        const isAndroid = await Platform.isAndroid();
        if (isAndroid) {
            const { value: isAvailable } = await ThemeDetection.isAvailable();
            if (isAvailable) {
                const { value: isDarkModeEnabled } = await ThemeDetection.isDarkModeEnabled();
                if (isDarkModeEnabled) {
                    setDarkMode();
                }
                // else do nothing because default mode is light
            }
        }
    } catch {
        setLightMode();
    }
}

export function subscribeToModeChanges(): void {
    // does not work for Samsung M31
    const prefersDark = window.matchMedia(`(prefers-color-scheme: dark)`);
    prefersDark.addListener((mediaQuery) => {
        setThemeMode(mediaQuery.matches ? 'dark' : 'light');
    });
}

export async function initTheme(): Promise<void> {
    await setThemeBasedOnSystem();
    subscribeToModeChanges();
}

export function getThemeMode(): string {
    return document.body.classList.value;
}
