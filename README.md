[![CI](https://github.com/emtiajium/vocabulary-flashcard-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/emtiajium/vocabulary-flashcard-frontend/actions/workflows/ci.yml)

# What is this repository for?

<https://firecrackervocabulary.com>

<https://play.google.com/store/apps/details?id=com.emtiajium.firecracker.collaborative.vocab.practice>

# How to Run

###### Prerequisites

➜ Install Node 18 LTS using [nvm](https://github.com/nvm-sh/nvm)

➜ <https://github.com/emtiajium/vocabulary-flashcard-backend>

➜ Add Firebase to the Android project

> [OAuth 2.0 Client ID: Web client (auto created by Google Service)](https://console.cloud.google.com/)

> [Add test users](https://console.cloud.google.com/apis/credentials/consent)

➜ Enable Google Sign-In in the Firebase console and add SHA1 and/or SHA256 fingerprint in the Firebase console

> `keytool -list -alias androiddebugkey -keystore ~/.android/debug.keystore -v`
>
> > set `android` as the password when `Enter keystore password` prompt appears

###### Clone the repo and install all dependencies

➜ `git clone git@github.com:emtiajium/vocabulary-flashcard-frontend.git`

➜ `cd vocabulary-flashcard-frontend`

➜ `npm install`

###### Create and edit your configuration

➜ `npm run create:config`

➜ `npm run create:capacitor.config`

###### Start the development environment

➜ `npm run serve`

###### Run the web app on browser

➜ <https://localhost:8090/>

> Import certificate authority (`cert/CA/CA.pem`) by hitting <chrome://settings/certificates> to resolve `Your connection to this site is not secure`

###### Run the app natively on Android

➜ Read [these](https://reactnative.dev/docs/running-on-device) and `Enable Debugging over USB`, `Plug in your device via USB`, `Connect to the development server`

➜ Add `google-services.json` at `./android-replacer/app`

➜ `npm run android-pre-bundle:local`

➜ Open the project (`/android`) in Android Studio

➜ Sync project with gradle files

➜ Run the app

## Assets generator

➜ Square + Round (Launcher icon): Visit [here](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)

➜ Foreground (Launcher icon): Visit [here](https://easyappicon.com/)

➜ Splash screen: Visit [here](https://romannurik.github.io/AndroidAssetStudio/nine-patches.html)

> Draw the stretchable patches manually using the Draw 9-patch tool. See details from [here](https://developer.android.com/studio/write/draw9patch)

➜ Play store screenshots/banner/Website thumbnail: Visit [here](https://www.canva.com/)

➜ Favicon: Visit [here](https://realfavicongenerator.net/)

## Deploy the web app to the Google Firebase Hosting

➜ Install [Firebase CLI](https://firebase.google.com/docs/cli)

➜ Set configs (`config.json`, `capacitor.config.json`) for the production

➜ `npm run deploy:firebase`

## Publish the app to the Google Play Store

➜ Watch [it](https://youtu.be/5GHT4QtotE4) to have the idea of publishing the app

➜ Set configs for the production

➜ Check and double-check the configurations

➜ Ensure the existence of `google-services.json` at `./android-replacer/app`

➜ Set application version information (`versionCode`, `versionName`) at `./android-replacer/app/build.gradle`

➜ `npm run android-pre-bundle`

➜ Generate the signed app bundle

> [App Bundles: Everything to know about Play App Signing](https://youtu.be/odv_1fxt9BI)

> Keep the generated Keystore and the passwords in a secret place. Don't lose it, never, ever!

➜ Add fingerprint in the Firebase console

> `keytool -list -alias <an-alias> -keystore <keystore-path/keystore-name>.keystore -v`

➜ Navigate to the [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) and publish the app

➜ Do an internal testing

> [App Bundles: Testing bundles with bundle tool and the Play Console](https://youtu.be/vAEAZPU7w-I)

➜ Publish the app on Google Play Store!

## Change Log

-   `4.0.1`: Added delay to avoid error relating Google auth pop-up
-   `4.0.0`: Ionic@8 + Node@18 + Capacitor@6
-   `3.0.1`: A bit of UI changes related to the guessing game
-   `3.0.0`: Guessing the word game + Redesigned landing page
-   `2.1.0`: Enabled eslint rule `vuejs-accessibility/click-events-have-key-events`
-   `2.0.0`: Upgraded Ionic@6
-   `1.37.0`: Updated app to target Android 13 (API level 33)
-   `0.36.1`: Fixed UI issues related to the last release
-   `0.36.0`: Implemented [Google Play’s app account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111)
-   `0.35.0`: Fixed the bug of always showing spinner just beneath the header in the cohort page
-   `0.34.0`: Increased the spinner dimension + Fixed the bug of vanishing search keyword after setting the vocab preference
-   `0.33.0`: Prevented showing error icon when the count API failed to fetch box items' number
-   `0.32.1`: Fixed padding issue due to the last version
-   `0.32.0`: Notified users about other flashcards that are supposed to have appeared in future
-   `0.31.0`: New filtering preference to filter flashcard in the home screen
-   `0.30.0`: Removed forward, backward icon from last, first box list respectively + Fixed vocab settings, minified leitner item UI issues + Logout notification
-   `0.29.0`: Improved the vocab upsert validation related error messages
-   `0.28.0`: Changed vocab upsert's tips UI + increased profile pic's width
-   `0.27.1`: Added info on modifying a cohort using email + Changed dark mode colors
-   `0.27.0`: Added info on creating a cohort using email
-   `0.26.5`: UI: iOS style toggle
-   `0.26.4`: UI: Fixed the margin issue
-   `0.26.3`: UI: Padding/margin variables
-   `0.26.2`: More UI changes, e.g., fixed the padding/margin issues in the vocab upsert page
-   `0.26.1`: More UI changes, e.g., local caching of few material icons
-   `0.26.0`: More UI changes: Improved add vocab UI + Displayed critical error thrown by the server
-   `0.25.0`: Linker words page + Changed the UI to show the total no. of vocab
-   `0.24.6`: UI changes: Reduced the card width for bigger screen
-   `0.24.5`: UI changes: Changed the card color
-   `0.24.4`: Continuation of `0.24.3`
-   `0.24.3`: More UI changes: improved add vocab UI
-   `0.24.2`: Fixed the bug of `0.24.1` in which not all menus were showing when the device's height is too small
-   `0.24.1`: More UI changes: improved menu styling
-   `0.24.0`: A bit of UI changes e.g., changed the background color for the light mode
-   `0.23.0`: Material design UI for the iOS too
-   `0.22.0`: Improved the messages that appear in the leitner item components
-   `0.21.0`: Upgraded Capacitor from 3 to 4 to resolve `Starting in November 2022, app updates must target API level 31 or above and adjust for behavioral changes in Android 12`
-   `0.20.3`: Backward compatibility for fetching token
-   `0.20.2`: Migrated to the new Google Identity Services library + Sent platform info as the header
-   `0.20.1`: Reverted the last changes
-   `0.20.0`: Made API request with non-expired token
-   `0.19.0`: Fixed the toggling theme issue for the Android (native) app
-   `0.18.0`: Notified users if a vocabulary already exists
-   `0.17.0`: Displayed `Get it on Google Play` button for the web users
-   `0.16.6`: Added buttons' `area-label` to improve the accessibility
-   `0.16.5`: Changed the color of `<ion-card-title />` and `<ion-card-subtitle />`
-   `0.16.4`: Fixed more color contrast issue
-   `0.16.3`: Applied changes as much as possible, which are suggested by the Lighthouse, esp., the color contrast issue
-   `0.16.2`: Fixed the bug, which is related to filtering vocab without definition
-   `0.16.1`: Changed the icon of the "My Flashcards" menu
-   `0.16.0`: Handled deprecated method `MediaQueryList.addListener()`
-   `0.15.0`: Renamed the app
-   `0.14.0`: Fixed few minor bugs
-   `0.13.0`: Fixed the bug related to the version `0.11.1`
-   `0.12.0`: CI pipeline with GitHub actions
-   `0.11.2`: Fixed typos
-   `0.11.1`: Local persistence of the searching/filtering settings
-   `0.11.0`: Advanced searching/filtering
-   `0.10.4`: More UI/UX improvement (notes' container having images)
-   `0.10.3`: More UI/UX improvement + Upgraded FontAwesome to version 6!
-   `0.10.2`: More UI/UX improvement
-   `0.10.1`: Set minSdkVersion from `23` to `21` as `android:usesCleartextTraffic="true"` has been removed and introduced HTTPS for the localhost too
-   `0.10.0`: HTTPS for the localhost
-   `0.9.2`: [Executed `npx browserslist@latest --update-db`](https://github.com/browserslist/browserslist#browsers-data-updating)
-   `0.9.1`: Added maskable icons at the manifest (Basically added `"purpose": "any maskable"`)
-   `0.9.0`: Smart user can now embed HTML at the notes/generic notes V1 (Without supporting Rich Text Editor)
-   `0.8.4`: UI/UX improvement: V13
-   `0.8.3`: UI/UX improvement: V12
-   `0.8.2`: UI/UX improvement: V11 (Special changes: Dedicated color for each Leitner box)
-   `0.8.1`: UI/UX improvement: V10 (Special changes: Removed box-shadow from the header, and the card)
-   `0.8.0`: Added tips icon within the add vocab page
-   `0.7.6`: Detected theme changes using `MutationObserver`
-   `0.7.5`: UI/UX improvement: V9
-   `0.7.4`: UI/UX improvement: V8 + Changed status-bar's color + Favicon + PWA + Fixed minor bugs
-   `0.7.3`: UI/UX improvement: V7 + Introduced back icon for the add/edit vocab/definition page
-   `0.7.2`: UI/UX improvement: V6
-   `0.7.1`: UI/UX improvement V5 + Used Ionic framework provided `debounce`
-   `0.7.0`: Thumbnail using `<meta />` (Open Graph protocol)
-   `0.6.4`: UI/UX improvement: V4
-   `0.6.3`: UI/UX improvement: V3
-   `0.6.2`: UI/UX improvement: V2
-   `0.6.1`: UI/UX improvement
-   `0.6.0`: Introduced back icon (backward to the previous route)
-   `0.5.1`: Fixed left-right margin issue of add/edit vocab/definition
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

-   `104`: `4.0.0`
-   `103`: `3.0.1`
-   `102`: `3.0.0`
-   `101`: `2.1.0`
-   `100`: `2.0.0`
-   `99`: `1.37.0`
-   `98`: `0.36.1`
-   `97`: `0.36.0`
-   `96`: `0.35.0`
-   `95`: `0.34.0`
-   `94`: `0.33.0`
-   `93`: `0.32.1`
-   `92`: `0.32.0`
-   `91`: `0.31.0`
-   `90`: `0.30.0`
-   `89`: `0.29.0`
-   `88`: `0.28.0`
-   `87`: `0.27.1`
-   `86`: `0.27.0`
-   `85`: `0.26.5`
-   `84`: `0.26.4`
-   `83`: `0.26.3`
-   `82`: `0.26.2`
-   `81`: `0.26.1`
-   `80`: `0.26.0`
-   `79`: `0.25.0`
-   `78`: `0.24.6`
-   `77`: `0.24.5`
-   `76`: `0.24.4`
-   `75`: `0.24.3`
-   `74`: `0.24.2`
-   `73`: `0.24.1`
-   `72`: `0.24.0`
-   `71`: `0.22.0`
-   `70`: `0.21.0`
-   `69`: `0.20.3`
-   `68`: `0.20.2`
-   `67`: from `38a1d7fb95ce63ecfafba3a60d7423b6b865b895` to `a6e0a82ee5bbbb0dba71f29e468d98c1f810c4cb`
-   `66`: `0.20.1`
-   `65`: `0.20.0`
-   `64`: `0.19.0`
-   `63`: `0.18.0`
-   `62`: `0.16.6`
-   `61`: `0.16.5`
-   `60`: `0.16.4`
-   `59`: `0.16.3`
-   `58`: `0.16.2`
-   `57`: `0.16.1`
-   `56`: `0.16.0`
-   `55`: `0.15.0`
-   `54`: `0.14.0`
-   `53`: `0.13.0`
-   `52`: `0.11.2`
-   `51`: `0.11.1`
-   `50`: `0.11.0`
-   `49`: `0.10.4`
-   `48`: `0.10.3`
-   `47`: `0.10.2`
-   `46`: `0.10.1`
-   `45`: `0.9.0`
-   `44`: `0.8.4`
-   `43`: `0.8.3`
-   `42`: `0.8.2` (Mistakenly missed `41`)
-   `40`: `0.8.1`
-   `39`: `0.7.6`
-   `38`: `0.7.5`
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
