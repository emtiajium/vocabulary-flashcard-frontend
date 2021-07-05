#!/bin/bash
cp ./android-replacer/AndroidManifest.xml ./android/app/src/main/AndroidManifest.xml
cp ./android-replacer/ic_launcher_background.xml ./android/app/src/main/res/values/ic_launcher_background.xml
cp ./android-replacer/strings.xml ./android/app/src/main/res/values/strings.xml
cp ./android-replacer/styles.xml ./android/app/src/main/res/values/styles.xml
cp ./android-replacer/variables.gradle ./android/variables.gradle
rm -rf ./android/app/src/main/res/values-v26 && mkdir ./android/app/src/main/res/values-v26
cp ./android-replacer/styles-v26.xml ./android/app/src/main/res/values-v26/styles.xml
# Splash screen
cp -R ./android-replacer/drawable ./android/app/src/main/res
cp -R ./android-replacer/drawable-land-hdpi ./android/app/src/main/res
cp -R ./android-replacer/drawable-land-mdpi ./android/app/src/main/res
cp -R ./android-replacer/drawable-land-xhdpi ./android/app/src/main/res
cp -R ./android-replacer/drawable-land-xxhdpi ./android/app/src/main/res
cp -R ./android-replacer/drawable-land-xxxhdpi ./android/app/src/main/res
cp -R ./android-replacer/drawable-port-hdpi ./android/app/src/main/res
cp -R ./android-replacer/drawable-port-mdpi ./android/app/src/main/res
cp -R ./android-replacer/drawable-port-xhdpi ./android/app/src/main/res
cp -R ./android-replacer/drawable-port-xxhdpi ./android/app/src/main/res
cp -R ./android-replacer/drawable-port-xxxhdpi ./android/app/src/main/res
# Logo
cp -R ./android-replacer/mipmap-hdpi ./android/app/src/main/res
cp -R ./android-replacer/mipmap-mdpi ./android/app/src/main/res
cp -R ./android-replacer/mipmap-xhdpi ./android/app/src/main/res
cp -R ./android-replacer/mipmap-xxhdpi ./android/app/src/main/res
cp -R ./android-replacer/mipmap-xxxhdpi ./android/app/src/main/res
