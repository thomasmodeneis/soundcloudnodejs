var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var assert = require('chai').assert;
var soundcloudnodejs = require('../soundcloudnodejs');
var credentials = require('../example/credentials');
var DEBUG_MODE_ON = /true/.test(process.env.SOUNDCLOUDJS_DEBUG)


//refresh this file with a valid token in order to be able to use soundcloud API :D
//I've set this into a file because soundcloud will allow you to get like 5 tokens per hour if you are lucky
//this means if you run this test 5 times and dont save the token you are stuck :(
var token = require("../example/token").TOKEN;

describe('Should Support SoundCloud main operations', function () {

    assert.isNotNull(token, "Token is null, make sure to run (npm run token) before running this test");

    let playlist = {}

    describe('Should support main SoundCloud API methods ', function () {

        it('should add and remove a track', function (done) {
            this.timeout(10000);

            var t = {
                title: 'dog_example',
                description: 'dog_example',
                genre: 'dog_example',
                artwork_data: path.join(__dirname, '..', '/example/dog/dog.jpeg'),
                sharing: 'public',
                oauth_token: token,
                asset_data: path.join(__dirname, '..', '/example/dog/dog_example.mp3')
            };

            soundcloudnodejs.addTrack(t).then(function (createdTrack) {
                assert.isTrue(!createdTrack.errors || createdTrack.errors.length === 0, `Got Error when processing addTrack ${JSON.stringify(createdTrack.errors)}`);
                assert.isNotNull(createdTrack, "Track is null");

                const trackToDelete = {
                    id: createdTrack.id,
                    oauth_token: token
                }

                soundcloudnodejs.removeTrack(trackToDelete).then(function (deletedTrack) {
                    assert.isTrue(!deletedTrack.errors || deletedTrack.errors.length === 0, `Got Error when processing addTrack ${JSON.stringify(deletedTrack.errors)}`);
                    assert.isNotNull(deletedTrack, "Track is null");
                    done();
                }).catch(function (err) {
                    done(err);
                })

            }).catch(function (err) {
                done(err);
            })


        });

        it('should add a track and save it to a new playlist and remove playlist after', function (done) {
            this.timeout(10000);

            var track = {
                title: 'dog_example',
                description: 'dog_example',
                genre: 'dog_example',
                artwork_data: path.join(__dirname, '..', '/example/dog/dog.jpeg'),
                sharing: 'public',
                oauth_token: token,
                asset_data: path.join(__dirname, '..', '/example/dog/dog_example.mp3')
            };

            soundcloudnodejs.addTrack(track).then(function (newTrack) {

                assert.isNotNull(newTrack, "Track is null");
                assert.isTrue(!newTrack.errors || newTrack.errors.length === 0, `Got Error when processing addTrack ${JSON.stringify(newTrack.errors)}`);

                playlist = {
                    oauth_token: token,
                    title: 'test_' + Math.floor((Math.random() * 1000) + 1),
                    sharing: 'public',
                    tracks: [{id: newTrack.id}],
                };

                soundcloudnodejs.addTrackToNewPlaylist(playlist).then(function (newPlayList) {
                    assert.isNotNull(newPlayList, "newPlayList is null");
                    assert.isTrue(!newPlayList.errors || track.errors.length === 0, `Got Error when processing addTrackToNewPlaylist ${JSON.stringify(newPlayList.errors)}`);


                    soundcloudnodejs.removePlaylist(playlist).then(function (removePlaylist) {
                        assert.isNotNull(removePlaylist, "removePlaylist is null");
                        assert.isTrue(!removePlaylist.errors || removePlaylist.errors.length === 0, `Got Error when processing removePlaylist ${JSON.stringify(removePlaylist.errors)}`);

                        done();
                    });

                }).catch(function (err) {
                    done(err);
                });

            }).catch(function (err) {
                done(err);
            })
        });

        it('should add a track, get existing playlist and add the track to the playlist', function (done) {

            this.timeout(10000);

            var track = {
                title: 'dog_example',
                description: 'dog_example',
                genre: 'dog_example',
                artwork_data: path.join(__dirname, '..', '/example/dog/dog.jpeg'),
                sharing: 'public',
                oauth_token: token,
                asset_data: path.join(__dirname, '..', '/example/dog/dog_example.mp3')
            };

            soundcloudnodejs.addTrack(track).then(function (track) {
                console.log(track)

                assert.isTrue(!track.errors || track.errors.length === 0, `Got Error when processing addTrack ${JSON.stringify(track.errors)}`);
                assert.isNotNull(track, "Track is null");

                soundcloudnodejs.getPlaylist(playlist).then(function (playlistFound) {


                    var playlistFound = _.findWhere(playlistFound, {'title': playlist.title});

                    assert.isNotNull(playlistFound, "Playlist not found");

                    if (DEBUG_MODE_ON) {
                        console.log('playlist found id: ', playlistFound.id);
                        console.log('playlist tracks: ', playlistFound.tracks);
                        console.log('playlist add  track.id: ', playlistFound.id);
                    }

                    playlistFound.oauth_token = token;
                    playlistFound.tracks = [{id: track.id}];

                    soundcloudnodejs.addTrackToPlaylist(playlistFound).then(function (track) {
                        if (DEBUG_MODE_ON) {
                            console.log(track);
                        }
                        done();
                    }).catch(function (err) {
                        done(err);
                    });

                }).catch(function (err) {
                    done(err);
                });

            }).catch(function (err) {
                done(err);
            })

        });

        it('should get and delete X tracks', function (done) {
            this.timeout(50000);

            var options = {
                oauth_token: token,
                limit: 300
            };

            soundcloudnodejs.getTracks(options).then(function (tracks) {
                assert.isNotNull(tracks, "Track is null");
                assert.isTrue(tracks.length >= 1, "Tracks length is lower than 1");

                console.log("Got tracks, total -> ", tracks.length);

                soundcloudnodejs.removeAllTracks(tracks, options, 0, function (msg) {
                    console.log("All tracks have been removed", msg);
                    done();
                })

            }).catch(function (err) {
                done(err);
            })

        });

        it('should search for a track', function (done) {
            this.timeout(20000);

            var track = {
                oauth_token: token,
                q: 'dog_example'
            };

            soundcloudnodejs.searchTrack_q(track).then(function (searchTrack) {
                assert.isNotNull(searchTrack, "searchTrack is null");
                assert.isTrue(searchTrack.length >= 1, "searchTrack length is lower than 1");
                done();
            }).catch(function (err) {
                done(err);
            })
        });


    });
});


///TODO: add more tests for other api calls


