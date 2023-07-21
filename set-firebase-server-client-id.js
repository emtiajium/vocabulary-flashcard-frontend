/* eslint-disable @typescript-eslint/no-var-requires */

const { readFileSync, writeFileSync } = require('fs');
const Config = require('./config.json');

const encoding = 'utf-8';
const sourceFilePath = './android-replacer/app/src/main/res/values/strings.xml';
const destinationFilePath = './android/app/src/main/res/values/strings.xml';
const fileContent = readFileSync(sourceFilePath, encoding).replace(
    '***-***.apps.googleusercontent.com',
    Config.google.webClientId,
);

writeFileSync(destinationFilePath, fileContent, {
    encoding,
});
