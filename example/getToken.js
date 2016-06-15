/**
 * @author Thomas Modeneis
 */
'use strict';
var soundcloudnodejs = require('../soundcloudnodejs');
var config = require('../config');

var options = {
    client_id: process.env.client_id || credentials.client_id,
    client_secret: process.env.client_secret || credentials.client_secret,
    grant_type: process.env.grant_type ||credentials.grant_type,
    redirect_uri: process.env.redirect_uri || credentials.redirect_uri,
    username: process.env.username || credentials.username,
    password: process.env.password || credentials.password
};

soundcloudnodejs.getToken(options, function (err, token, meta) {
//    console.log(meta);

    if (err || !token || !token.access_token) {
        console.log('getToken err: ' + err + ' token.access_token ');
    } else {
        //set to config so is now global
        config.access_token = token.access_token;
        console.log(config.access_token)
    }
});