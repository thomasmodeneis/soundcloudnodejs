/**
 * @author Thomas Modeneis <thomas.modeneis@gmail.com>
 */
'use strict';
var curlrequest = require('curlrequest');
var request = require('request');
var fs = require('fs');
var _ = require('underscore');

exports.addTrack = function (options, callback) {
    var FormData = require('form-data');
    var form = new FormData();
    form.append('format', 'json');
    form.append('track[title]', options.title);
    form.append('track[description]', options.description);
    form.append('track[genre]', options.genre);
    form.append('track[artwork_data]', fs.createReadStream(options.artwork_data));
    form.append('track[sharing]', options.sharing);
    form.append('oauth_token', options.oauth_token);
    form.append('track[asset_data]', fs.createReadStream(options.asset_data));

    form.submit('https://api.soundcloud.com/tracks', function(err, response) {
        if (!err) {

            response.on('error', function(err){
                callback('Error while uploading track: '+err);
            });

            var data = "";
            response.on('data', function (chunk) {
                data = data + chunk;
            });

            response.on('end', function(){
                console.log('upload successful');
                callback(null, JSON.parse(data.toString('utf8')));
            });

        } else {
            console.log('Error while uploading track: '+err);
            callback('Error while uploading track: '+err);

        }
    });
};

exports.removeTrack = function (options, callback) {
    var uri = 'https://api.soundcloud.com/tracks/' + options.id+'?oauth_token='+options.oauth_token+'&format=json';
    request(uri, {method:'DELETE'},function(err, response) {
        if (err || response.body !== undefined && response.body.indexOf(404)!==-1) {
            console.log('Error while deleting track: '+ response.body);
            callback('Error while uploading track: '+ response.body);
        } else {
            callback(null, {result: response.body});
        }
    });
};

exports.getTracks = function (options, callback) {
    var uri = 'https://api.soundcloud.com/me/tracks?format=json&oauth_token='+options.oauth_token;
    request(uri, function(err, response, body) {
        if (!err) {
            console.log('getTracks successful');
            var tracks = _.map(JSON.parse(body.toString('utf8')), function(track) {
                return track;
            });
            callback(null,tracks);
        } else {
            console.log('Error while getTracks track: '+err);
            callback('Error while getTracks track: '+err);

        }
    });
};




exports.addTrackToPlaylist = function (options, callback) {
    var FormData = require('form-data');
    var form = new FormData();

    var form = new FormData();
    form.append('format', 'json');
    _.each(options.tracks, function(id) {
        form.append('playlist[tracks][][id]', id);
    });
    form.append('playlist[title]', options.title);
    form.append('playlist[sharing]', options.sharing);
    form.append('oauth_token', options.oauth_token);

    form.submit('https://api.soundcloud.com/playlists', function(err, response) {
        if (!err) {

            response.on('error', function(err){
                callback('Error while uploading track: '+err);
            });

            var data = "";
            response.on('data', function (chunk) {
                data = data + chunk;
            });

            response.on('end', function(){
                console.log('addPlaylist successful');
                callback(null, JSON.parse(data.toString('utf8')));
            });

        } else {
            console.log('Error while uploading track: '+err);
            callback('Error while uploading track: '+err);

        }
    });
};

exports.getPlaylist = function (options, callback) {
    var uri = 'https://api.soundcloud.com/me/playlists?format=json&oauth_token='+options.oauth_token;
    request(uri, function(err, response, body) {
        if (!err) {
            console.log('getPlaylist successful');
            var tracks = _.map(JSON.parse(body.toString('utf8')), function(track) {
                return track;
            });
            callback(null,tracks);
        } else {
            console.log('Error while getPlaylist track: '+err);
            callback('Error while getPlaylist track: '+err);

        }
    });
};

exports.removePlaylist = function (options, callback) {
    var uri = 'https://api.soundcloud.com/playlists/' + options.title+'?oauth_token='+options.oauth_token+'&format=json';
    request(uri, {method:'DELETE'},function(err, response) {
        if (err || response.body !== undefined && response.body.indexOf(404)!==-1) {
            console.log('Error while deleting track: '+ response.body);
            callback('Error while uploading track: '+ response.body);
        } else {
            callback(null, {result: response.body});
        }
    });
};

exports.getToken = function (options, callback) {

    var curl_options = {
        'url': 'https://api.soundcloud.com/oauth2/token',
        'method': 'POST',
        verbose: true,
        encoding: 'utf8',
        data: options
    };

    curlrequest.request(curl_options, function (err, data, meta) {
        callback(err, JSON.parse(data), meta);
    });
}
