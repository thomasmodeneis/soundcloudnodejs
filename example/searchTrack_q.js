/**
 * @author Thomas Modeneis
 */
'use strict';
var soundcloudnodejs = require('../soundcloudnodejs');
var fs = require('fs');

var options = {
    client_id: process.env.client_id || credentials.client_id,
    client_secret: process.env.client_secret || credentials.client_secret,
    grant_type: process.env.grant_type ||credentials.grant_type,
    redirect_uri: process.env.redirect_uri || credentials.redirect_uri,
    username: process.env.username || credentials.username,
    password: process.env.password || credentials.password
};

soundcloudnodejs.getToken(options, function (err, token) {

    if (err || !token || !token.access_token) {
        console.log('getToken err: ' + err + ' token.access_token ');
    } else {
        var track = {
            oauth_token: token.access_token,
            q: 'dog_example'
        };

        soundcloudnodejs.searchTrack_q(track, function (err, track) {
            if (err) {
                console.log(err);
            } else {
                console.log(track);
            }
        });
    }

});