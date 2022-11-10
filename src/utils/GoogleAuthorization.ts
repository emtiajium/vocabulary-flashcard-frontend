import User from '@/domains/User';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { OAuth2Client, TokenInfo } from 'google-auth-library';
import { Authentication, User as GoogleUser } from '@codetrix-studio/capacitor-google-auth/dist/esm/user';
import Platform from '@/utils/Platform';
import Config from '../../config.json';

export default class GoogleAuthorization {
    private static eagerRefreshThresholdInMilliSeconds = 5 * 60 * 1000;

    private static currentIdToken: string;

    private static currentAccessToken: string;

    private static tokenInfo: TokenInfo;

    private static oAuth2Client: OAuth2Client;

    static async load(): Promise<void> {
        const isAndroid = await Platform.isAndroid();
        if (!isAndroid) {
            GoogleAuthorization.createMetadata();
            GoogleAuth.init();
        }
    }

    static async signIn(): Promise<User> {
        const authenticatedUser: GoogleUser = await GoogleAuth.signIn();
        GoogleAuthorization.setToken(authenticatedUser.authentication);
        GoogleAuthorization.setTokenInfo().finally();
        return GoogleAuthorization.generateAuthenticatedUserPayload(authenticatedUser);
    }

    static async signOut(): Promise<void> {
        await GoogleAuth.signOut();
    }

    private static getOAuth2Client(): OAuth2Client {
        if (!GoogleAuthorization.oAuth2Client) {
            GoogleAuthorization.oAuth2Client = new OAuth2Client(Config.google.webClientId);
        }
        return GoogleAuthorization.oAuth2Client;
    }

    private static createMetadata(): void {
        const googlePlatformMetadata = document.createElement('meta');
        googlePlatformMetadata.setAttribute('name', 'google-signin-client_id');
        googlePlatformMetadata.setAttribute('content', Config.google.webClientId);
        document.head.appendChild(googlePlatformMetadata);
    }

    private static generateAuthenticatedUserPayload(googleUser: GoogleUser): User {
        return {
            username: googleUser.email,
            firstname: googleUser.givenName,
            lastname: googleUser.familyName,
            profilePictureUrl: googleUser.imageUrl,
        };
    }

    private static setToken(authentication: Authentication): void {
        GoogleAuthorization.currentIdToken = authentication.idToken;
        GoogleAuthorization.currentAccessToken = authentication.accessToken;
    }

    private static async setTokenInfo(): Promise<void> {
        try {
            GoogleAuthorization.tokenInfo = await GoogleAuthorization.getOAuth2Client().getTokenInfo(
                GoogleAuthorization.currentAccessToken,
            );
        } catch {
            // just smile, and wave!
        }
    }

    private static async assertRefreshToken(): Promise<void> {
        if (GoogleAuthorization.isTokenExpiring()) {
            await GoogleAuthorization.refreshToken();
        }
    }

    static async getToken(): Promise<string> {
        await GoogleAuthorization.assertRefreshToken();
        return GoogleAuthorization.currentIdToken;
    }

    private static isTokenExpiring(): boolean {
        if (!GoogleAuthorization.tokenInfo) {
            return true;
        }

        // copied from node_modules/google-auth-library/build/src/auth/oauth2client.js
        const expiryDate = GoogleAuthorization.tokenInfo.expiry_date;
        return expiryDate
            ? expiryDate <= new Date().getTime() + GoogleAuthorization.eagerRefreshThresholdInMilliSeconds
            : false;
    }

    private static async refreshToken(): Promise<void> {
        const authentication = await GoogleAuth.refresh();
        GoogleAuthorization.setToken(authentication);
        GoogleAuthorization.setTokenInfo().finally();
    }
}
