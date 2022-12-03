/* eslint-disable @typescript-eslint/no-var-requires */

const { writeFileSync } = require('fs');
const { execSync } = require('child_process');
const Config = require('./config.json');

const cloudServerUrl = 'api.firecrackervocabulary.com';
const localServerUrl = 'localhost:9006';

if (Config.server.apiPrefix.search(cloudServerUrl) !== -1) {
    const modifiedConfig = {
        ...Config,
        server: {
            ...Config.server,
            apiPrefix: Config.server.apiPrefix.replace(cloudServerUrl, localServerUrl),
        },
    };

    writeFileSync('config.json', JSON.stringify(modifiedConfig), {
        encoding: 'utf-8',
    });

    execSync(`prettier --write "config.json"`);
}
