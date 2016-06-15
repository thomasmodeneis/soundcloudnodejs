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
        var track = {
            title: 'dog_example',
            description: 'dog_example',
            genre: 'dog_example',
            artwork_data: __dirname + '/dog/dog.jpeg',
            sharing: 'public',
            oauth_token: token.access_token,
            asset_data: __dirname + '/dog/dog_example.mp3'
        };

        soundcloudnodejs.addTrack(track).then(function (track) {

            track.oauth_token = token.access_token;

            soundcloudnodejs.removeTrack(track).then(function (response) {
                console.log('removeTrack done: ' + JSON.stringify(response));

            });

        });
    }

});