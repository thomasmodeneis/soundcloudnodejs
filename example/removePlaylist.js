/**
 * @author Thomas Modeneis
 */
'use strict';
var soundcloudnodejs = require('../soundcloudnodejs');
var fs = require('fs');

var credentials = require('credentials');

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
            console.log('addTrackToPlaylist done: ' + JSON.stringify(track.permalink_url));
            var playlist = {
                oauth_token: token.access_token,
                title: 'test_' + Math.floor((Math.random() * 10) + 1),
                sharing: 'public',
                tracks: {id: track.id}
            };

            /**
             * If playlist does not exist will create new one
             */
            soundcloudnodejs.addTrackToNewPlaylist(playlist).then(function (track) {
                console.log('addTrackToPlaylist done: ' + JSON.stringify(track.permalink_url));

                playlist.oauth_token = token.access_token;

                soundcloudnodejs.removePlaylist(playlist, function (err, response) {
                    if (err) {
                        console.log('removePlaylist err: ' + err);
                    } else {
                        console.log('removePlaylist done: ' + JSON.stringify(response));
                    }
                });

            });

        });
    }

});