/* eslint-disable @typescript-eslint/camelcase,no-unused-vars */
import User from '@/domains/User';
import { Device } from '@capacitor/device';
import BasicProfile = gapi.auth2.BasicProfile;
import GoogleAuth = gapi.auth2.GoogleAuth;
import GoogleUser = gapi.auth2.GoogleUser;

const Config = {
    plugins: {
        GoogleAuth: {
            scopes: ['profile', 'email'],
            serverClientId: '***-***.apps.googleusercontent.com',
            forceCodeForRefreshToken: true,
        },
    },
};

declare global {
    interface Window {
        onGoogleApiLoad: () => void;
    }
}

class GoogleAuthorization {
    private auth2!: GoogleAuth;

    private elementId: string;

    async init(elementId: string) {
        const deviceInfo = await Device.getInfo();
        if (deviceInfo.platform === 'web') {
            this.elementId = elementId;
            this.createMetadata();
            this.onGoogleApiLoad();
            this.createScript();
        }
    }

    createScript(): void {
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
    }

    createMetadata = (): void => {
        const googlePlatformMetadata = document.createElement('meta');
        googlePlatformMetadata.setAttribute('name', 'google-signin-client_id');
        googlePlatformMetadata.setAttribute('content', Config.plugins.GoogleAuth.serverClientId);
        document.head.appendChild(googlePlatformMetadata);
    };

    onGoogleApiLoad(): void {
        window.onGoogleApiLoad = () => {
            window.gapi.load('auth2', () => {
                this.auth2 = window.gapi.auth2.init({
                    client_id: Config.plugins.GoogleAuth.serverClientId,
                });
                this.renderElement();
            });
        };
    }

    renderElement = (): void => {
        window.gapi.signin2.render(document.getElementById(this.elementId), {
            width: 250,
            height: 50,
            longtitle: true,
        });
    };

    generateAuthenticatedUserPayload = (profile: BasicProfile): User => {
        // A Google account's email address can change, so don't use it to identify a user.
        // Instead, use the account's ID, which you can get on the client with getBasicProfile().getId(),
        // and on the backend from the sub claim of the ID token.
        return {
            email: profile.getEmail(),
            username: profile.getEmail(),
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

async function start(): Promise<void> {
    const vueTemplate = `
        <view class="container ion-justify-content-center ion-align-items-center">
            <view id="btn-google-sign-in" @click="handleClick" />
        </view>
    `;

    const googleAuth = new GoogleAuthorization();
    await googleAuth.init(`btn-google-sign-in`);
    const user = await googleAuth.signIn();
    console.log(user);
}
