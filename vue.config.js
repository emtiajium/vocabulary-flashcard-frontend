// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

let devServer = {};

if (process.env.NODE_ENV === 'development') {
    devServer = {
        // Without setting host as `localhost`
        // I'm getting `net::ERR_CERT_COMMON_NAME_INVALID` at the console
        // for the https://*.*.*.*:8090/sockjs-node
        // but, we need to have web socket server to enable hot reloading
        host: 'localhost',
        https: true,
        // Enabling HTTPS by following the steps mentioned at
        // https://www.section.io/engineering-education/how-to-get-ssl-https-for-localhost/
        // We also need to import certificate authority by hitting
        // <chrome://settings/certificates>
        key: fs.readFileSync('cert/CA/localhost/localhost.decrypted.key'),
        cert: fs.readFileSync('cert/CA/localhost/localhost.crt'),
    };
}

module.exports = {
    devServer,
};
