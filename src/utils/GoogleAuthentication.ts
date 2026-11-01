/* eslint-disable camelcase */

import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { SocialLogin, GoogleLoginResponseOnline } from '@capgo/capacitor-social-login';
import Platform from '@/utils/Platform';
import User from '@/domains/User';
import { isModeDark } from '@/utils/dark-mode';
import Config from '../../config.json';

type CredentialResponse = google.accounts.id.CredentialResponse;
type OnConsentCallback = () => Promise<void>;

export default class GoogleAuthentication {
    private static isAndroid: boolean;

    private static oAuth2Client: OAuth2Client;

    private static accessToken: string;

    private static refreshToken: string;

    static currentIdToken: string;

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
        await SocialLogin.initialize({
            google: {
                webClientId: Config.google.webClientId,
                mode: 'online',
            },
        });
        const loginResponse = await SocialLogin.login<'google'>({
            provider: 'google',
            options: {
                scopes: ['email', 'profile'],
                forceRefreshToken: true,
            },
        });
        const user = loginResponse.result as GoogleLoginResponseOnline;

        GoogleAuthentication.setIdToken(user.idToken as string);
        GoogleAuthentication.generateAuthenticatedUserPayload({
            email: user.profile.email as string,
            given_name: user.profile.givenName as string,
            family_name: user.profile.familyName as string,
            picture: user.profile.imageUrl as string,
        });
    }

    static async onConsent(credential: string): Promise<void> {
        GoogleAuthentication.setIdToken(credential);
        const loginTicket = await GoogleAuthentication.getOAuth2Client().verifyIdToken({
            idToken: credential,
            audience: Config.google.webClientId,
        });
        const decodedToken = loginTicket.getPayload() as TokenPayload;
        GoogleAuthentication.generateAuthenticatedUserPayload(decodedToken);
    }

    static async signOut(): Promise<void> {
        try {
            if (!GoogleAuthentication.isAndroid) {
                window.google.accounts.id.disableAutoSelect();
            } else {
                await SocialLogin.logout({
                    provider: 'google',
                });
            }
        } catch {
            // just smile, and wave!
        }
    }

    private static renderTemplate(elementId: string): void {
        // addling delay to avoid the error `Failed to render button before calling initialize()`
        setTimeout(() => {
            window.google.accounts.id.renderButton(document.getElementById(elementId) as HTMLElement, {
                type: 'standard',
                size: 'large',
                shape: 'rectangular',
                theme: isModeDark() ? 'filled_black' : 'outline',
                text: 'continue_with',
                logo_alignment: 'left',
            });
            window.google.accounts.id.prompt();
        }, 2000);
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

    private static setIdToken(token: string): void {
        GoogleAuthentication.currentIdToken = token;
    }

    static setToken(accessToken: string, refreshToken: string): void {
        GoogleAuthentication.accessToken = accessToken;
        GoogleAuthentication.refreshToken = refreshToken;
    }

    static getToken(): { accessToken: string; refreshToken: string } {
        return {
            accessToken: GoogleAuthentication.accessToken,
            refreshToken: GoogleAuthentication.refreshToken,
        };
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
