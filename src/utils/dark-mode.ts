import { Device } from '@capacitor/device';
import { ThemeDetection } from '@ionic-native/theme-detection';

export function setDarkMode(): void {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add('dark');
}

export function setLightMode(): void {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add('light');
}

export function setMode(mode: 'light' | 'dark'): void {
    if (mode === 'light') {
        setLightMode();
    } else {
        setDarkMode();
    }
}

export async function setThemeBasedOnSystem(): Promise<void> {
    try {
        const { platform } = await Device.getInfo();
        if (platform === 'android') {
            const { value: isAvailable } = await ThemeDetection.isAvailable();
            if (isAvailable) {
                const { value: isDarkModeEnabled } = await ThemeDetection.isDarkModeEnabled();
                if (isDarkModeEnabled) {
                    setDarkMode();
                }
            }
        }
    } catch {
        setLightMode();
    }
}

export function subscribeToModeChanges(): void {
    const prefersDark = window.matchMedia(`(prefers-color-scheme: dark)`);
    prefersDark.addListener((mediaQuery) => {
        setMode(mediaQuery.matches ? 'dark' : 'light');
    });
}

export async function initTheme(): Promise<void> {
    setThemeBasedOnSystem().finally();
    subscribeToModeChanges();
}
