/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/ban-ts-ignore */
const Config = require('./config.json');

if (Config.server.apiPrefix.search('elasticbeanstalk') === -1) {
    console.log(`Current Config.server.apiPrefix is ${Config.server.apiPrefix}. It needs to be changed`);
    // @ts-ignore
    process.exit(1);
}
