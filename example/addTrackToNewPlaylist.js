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

soundcloudnodejs.getToken(options, function (err, token, meta) {
    if (err || !token || !token.access_token) {
        console.log('getToken err: ' + err + ' token.access_token ');
    } else {

        var track = {
            title: 'dog_example',
            description: 'dog_example',
            genre: 'dog_example',
            artwork_data: __dirname + '/dog/dog.jpeg',
            sharing: 'public',
            oauth_token: token.access_token,
            asset_data: __dirname + '/dog/dog_example.mp3'
        }

        soundcloudnodejs.addTrack(track, function (err, track) {

            if(err){
                console.log(err);
            }else {

                var playlist = {
                    oauth_token: token.access_token,
                    title: 'test_' + Math.floor((Math.random() * 10) + 1),
                    sharing: 'public',
                    tracks: { id: track.id }
                };

                /**
                 * If playlist does not exist will create new one
                 */
                soundcloudnodejs.addTrackToNewPlaylist(playlist, function (err, track) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(track);
                    }

                });
                if (err) {
                    console.log(err);
                } else {
                    console.log(track);
                }
            }

        });
    }

})