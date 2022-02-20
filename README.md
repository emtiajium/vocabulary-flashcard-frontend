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

➜ `git clone git@github.com:emtiajium/ielts-gibberish.git`

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

➜ Read [these](https://reactnative.dev/docs/0.65/running-on-device) and `Enable Debugging over USB`
, `Plug in your device via USB`, `Connect to the development server`

➜ `npm run serve:android:anew`

➜ Open the project (`/android`) in Android Studio

➜ Modify few generated files

> Add `android:usesCleartextTraffic="true"` within `<application />` at `./android/app/src/main/AndroidManifest.xml`

> Replace `minSdkVersion = 21` with `minSdkVersion = 23` at `./android/variables.gradle`

> Add `<string name="server_client_id">***-***.apps.googleusercontent.com</string>` at `./android/app/src/main/res/values/strings.xml`

➜ Sync project with gradle files

➜ Run the app

## Assets generator

➜ Square + Round (Launcher icon): Visit [here](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)

➜ Foreground (Launcher icon): Visit [here](https://easyappicon.com/)

➜ Splash screen: Visit [here](https://romannurik.github.io/AndroidAssetStudio/nine-patches.html)

> Draw the stretchable patches manually using the Draw 9-patch tool. See details from [here](https://developer.android.com/studio/write/draw9patch)

➜ Play store banner/Website thumbnail: Visit [here](https://www.canva.com/)

➜ Favicon: Visit [here](https://realfavicongenerator.net/)

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

-   `0.7.4`: UI/UX improvement: V8 + Changed status-bar's color + Fixed minor bugs
-   `0.7.3`: UI/UX improvement: V7 + Introduced back icon for the add/edit vocab/definition page
-   `0.7.2`: UI/UX improvement: V6
-   `0.7.1`: UI/UX improvement V5 + Used Ionic framework provided `debounce`
-   `0.7.0`: Thumbnail using `<meta />` (Open Graph protocol)
-   `0.6.4`: UI/UX improvement: V4
-   `0.6.3`: UI/UX improvement: V3
-   `0.6.2`: UI/UX improvement: V2
-   `0.6.1`: UI/UX improvement
-   `0.6.0`: Introduced back icon (backward to the previous route)
-   `0.5.1`: Fixed left-right marking issue of add/edit vocab/definition
-   `0.5.0`: Improved UI for the web app + Get it on Google Play
-   `0.4.1`: Dark mode for the guest also
-   `0.4.0`: Privacy policy + Landing page + HTTPS
-   `0.3.7`: Renamed leitner system to flashcards (header, menu option, message)
-   `0.3.6`: Changed the helping message of the generic notes
-   `0.3.5`: Fixed the bug of displaying multiple identical items while searching by applying debouncing
-   `0.3.4`: Fixed bugs + Changed the toast's color to paris green
-   `0.3.3`: Version `0.3.2` prevented reloading of vocab list after adding a new one. Fixed!
-   `0.3.2`: Fixed vocab CU related bugs + improved vocab ordering preference icon's UI
-   `0.3.1`: Prevented refreshing leitner items every time an item has been moved
-   `0.3.0`: User preference for the vocab ordering
-   `0.2.6`: Disabled all types of save button before receiving the response from the server + Other minor changes
-   `0.2.5`: Fixed leitner box existence bug within the minified card after update + Minor UI change for the box item
-   `0.2.4`: Leitner Box insertion time
-   `0.2.3`: No reloading after update + Box insertion from the vocab list page
-   `0.2.2`: Fixed bug (move backward button was being disabled all time) + Fixed button alignment
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

## Android Release Log

-   `37`: `0.7.4`
-   `36`: `0.7.3`
-   `35`: `0.7.2`
-   `34`: `0.7.1`
-   `33`: `0.6.4`
-   `32`: `0.6.3`
-   `31`: `0.6.2`
-   `30`: `0.6.1`
-   `29`: `0.6.0`
-   `28`: `0.5.1`
-   `27`: `0.5.0`
-   `26`: `0.4.1`
-   `25`: `0.4.0`
-   `24`: `0.3.7`
-   `23`: `0.3.6`
-   `22`: `0.3.5`
-   `21`: `0.3.4`
-   `20`: `0.3.3`
-   `19`: `0.3.2`
-   `18`: `0.3.1`
-   `17`: `0.3.0`
-   `16`: `0.2.6`
-   `15`: `0.2.5`
-   `14`: `0.2.4`
-   `13`: `0.2.3`
-   `12`: `0.2.2`
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
