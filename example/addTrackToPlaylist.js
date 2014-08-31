/**
 * add track to existing playlist
 * @author Thomas Modeneis <thomas.modeneis@gmail.com>
 */
'use strict';
var soundcloudnodejs = require('../soundcloudnodejs');
var fs = require('fs');

var config = require('../config');
var _ = require('underscore');

var options = {
    client_id: config.client_id,
    client_secret: config.client_secret,
    grant_type: config.grant_type,
    redirect_uri: config.redirect_uri,
    username: config.username,
    password: config.password
}

soundcloudnodejs.getToken(options, function (err, token, meta) {
    if (err || token.access_token === undefined) {
        console.log('getToken err: ' + err + ' token.access_token: ' + token.access_token);
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

            if (err) {
                console.log(err);
            } else {

                if (err || token.access_token === undefined) {
                    console.log('getToken err: ' + err + ' token.access_token: ' + token.access_token);
                } else {
                    var playlist = {
                        //set here the desired playlist title
                        title: 'test_3',
                        oauth_token: token.access_token
                    };

                    soundcloudnodejs.getPlaylist(playlist, function (err, playlistFound) {
                        if (err) {
                            console.log(err);
                        } else {

                            playlist = _.findWhere(playlistFound, {'title': playlist.title});

                            if (!playlist || !playlist.id) {
                                console.log('playlist not found playlist.title: ' + playlist);
                            } else {
                                console.log('playlist found id: ' + playlist.id);
                                console.log('playlist tracks: ' + playlist.tracks);
                                console.log('playlist add  track.id: ' + track.id );

                                playlist.oauth_token = token.access_token;
                                playlist.track = { id: track.id };

                                soundcloudnodejs.addTrackToPlaylist(playlist, function (err, track) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(track);
                                    }

                                });
                            }
                        }
                    });
                }
            }

        });
    }

})