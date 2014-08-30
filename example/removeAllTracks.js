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

    var options = {
        oauth_token: token.access_token
    };

    soundcloudnodejs.getTracks(options, function (err, tracks) {
        if(err){
            console.log(err);
        }else {
            console.log(tracks);

            removeAll(tracks,token,0, function(msg){
                console.log(msg);
            });

        }
    });

});


function removeAll(tracks, token, count, callback){
    var track = tracks[count];

    if(track === undefined){
        callback('done');
        return;
    }

    var options = {
        id: track.id,
        oauth_token: token.access_token
    }

    soundcloudnodejs.removeTrack(options, function (err, track) {
        if(err){
            console.log(err);
        }else {
            console.log(track);
            count = count + 1;
            removeAll(tracks,token,count,callback)
        }

    });
}