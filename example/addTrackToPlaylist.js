/**
 * add track to existing playlist
 * @author Thomas Modeneis
 */
'use strict';
var soundcloudnodejs = require('../soundcloudnodejs');
var fs = require('fs');

var _ = require('underscore');
var credentials = require('./credentials');

var options = {
    client_id: process.env.client_id || credentials.client_id,
    client_secret: process.env.client_secret || credentials.client_secret,
    grant_type: process.env.grant_type || credentials.grant_type,
    redirect_uri: process.env.redirect_uri || credentials.redirect_uri,
    username: process.env.username || credentials.username,
    password: process.env.password || credentials.password
};

soundcloudnodejs.getToken(options).then(function (token) {
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

        soundcloudnodejs.addTrack(track, function (err, track) {
            var playlist = {
                //set here the desired playlist title
                title: 'test_3',
                oauth_token: token.access_token
            };

            soundcloudnodejs.getPlaylist(playlist).then(function (playlistFound) {

                playlist = _.findWhere(playlistFound, {'title': playlist.title});

                if (!playlist || !playlist.id) {
                    console.log('playlist not found playlist.title: ' + playlist);
                } else {
                    console.log('playlist found id: ' + playlist.id);
                    console.log('playlist tracks: ' + playlist.tracks);
                    console.log('playlist add  track.id: ' + track.id);

                    playlist.oauth_token = token.access_token;
                    playlist.track = {id: track.id};

                    soundcloudnodejs.addTrackToPlaylist(playlist, function (err, track) {
                        console.log(track);

                    });
                }
            });

        });
    }
});