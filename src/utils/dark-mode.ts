import { Device } from '@capacitor/device';
import { ThemeDetection } from '@ionic-native/theme-detection';
import NativeStorage from '@/utils/NativeStorage';

export function setDarkMode(): void {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add('dark');
    NativeStorage.setThemeMode('dark').finally();
}

export function setLightMode(): void {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add('light');
    NativeStorage.setThemeMode('light').finally();
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
        const { platform } = await Device.getInfo();
        if (platform === 'android') {
            const { value: isAvailable } = await ThemeDetection.isAvailable();
            if (isAvailable) {
                const { value: isDarkModeEnabled } = await ThemeDetection.isDarkModeEnabled();
                if (isDarkModeEnabled) {
                    setDarkMode();
                } else {
                    // (CSS class) setting is unnecessary but this method will also modify the native storage's value
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
    setThemeBasedOnSystem().finally();
    subscribeToModeChanges();
}
