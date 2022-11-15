import { ThemeDetection } from '@ionic-native/theme-detection';
import Platform from '@/utils/Platform';
import { StatusBar } from '@capacitor/status-bar';

declare global {
    interface Window {
        setLightMode: () => void;
        setDarkMode: () => void;
    }
}

let isAndroid = true;

function getStatusBarBackgroundColor(): string {
    return getComputedStyle(document.body).getPropertyValue('--ion-toolbar-background').trim();
}

export function setDarkMode(): void {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add('dark');
    if (isAndroid) {
        StatusBar.setBackgroundColor({
            color: getStatusBarBackgroundColor(),
        }).finally();
    }
}

export function setLightMode(): void {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add('light');
    if (isAndroid) {
        StatusBar.setBackgroundColor({
            color: getStatusBarBackgroundColor(),
        }).finally();
    }
}

window.setLightMode = setLightMode;
window.setDarkMode = setDarkMode;

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
        } else {
            const prefersDark = window.matchMedia(`(prefers-color-scheme: dark)`);
            setThemeMode(prefersDark.matches ? 'dark' : 'light');
        }
    } catch {
        setLightMode();
    }
}

export function subscribeToThemeChanges(): void {
    const prefersDark = window.matchMedia(`(prefers-color-scheme: dark)`);

    if (prefersDark.addEventListener) {
        prefersDark.addEventListener('change', (mediaQuery) => {
            setThemeMode(mediaQuery.matches ? 'dark' : 'light');
        });
    } else {
        prefersDark.addListener((mediaQuery) => {
            setThemeMode(mediaQuery.matches ? 'dark' : 'light');
        });
    }
}

export async function initTheme(): Promise<void> {
    await setThemeBasedOnSystem();
    if (!isAndroid) {
        subscribeToThemeChanges();
    }
    // WebView as a rescuer for the Android app
    // android/app/src/main/java/com/emtiajium/firecracker/collaborative/vocab/practice/MainActivity.java
}

export function getThemeMode(): string {
    return document.body.classList.value;
}

export function isModeDark(): boolean {
    const mode = getThemeMode();
    return mode.includes('dark') && !mode.includes('light');
}
