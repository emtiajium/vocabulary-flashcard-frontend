import { ThemeDetection } from '@ionic-native/theme-detection';
import Platform from '@/utils/Platform';
import { StatusBar } from '@capacitor/status-bar';

let isAndroid = true;

export function setDarkMode(): void {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add('dark');
    if (isAndroid) {
        StatusBar.setBackgroundColor({
            color: '#1f1f1f', // --ion-toolbar-background
        }).finally();
    }
}

export function setLightMode(): void {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add('light');
    if (isAndroid) {
        StatusBar.setBackgroundColor({
            color: '#2e8b57', // --ion-toolbar-background
        }).finally();
    }
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
        isAndroid = await Platform.isAndroid();
        if (isAndroid) {
            const { value: isAvailable } = await ThemeDetection.isAvailable();
            if (isAvailable) {
                const { value: isDarkModeEnabled } = await ThemeDetection.isDarkModeEnabled();
                if (isDarkModeEnabled) {
                    setDarkMode();
                } else {
                    setLightMode();
                }
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
