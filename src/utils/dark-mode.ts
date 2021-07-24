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
                    setLightMode();
                }
            }
        }
    } catch {
        setLightMode();
    }
}
