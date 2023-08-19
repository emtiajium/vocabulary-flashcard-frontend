/* eslint-disable @typescript-eslint/no-var-requires */
const { readFileSync } = require('fs');
const { defineConfig } = require('@vue/cli-service');
// eslint-disable-next-line import/no-extraneous-dependencies
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

let devServer = {};

if (process.env.NODE_ENV === 'development') {
    devServer = {
        // Without setting host as `localhost`
        // I'm getting `net::ERR_CERT_COMMON_NAME_INVALID` at the console
        // for the https://*.*.*.*:8090/sockjs-node
        // but, we need to have web socket server to enable hot reloading
        host: 'localhost',
        server: {
            type: 'https',
            options: {
                // Enabling HTTPS by following the steps mentioned at
                // https://www.section.io/engineering-education/how-to-get-ssl-https-for-localhost/
                // We also need to import certificate authority by hitting
                // <chrome://settings/certificates>
                key: readFileSync('cert/CA/localhost/localhost.decrypted.key'),
                cert: readFileSync('cert/CA/localhost/localhost.crt'),
            },
        },
    };
}

// https://cli.vuejs.org/config/
// node_modules/@vue/cli-service/types/ProjectOptions.d.ts
module.exports = defineConfig({
    lintOnSave: 'warning',
    transpileDependencies: false,
    configureWebpack: {
        plugins: [new NodePolyfillPlugin()],
        resolve: {
            fallback: {
                // https://webpack.js.org/configuration/resolve/
                fs: false,
                net: false,
                tls: false,
                child_process: false,
            },
        },
    },
    devServer,
});
