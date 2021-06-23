import User from '@/domains/User';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { User as GoogleUser } from '@codetrix-studio/capacitor-google-auth/dist/esm/user';
import Config from '../../capacitor.config.json';

export default class GoogleAuthorization {
    static load() {
        GoogleAuthorization.createMetadata();
        GoogleAuth.init();
    }

    static createMetadata(): void {
        const googlePlatformMetadata = document.createElement('meta');
        googlePlatformMetadata.setAttribute('name', 'google-signin-client_id');
        googlePlatformMetadata.setAttribute('content', Config.plugins.GoogleAuth.serverClientId);
        document.head.appendChild(googlePlatformMetadata);
    }

    static generateAuthenticatedUserPayload(googleUser: GoogleUser): User {
        // A Google account's email address can change, so don't use it to identify a user.
        // Instead, use the account's ID, which you can get on the client with getBasicProfile().getId(),
        // and on the backend from the sub claim of the ID token.
        return {
            email: googleUser.email,
            username: googleUser.email,
            firstname: googleUser.givenName,
            lastname: googleUser.familyName,
            profilePictureUrl: googleUser.imageUrl,
        };
    }

    static async signIn(): Promise<User> {
        const authenticatedUser: GoogleUser = await GoogleAuth.signIn();
        return GoogleAuthorization.generateAuthenticatedUserPayload(authenticatedUser);
    }
}
