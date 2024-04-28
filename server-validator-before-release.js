const Config = require('./config.json');

if (Config.server.apiPrefix.search('https://api.firecrackervocabulary.com/') === -1) {
    console.error(`Current Config.server.apiPrefix is ${Config.server.apiPrefix}. It needs to be changed`);
    process.exit(1);
}
