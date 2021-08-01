# How to Run

###### Prerequisites

➜ Install Node 14 LTS

➜ <https://github.com/emtiajium/ielts-gibberish>

➜ Add Firebase to the Android project

> [OAuth 2.0 Client ID: Web client (auto created by Google Service)](https://console.cloud.google.com/)

> [Add test users](https://console.cloud.google.com/apis/credentials/consent)

➜ Enable Google Sign-In in the Firebase console and add SHA1 fingerprint in the Firebase console

> `keytool -list -alias androiddebugkey -keystore ~/.android/debug.keystore -v`

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

➜ Read [these](https://facebook.github.io/react-native/docs/running-on-device.html) and `Enable Debugging over USB`
, `Plug in your device via USB`, `Connect to the development server`

➜ `npm run serve:android:anew`

➜ Open the project (`/android`) in Android Studio

➜ Modify few generated files

> Add `android:usesCleartextTraffic="true"` within `<application />` at `./android/app/src/main/AndroidManifest.xml`

> Replace `minSdkVersion = 21` with `minSdkVersion = 23` at `./android/variables.gradle`

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

➜ `npm run serve:android:anew:prod && npm run replace-generated-android-files`

➜ Set application version information (`versionCode`, `versionName`) at `./android/app/build.gradle`

➜ Generate the signed app bundle

> [App Bundles: Everything to know about Play App Signing](https://youtu.be/odv_1fxt9BI)

> Keep the generated Keystore and the passwords in a secret place. Don't lose it, never, ever!

➜ Add fingerprint in the Firebase console

> `keytool -list -alias <an-alias> -keystore <keystore-path/keystore-name>.keystore -v`

➜ Navigate to the [OAuth consent screen](https://console.cloud.google.com/) and publish the app

➜ Do an internal testing

> [App Bundles: Testing bundles with bundle tool and the Play Console](https://youtu.be/vAEAZPU7w-I)

➜ Publish the app on Google Play Store!

## Change Log

-   `0.2.1`: Fixed bug related to Leitner system
-   `0.2.0`: Leitner systems
-   `0.1.14`: Functionality for toggling dark mode + A bit of UI changes
-   `0.1.13`: Newer version available alert + Used Ionic lifecycle hooks
-   `0.1.12`: Linker words view in dictionaries + Refreshing functionality in vocabulary list page
-   `0.1.11`: Edit button at the vocabulary details page + Fixed copy-paste issue
-   `0.1.10`: Identical spinner for the whole app
-   `0.1.9`: Generic placeholder for the input fields + Changed icon for the network error
-   `0.1.8`: Dark mode
-   `0.1.7`: (Android) Hardware back-button bug fixation
-   `0.1.6`: Confirmation before navigating back + Auto capitalization for the input fields
-   `0.1.5`: Instruction to publish + Last minute fixation for the release
-   `0.1.4`: Vocabulary searching functionality
-   `0.1.3`: Network error notification
-   `0.1.2`: Authentication using JWT + Functionality to populate a new app user with few vocabularies
-   `0.1.1`: Cohort + Menubar + Sign out
-   `0.1.0`: User creation with Google authentication + Basic vocabulary functionalities

## Release Log

-   `11`: `0.2.1`
-   `10`: `0.2.0`
-   `9`: `0.1.14`
-   `8`: `0.1.13`
-   `7`: `0.1.12`
-   `6`: `0.1.11` (Same as the previous one because I forgot to change the local server)
-   `5`: `0.1.11`
-   `4`: `0.1.10`
-   `3`: `0.1.5`
-   `2`: Test release II
-   `1`: Test release I
