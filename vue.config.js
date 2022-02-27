// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

let devServer = {};

if (process.env.NODE_ENV === 'development') {
    devServer = {
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
