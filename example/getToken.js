/**
 * @author Thomas Modeneis
 */
'use strict';
let fse = require('fs-extra')
let fs = require('fs')
let path = require('path')

var soundcloudnodejs = require('../soundcloudnodejs');
var credentials = require('./credentials');

var options = {
    client_id: process.env.client_id || credentials.client_id,
    client_secret: process.env.client_secret || credentials.client_secret,
    grant_type: process.env.grant_type || credentials.grant_type,
    redirect_uri: process.env.redirect_uri || credentials.redirect_uri,
    username: process.env.username || credentials.username,
    password: process.env.password || credentials.password
};

// NOTE: Ensure you have credentials set on credentials.js or supply it to the script via ENV VARS

soundcloudnodejs.getToken(options).then(function (token, meta) {
    if (!token || !token.access_token) {
        console.log('getToken err: token.access_token ');
    } else {
        //set to config so is now global
        console.log(token.access_token)

        const versionStr = `module.exports.TOKEN = "${token.access_token}"; `

        fse.ensureFileSync(
            path.join(__dirname, 'token.js'),
        )

        fs.writeFileSync(
            path.join(__dirname, 'token.js'),
            versionStr,
        )

    }
});