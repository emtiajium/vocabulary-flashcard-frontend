import User from '@/domains/User';
import Config from '../../config.json';
import BasicProfile = gapi.auth2.BasicProfile;
import GoogleAuth = gapi.auth2.GoogleAuth;
import GoogleUser = gapi.auth2.GoogleUser;

declare global {
    interface Window {
        onGoogleApiLoad: () => void;
    }
}

export default class GoogleAuthorization {
    private auth2!: GoogleAuth;

    onGoogleApiLoad(): Promise<void> {
        return new Promise((resolve) => {
            window.onGoogleApiLoad = () => {
                window.gapi.load('auth2', () => {
                    this.auth2 = window.gapi.auth2.init({
                        client_id: Config.google.clientId,
                    });
                    resolve();
                });
            };
        });
    }

    createScript(): Promise<void> {
        return new Promise((resolve) => {
            const el = document.getElementById('auth2-script-id');
            if (!el) {
                const googlePlatformScript = document.createElement('script');
                googlePlatformScript.setAttribute(
                    'src',
                    `https://apis.google.com/js/platform.js?onload=${this.onGoogleApiLoad.name}`,
                );
                googlePlatformScript.setAttribute('async', 'true');
                googlePlatformScript.setAttribute('defer', 'defer');
                googlePlatformScript.setAttribute('id', 'auth2-script-id');
                document.head.appendChild(googlePlatformScript);
            }
            resolve();
        });
    }

    renderElement = (elementId: string): void => {
        window.gapi.signin2.render(elementId, { width: 250, height: 50, longtitle: true });
    };

    generateAuthenticatedUserPayload = (profile: BasicProfile): User => {
        // A Google account's email address can change, so don't use it to identify a user.
        // Instead, use the account's ID, which you can get on the client with getBasicProfile().getId(),
        // and on the backend from the sub claim of the ID token.
        return {
            email: profile.getEmail(),
            firstname: profile.getGivenName(),
            lastname: profile.getFamilyName(),
            profilePictureUrl: profile.getImageUrl(),
        };
    };

    async signIn(): Promise<User> {
        const authenticatedUser: GoogleUser = await this.auth2.signIn();
        return this.generateAuthenticatedUserPayload(authenticatedUser.getBasicProfile());
    }

    isSignedIn(): boolean {
        return this.auth2.isSignedIn.get();
    }

    getAuthenticatedUser(): User {
        return this.generateAuthenticatedUserPayload(this.auth2.currentUser.get().getBasicProfile());
    }
}
