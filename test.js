var assert = require('chai').assert;

var soundcloudnodejs = require('../soundcloudnodejs');
var fs = require('fs');
var _ = require('underscore');
var credentials = require('./example/credentials');

//refresh this file with a valid token in order to be able to use soundcloud API :D
//I've set this into a file because soundcloud will allow you to get like 5 tokens per hour if you are lucky
//this means if you run this test 5 times and dont save the token you are stuck :(
var token = require("./example/token");

describe('Should Support SoundCloud main operations', function () {

    describe('Should support add track', function () {

        it('should return -1 when the value is not present', function (done) {
            this.timeout(10000);

            var track = {
                title: 'dog_example',
                description: 'dog_example',
                genre: 'dog_example',
                artwork_data: __dirname + '/example/dog/dog.jpeg',
                sharing: 'public',
                oauth_token: token.access_token,
                asset_data: __dirname + '/example/dog/dog_example.mp3'
            };
            soundcloudnodejs.addTrack(track, function (err, track) {
                assert.isNull(err, "Error is not null");
                assert.isNotNull(track, "Track is null");
                done();
            });
        });
    });
});


///TODO: add more tests for other api calls


