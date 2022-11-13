/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */

import User from '@/domains/User';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import Platform from '@/utils/Platform';
import { getThemeMode } from '@/utils/dark-mode';
import NativeStorage from '@/utils/NativeStorage';
import Config from '../../config.json';

type CredentialResponse = google.accounts.id.CredentialResponse;
type OnConsentCallback = () => Promise<void>;

export default class GoogleAuthentication {
    private static currentIdToken: string;

    private static oAuth2Client: OAuth2Client;

    static user: User;

    static onConsentCallback: OnConsentCallback;

    static async load(elementId: string, callback: OnConsentCallback): Promise<void> {
        const isAndroid = await Platform.isAndroid();
        if (!isAndroid) {
            GoogleAuthentication.onConsentCallback = callback;
            GoogleAuthentication.renderTemplate(elementId);
        }
    }

    static async onConsent(credential: string): Promise<void> {
        GoogleAuthentication.setToken(credential);
        const loginTicket = await GoogleAuthentication.getOAuth2Client().verifyIdToken({
            idToken: credential,
            audience: Config.google.webClientId,
        });
        const decodedToken = loginTicket.getPayload() as TokenPayload;
        GoogleAuthentication.generateAuthenticatedUserPayload(decodedToken);
    }

    static signOut(): void {
        try {
            NativeStorage.removeJwToken().finally();
            window.google.accounts.id.disableAutoSelect();
        } catch {
            // just smile, and wave!
        }
    }

    private static renderTemplate(elementId: string): void {
        window.google.accounts.id.renderButton(document.getElementById(elementId) as HTMLElement, {
            type: 'standard',
            size: 'large',
            shape: 'rectangular',
            theme: GoogleAuthentication.getButtonTheme(),
            text: 'continue_with',
            logo_alignment: 'left',
        });
        window.google.accounts.id.prompt();
    }

    private static getButtonTheme(): 'filled_black' | 'outline' {
        const mode = getThemeMode();
        return mode.includes('dark') ? 'filled_black' : 'outline';
    }

    private static getOAuth2Client(): OAuth2Client {
        if (!GoogleAuthentication.oAuth2Client) {
            GoogleAuthentication.oAuth2Client = new OAuth2Client(Config.google.webClientId);
        }
        return GoogleAuthentication.oAuth2Client;
    }

    private static generateAuthenticatedUserPayload(decodedToken: TokenPayload): void {
        GoogleAuthentication.user = {
            username: decodedToken.email,
            firstname: decodedToken.given_name,
            lastname: decodedToken.family_name,
            profilePictureUrl: decodedToken.picture,
        };
    }

    private static setToken(token: string): void {
        GoogleAuthentication.currentIdToken = token;
        NativeStorage.setJwToken(token).finally();
    }

    static async getToken(): Promise<string> {
        return (
            GoogleAuthentication.currentIdToken ||
            NativeStorage.getJwToken().then((token) => {
                GoogleAuthentication.currentIdToken = token;
                return token;
            })
        );
    }
}

window.onload = function onLoadGoogleAuthLib(): void {
    window.google.accounts.id.initialize({
        client_id: Config.google.webClientId,
        context: 'signin',
        ux_mode: 'popup',
        auto_select: false,
        callback: async (credentialResponse: CredentialResponse): Promise<void> => {
            await GoogleAuthentication.onConsent(credentialResponse.credential);
            await GoogleAuthentication.onConsentCallback();
        },
    });
};
