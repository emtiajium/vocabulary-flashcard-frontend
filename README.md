# How to Run

###### Prerequisites

➜ Install Node 14 LTS

➜ <https://github.com/emtiajium/ielts-gibberish>

➜ Add Firebase to the Android project
> [OAuth 2.0 Client ID: Web client (auto created by Google Service)](https://console.cloud.google.com/)

> Enable Google Sign-In in the Firebase console

> [Add test users](https://console.cloud.google.com/apis/credentials/consent)

###### Clone the repo and install all dependencies

➜ `git clone git@bitbucket.org:sheenab/ielts-gibberish-android.git`

➜ `cd ielts-gibberish-android`

➜ `npm install`

###### Create your configuration and edit

➜ `config.json.text` -> `config.json`

➜ `capacitor.config.json.text` -> `capacitor.config.json` 

###### Start the development environment

➜ `npm run serve`

###### Run the web app on browser

➜ <http://localhost:8080/>

###### Run the web app natively on Android

➜ Read [these](https://facebook.github.io/react-native/docs/running-on-device.html) and execute three task given below
> Enable Debugging over USB

> Plug in your device via USB

> Connect to the development server

➜ `npm run serve:android:anew`

➜ Open the project (`/android`) in Android Studio

➜ Replace few generated files
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

➜ Set config for the production
> config.json

> capacitor.config.json

➜ `npm run deploy:firebase`

## Publish the app to the Google Play Store

➜ TO BE ADDED

## Change Log

-   `0.1.3`: Network error notification
-   `0.1.2`: Authentication using JWT + Functionality to populate a new app user with few vocabularies 
-   `0.1.1`: Cohort + Menubar + Sign out
-   `0.1.0`: User creation with Google authentication + Basic vocabulary functionalities 
