#!/bin/bash
# Splash screen
cp -R ./android-replacer/app/src/main/res/drawable ./android/app/src/main/res
cp -R ./android-replacer/app/src/main/res/drawable-land-hdpi ./android/app/src/main/res
cp -R ./android-replacer/app/src/main/res/drawable-land-mdpi ./android/app/src/main/res
cp -R ./android-replacer/app/src/main/res/drawable-land-xhdpi ./android/app/src/main/res
cp -R ./android-replacer/app/src/main/res/drawable-land-xxhdpi ./android/app/src/main/res
cp -R ./android-replacer/app/src/main/res/drawable-land-xxxhdpi ./android/app/src/main/res
cp -R ./android-replacer/app/src/main/res/drawable-port-hdpi ./android/app/src/main/res
cp -R ./android-replacer/app/src/main/res/drawable-port-mdpi ./android/app/src/main/res
cp -R ./android-replacer/app/src/main/res/drawable-port-xhdpi ./android/app/src/main/res
cp -R ./android-replacer/app/src/main/res/drawable-port-xxhdpi ./android/app/src/main/res
cp -R ./android-replacer/app/src/main/res/drawable-port-xxxhdpi ./android/app/src/main/res
# Logo
cp -R ./android-replacer/app/src/main/res/mipmap-hdpi ./android/app/src/main/res
cp -R ./android-replacer/app/src/main/res/mipmap-mdpi ./android/app/src/main/res
cp -R ./android-replacer/app/src/main/res/mipmap-xhdpi ./android/app/src/main/res
cp -R ./android-replacer/app/src/main/res/mipmap-xxhdpi ./android/app/src/main/res
cp -R ./android-replacer/app/src/main/res/mipmap-xxxhdpi ./android/app/src/main/res
# Values
cp ./android-replacer/app/src/main/res/values/ic_launcher_background.xml ./android/app/src/main/res/values/ic_launcher_background.xml
cp ./android-replacer/app/src/main/res/values/strings.xml ./android/app/src/main/res/values/strings.xml
cp ./android-replacer/app/src/main/res/values/styles.xml ./android/app/src/main/res/values/styles.xml
rm -rf ./android/app/src/main/res/values-v26 && mkdir ./android/app/src/main/res/values-v26
cp ./android-replacer/app/src/main/res/values-v26/styles-v26.xml ./android/app/src/main/res/values-v26/styles.xml
# AndroidManifest
cp ./android-replacer/app/src/main/AndroidManifest.xml ./android/app/src/main/AndroidManifest.xml
# App-level build.gradle
cp ./android-replacer/app/build.gradle ./android/app/build.gradle
# Firebase
cp ./android-replacer/app/google-services.json ./android/app/google-services.json

# Project-level build.gradle
cp ./android-replacer/android/build.gradle ./android/build.gradle
cp ./android-replacer/android/variables.gradle ./android/variables.gradle
