/**
 * @author Thomas Modeneis
 */
'use strict';
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

soundcloudnodejs.getToken(options).then(function (token, meta) {

    if (!token || !token.access_token) {
        console.log('getToken err: token.access_token ');
    } else {
        var playlist = {
            oauth_token: token.access_token
        };

        soundcloudnodejs.getTracks(playlist).then(function (pl) {
            console.log(pl);
        });
    }

});