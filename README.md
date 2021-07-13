# How to Run

###### Prerequisites

➜ Install Node 14 LTS

➜ <https://github.com/emtiajium/ielts-gibberish>

➜ Add Firebase to the Android project
> [OAuth 2.0 Client ID: Web client (auto created by Google Service)](https://console.cloud.google.com/)

> [Add test users](https://console.cloud.google.com/apis/credentials/consent)

➜ Enable Google Sign-In in the Firebase console and add SHA1 fingerprint in the Firebase console
> `keytool -genkey -alias <an-alias> -keyalg RSA -validity 18250 -keystore ~/.android/debug.keystore -v`

> `keytool -list -alias <an-alias> -keystore ~/.android/debug.keystore -v`

###### Clone the repo and install all dependencies

➜ `git clone git@bitbucket.org:sheenab/ielts-gibberish-android.git`

➜ `cd ielts-gibberish-android`

➜ `npm install`

###### Create and edit your configuration

➜ `config.json.text` -> `config.json`

➜ `capacitor.config.json.text` -> `capacitor.config.json` 

###### Start the development environment

➜ `npm run serve`

###### Run the web app on browser

➜ <http://localhost:8080/>

###### Run the web app natively on Android

➜ Read [these](https://facebook.github.io/react-native/docs/running-on-device.html) and `Enable Debugging over USB`, `Plug in your device via USB`, `Connect to the development server`

➜ `npm run serve:android:anew`

➜ Open the project (`/android`) in Android Studio

➜ Modify few generated files
> Add `android:usesCleartextTraffic="true"` within `<application />` at `./android/app/src/main/AndroidManifest.xml`

> Replace  `minSdkVersion = 21` with `minSdkVersion = 23` at `./android/variables.gradle`

> Add `<string name="server_client_id">***-***.apps.googleusercontent.com</string>` at `./android/app/src/main/res/values/strings.xml`

➜ Sync project with gradle files

➜ Run the app

## Launcher icon and splash screen generator

➜ Square + Round: Visit [here](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)

➜ Foreground: Visit [here](https://easyappicon.com/)

➜ Splash screen: Visit [here](https://romannurik.github.io/AndroidAssetStudio/nine-patches.html)
> Draw the stretchable patches manually using the Draw 9-patch tool. See details from [here](https://developer.android.com/studio/write/draw9patch)

## Deploy the web app to the Google Firebase Hosting

➜ Install [Firebase CLI](https://firebase.google.com/docs/cli)

➜ Set configs (`config.json`, `capacitor.config.json`) for the production

➜ `npm run deploy:firebase`

## Publish the app to the Google Play Store

➜ Watch [it](https://youtu.be/5GHT4QtotE4) to have the idea of publishing the app

➜ Set configs for the production

➜ Check and double-check the configurations

➜ Set application version information (`versionCode`, `versionName`) at `./android/app/build.gradle`

➜ Download the upload key certificate from Google Play console

➜ Import the certificate into the key store
> `keytool -importcert -alias <an-alias> -keystore <keystore-name>.keystore -file <Upload key certificate>`

➜ Generate the signed app bundle 
> [App Bundles: Everything to know about Play App Signing](https://youtu.be/odv_1fxt9BI)
 
> Verify the fingerprint: `keytool -printcert -jarfile app-release.aab`

➜ Add SHA1 fingerprint (from the `App signing key certificate`) in the Firebase console

➜ Do an internal testing
> [App Bundles: Testing bundles with bundle tool and the Play Console](https://youtu.be/vAEAZPU7w-I)

➜ Publish!

## Change Log

-   `0.1.5`: Instruction to publish + Last minute fixation for the release
-   `0.1.4`: Vocabulary searching functionality
-   `0.1.3`: Network error notification
-   `0.1.2`: Authentication using JWT + Functionality to populate a new app user with few vocabularies 
-   `0.1.1`: Cohort + Menubar + Sign out
-   `0.1.0`: User creation with Google authentication + Basic vocabulary functionalities 

## Release Log

-   `3`: `0.1.5`
-   `2`: Test release II
-   `1`: Test release I
