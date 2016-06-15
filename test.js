var assert = require('chai').assert;

var soundcloudnodejs = require('../soundcloudnodejs');
var fs = require('fs');
var _ = require('underscore');

var credentials = require('./example/credentials');

var options = {
    client_id: process.env.client_id || credentials.client_id,
    client_secret: process.env.client_secret || credentials.client_secret,
    grant_type: process.env.grant_type || credentials.grant_type,
    redirect_uri: process.env.redirect_uri || credentials.redirect_uri,
    username: process.env.username || credentials.username,
    password: process.env.password || credentials.password
};


describe('Should Support SoundCloud main operations', function () {

    describe('Should support add track', function () {

        it('should return -1 when the value is not present', function (done) {
            this.timeout(10000);
            soundcloudnodejs.getToken(options).then(function (token) {
                assert.isNotNull(token, "Token is null");
                assert.isNotNull(token.access_token, "Token is null");

                var track = {
                    title: 'dog_example',
                    description: 'dog_example',
                    genre: 'dog_example',
                    artwork_data: __dirname + '/example/dog/dog.jpeg',
                    sharing: 'public',
                    oauth_token: token.access_token,
                    asset_data: __dirname + '/example/dog/dog_example.mp3'
                };

                soundcloudnodejs.addTrack(track).then(function (track) {
                    assert.isNotNull(track, "Track is null");
                    done();
                });

            }).error(function (err) {
                assert.isNull(err, "Error :| ");
            });
        });

    });
});


