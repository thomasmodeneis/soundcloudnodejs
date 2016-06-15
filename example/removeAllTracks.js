/**
 * @author Thomas Modeneis
 */
'use strict';
var soundcloudnodejs = require('../soundcloudnodejs');
var fs = require('fs');
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
        var options = {
            oauth_token: token.access_token
        };

        soundcloudnodejs.getTracks(options).then(function (tracks) {
            console.log(tracks);

            removeAll(tracks, token, 0, function (msg) {
                console.log(msg);
            });

        });
    }

});


function removeAll(tracks, token, count, callback) {
    var track = tracks[count];

    if (!track) {
        callback('done');
        return;
    }

    var options = {
        id: track.id,
        oauth_token: token.access_token
    };

    soundcloudnodejs.removeTrack(options).then(function (track) {
        console.log(track);
        count = count + 1;
        removeAll(tracks, token, count, callback)
    });
}