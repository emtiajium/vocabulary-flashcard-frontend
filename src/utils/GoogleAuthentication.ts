import User from '@/domains/User';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { OAuth2Client, TokenInfo } from 'google-auth-library';
import { Authentication, User as GoogleUser } from '@codetrix-studio/capacitor-google-auth/dist/esm/user';
import Platform from '@/utils/Platform';
import Config from '../../config.json';

export default class GoogleAuthentication {
    private static eagerRefreshThresholdInMilliSeconds = 5 * 60 * 1000;

    private static currentIdToken: string;

    private static currentAccessToken: string;

    private static tokenInfo: TokenInfo;

    private static oAuth2Client: OAuth2Client;

    static async load(): Promise<void> {
        const isAndroid = await Platform.isAndroid();
        if (!isAndroid) {
            GoogleAuthentication.createMetadata();
            GoogleAuth.init();
        }
    }

    static async signIn(): Promise<User> {
        const authenticatedUser: GoogleUser = await GoogleAuth.signIn();
        GoogleAuthentication.setToken(authenticatedUser.authentication);
        GoogleAuthentication.setTokenInfo().finally();
        return GoogleAuthentication.generateAuthenticatedUserPayload(authenticatedUser);
    }

    static async signOut(): Promise<void> {
        try {
            await GoogleAuth.signOut();
        } catch {
            // do nothing
        }
    }

    private static getOAuth2Client(): OAuth2Client {
        if (!GoogleAuthentication.oAuth2Client) {
            GoogleAuthentication.oAuth2Client = new OAuth2Client(Config.google.webClientId);
        }
        return GoogleAuthentication.oAuth2Client;
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
        GoogleAuthentication.currentIdToken = authentication.idToken;
        GoogleAuthentication.currentAccessToken = authentication.accessToken;
    }

    private static async setTokenInfo(): Promise<void> {
        try {
            GoogleAuthentication.tokenInfo = await GoogleAuthentication.getOAuth2Client().getTokenInfo(
                GoogleAuthentication.currentAccessToken,
            );
        } catch {
            // just smile, and wave!
        }
    }

    private static async assertRefreshToken(): Promise<void> {
        if (GoogleAuthentication.isTokenExpiring()) {
            await GoogleAuthentication.refreshToken();
        }
    }

    static async getToken(): Promise<string> {
        // await GoogleAuthorization.assertRefreshToken();
        return GoogleAuthentication.currentIdToken;
    }

    private static isTokenExpiring(): boolean {
        if (!GoogleAuthentication.tokenInfo) {
            return true;
        }

        // copied from node_modules/google-auth-library/build/src/auth/oauth2client.js
        const expiryDate = GoogleAuthentication.tokenInfo.expiry_date;
        return expiryDate
            ? expiryDate <= new Date().getTime() + GoogleAuthentication.eagerRefreshThresholdInMilliSeconds
            : false;
    }

    private static async refreshToken(): Promise<void> {
        const authentication = await GoogleAuth.refresh();
        GoogleAuthentication.setToken(authentication);
        GoogleAuthentication.setTokenInfo().finally();
    }
}
