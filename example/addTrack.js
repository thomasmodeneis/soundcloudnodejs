/**
 * @author Thomas Modeneis <thomas.modeneis@gmail.com>
 */
'use strict';
var soundcloudnodejs = require('../soundcloudnodejs');
var fs = require('fs');

var config = require('../config');

var options = {
    client_id: config.client_id,
    client_secret: config.client_secret,
    grant_type: config.grant_type,
    redirect_uri: config.redirect_uri,
    username: config.username,
    password: config.password
}

soundcloudnodejs.getToken(options, function (err, token, meta) {

    var track = {
        title: 'dog_example',
        description: 'dog_example',
        genre: 'dog_example',
        artwork_data: '/opt/poc/soundcloudnodejs/example/dog/dog.jpeg',
        sharing: 'public',
        oauth_token: token.access_token,
        asset_data: '/opt/poc/soundcloudnodejs/example/dog/dog_example.mp3'
    }

    soundcloudnodejs.addTrack(track, function (err, track) {
        if(err){
            console.log(err);
        }else {
            console.log(track);
        }

    });

})