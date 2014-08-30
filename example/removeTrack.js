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
        id: '165450557',
        oauth_token: token.access_token
    }

    soundcloudnodejs.removeTrack(track, function (err, track) {
        if(err){
            console.log(err);
        }else {
            console.log(track);
        }

    });

})