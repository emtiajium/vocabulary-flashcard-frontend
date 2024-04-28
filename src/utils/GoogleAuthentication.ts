/* eslint-disable camelcase */

import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import Platform from '@/utils/Platform';
import User from '@/domains/User';
import NativeStorage from '@/utils/NativeStorage';
import Config from '../../config.json';

type CredentialResponse = google.accounts.id.CredentialResponse;
type OnConsentCallback = () => Promise<void>;

export default class GoogleAuthentication {
    private static isAndroid: boolean;

    private static currentIdToken: string;

    private static oAuth2Client: OAuth2Client;

    static user: User;

    static onConsentCallback: OnConsentCallback;

    static async load(elementId: string, callback: OnConsentCallback): Promise<void> {
        const isAndroid = await Platform.isAndroid();
        GoogleAuthentication.isAndroid = isAndroid;
        if (!isAndroid) {
            GoogleAuthentication.onConsentCallback = callback;
            GoogleAuthentication.renderTemplate(elementId);
        }
    }

    static async androidSignIn(): Promise<void> {
        const user = await GoogleAuth.signIn();
        GoogleAuthentication.setToken(user.authentication.idToken);
        GoogleAuthentication.generateAuthenticatedUserPayload({
            email: user.email,
            given_name: user.givenName,
            family_name: user.familyName,
            picture: user.imageUrl,
        });
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

    static async signOut(): Promise<void> {
        try {
            await NativeStorage.removeJwToken();
            if (!GoogleAuthentication.isAndroid) {
                window.google.accounts.id.disableAutoSelect();
            } else {
                await GoogleAuth.signOut();
            }
        } catch {
            // just smile, and wave!
        }
    }

    private static renderTemplate(elementId: string): void {
        window.google.accounts.id.renderButton(document.getElementById(elementId) as HTMLElement, {
            type: 'standard',
            size: 'large',
            shape: 'rectangular',
            theme: 'outline',
            text: 'continue_with',
            logo_alignment: 'left',
        });
        window.google.accounts.id.prompt();
    }

    private static getOAuth2Client(): OAuth2Client {
        if (!GoogleAuthentication.oAuth2Client) {
            GoogleAuthentication.oAuth2Client = new OAuth2Client(Config.google.webClientId);
        }
        return GoogleAuthentication.oAuth2Client;
    }

    private static generateAuthenticatedUserPayload(decodedToken: TokenPayload | Partial<TokenPayload>): void {
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
        if (GoogleAuthentication.currentIdToken) {
            return GoogleAuthentication.currentIdToken;
        }
        let token = await NativeStorage.getJwToken();
        if (!token) {
            // backward compatibility
            const user = (await NativeStorage.getAuthorizedUser()) as Record<string, string>;
            if (user?.jwToken) {
                token = user.jwToken;
                await NativeStorage.setJwToken(token);
                delete user.jwToken;
                await NativeStorage.setAuthorizedUser(user);
            }
        }
        GoogleAuthentication.currentIdToken = token;
        return token;
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
