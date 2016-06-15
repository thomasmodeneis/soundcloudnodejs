/**
 * @author Thomas Modeneis
 */

'use strict';
var curlrequest = require('curlrequest');
var request = require('request');
var fs = require('fs');
var _ = require('underscore');
var FormData = require('form-data');

exports.addTrack = function (options, callback) {
    var form = new FormData();

    form.append('format', 'json');
    if (!options.title) {
        callback('Error while addTrack track options.title is required but is null');
        return;
    } else {
        form.append('track[title]', options.title);
    }
    if (!options.description) {
        callback('Error  while addTrack track options.description is required but is null');
        return;
    } else {
        form.append('track[description]', options.description);
    }
    if (!options.genre) {
        callback('Error  while addTrack track options.genre is required but is null');
        return;
    } else {
        form.append('track[genre]', options.genre);
    }


    var exist_artwork_data = fs.existsSync(options.artwork_data);
    if (exist_artwork_data) {
        form.append('track[artwork_data]', fs.createReadStream(options.artwork_data));
    }

    if (options.tag_list) {
        form.append('track[tag_list]', options.tag_list);
    }

    form.append('track[sharing]', options.sharing);

    if (!options.oauth_token) {
        callback('Error  while addTrack track oauth_token is required but is null');
        return;
    } else {
        form.append('oauth_token', options.oauth_token);
    }


    if (!options.asset_data) {
        callback('Error  while addTrack track options.asset_data is required but is null');
        return;
    } else {

        var exist_asset_data = fs.existsSync(options.asset_data);
        console.log(exist_asset_data);

        if (exist_asset_data) {
            form.append('track[asset_data]', fs.createReadStream(options.asset_data));
        } else {
            callback('Error addTrack could not find options.asset_data --> fs.createReadStream(options.asset_data): ' + exist_asset_data);
            return;
        }
    }

    form.submit('https://api.soundcloud.com/tracks', function (err, response) {
        if (!err) {

            response.on('error', function (err) {
                callback('Error addTrack while addTrack track: ' + err);
            });

            var data = "";
            response.on('data', function (chunk) {
                data = data + chunk;
            });

            response.on('end', function () {
                console.log('addTrack successful');
                callback(null, JSON.parse(data.toString('utf8')));
            });

        } else {
            console.log('Error while addTrack track : ' + err);
            callback('Error while addTrack track : ' + err);

        }
    });
};

exports.removeTrack = function (options, callback) {
    if (!options.oauth_token) {
        callback('Error removeTrack oauth_token is required but is null ');
    } else {

        var uri = 'https://api.soundcloud.com/tracks/' + options.id + '?oauth_token=' + options.oauth_token + '&format=json';
        request(uri, {method: 'DELETE', timeout: 10000}, function (err, response) {
            if (err || !response.body || response.body.indexOf(404) !== -1) {
                console.log('Error while removeTrack track: ' + response.body);
                callback('Error while removeTrack track: ' + response.body);
            } else {
                callback(null, {result: response.body});
            }
        });
    }
};

exports.getTracks = function (options, callback) {
    if (!options.oauth_token) {
        callback('Error getTracks oauth_token is required but is null');
    } else {
        var uri = 'https://api.soundcloud.com/me/tracks?format=json&oauth_token=' + options.oauth_token;
        request(uri, {timeout: 10000}, function (err, response, body) {
            if (!err) {
                console.log('getTracks successful');
                var tracks = _.map(JSON.parse(body.toString('utf8')), function (track) {
                    return track;
                });
                callback(null, tracks);
            } else {
                console.log('Error while getTracks track: ' + err);
                callback('Error while getTracks track: ' + err);

            }
        });
    }
};

exports.searchTrack_q = function (options, callback) {
    if (!options.oauth_token) {
        callback('Error searchTrack_q oauth_token is required and is null ');
    } else {

        if (!options.q) {
            callback('Error searchTrack_q options.q is required and is null');
        } else {
            var uri = 'https://api.soundcloud.com/me/tracks?format=json&oauth_token=' + options.oauth_token + '&q=' + options.q;
            request(uri, {timeout: 10000}, function (err, response, body) {
                if (!err) {
                    console.log('getTracks successful');
                    callback(null, JSON.parse(body.toString('utf8')));
                } else {
                    console.log('Error while searchTrack_q track: ' + err);
                    callback('Error while searchTrack_q track: ' + err);

                }
            });
        }
    }
};

exports.resolveUri = function (options, callback) {
    if (!options.client_id) {
        callback('Error resolveUri options.client_id is required but is null');
    } else {

        if (!options.uri) {
            callback('Error resolveUri options.uri is required and is: ' + options.uri);
        } else {
//            http://api.soundcloud.com/resolve.json?url=https://soundcloud.com/user46387694/dog_example&client_id=6e110a037f1c9a14b1d3abd1d97f842a
            var uri = 'http://api.soundcloud.com/resolve.json?url=' + options.uri + '&client_id=' + options.client_id;
            request(uri, {timeout: 10000}, function (err, response, body) {

//                console.log(response.body);

                if (err || !response.body || response.body.indexOf('404') !== -1) {
                    console.log('Error while resolveUri track: ' + err);
                    callback('Error while resolveUri track: ' + err);

                } else {
                    console.log('resolveUri successful');
                    callback(null, JSON.parse(response.body.toString('utf8')));

                }
            });
        }
    }
};


exports.addTrackToPlaylist = function (options, callback) {
    var form = new FormData();
    form.append('format', 'json');

    if (!options.tracks) {
        callback('Error while addTrackToPlaylist options.tracks is null');
        return;
    } else {
        _.each(trackIds(options.tracks), function (id) {
            //console.log(id);
            form.append('playlist[tracks][][id]', id);
        });
    }

    if (!options.track.id) {
        callback('Error while addTrackToPlaylist options.id is null');
        return;
    } else {
        form.append('playlist[tracks][][id]', options.track.id);
    }

    if (!options.title) {
        callback('Error while addTrackToPlaylist track, title is null');
        return;
    } else {
        form.append('playlist[title]', options.title);
    }

    if (!options.sharing) {
        callback('Error while addTrackToPlaylist track, sharing is null');
        return;
    } else {
        form.append('playlist[sharing]', options.sharing);
    }

    if (!options.oauth_token) {
        callback('Error while addTrackToPlaylist track oauth_token is null');
        return;
    } else {
        form.append('oauth_token', options.oauth_token);
    }

    var finish = false;
    setTimeout(function () {
        if (finish == false) {
            console.log('timeout of 15s kick in');
            finish = true;
            return callback('Error timeout addTrackToPlaylist: ');
        }
    }, 20000);


    //console.log(parsedUrl(options));
    form.submit(parsedUrl(options), function (err, response) {
        if (!err) {
            finish = true;

            console.log('reset finish');

            response.on('error', function (err) {
                callback('Error while addTrackToPlaylist track: ' + err);
            });

            var data = "";
            response.on('data', function (chunk) {
                data = data + chunk;
            });

            response.on('end', function () {
                console.log('addPlaylist successful');
                if (data.toString('utf8').indexOf('xml') !== -1) {
                    callback(null, data.toString('utf8'));
                } else {
                    callback(null, JSON.parse(data.toString('utf8')));
                }
            });

        } else {
            finish = true;
            console.log('Error while addTrackToPlaylist track: ' + err);
            callback('Error while addTrackToPlaylist track: ' + err);

        }
    });
};

var URL = require('url');
function parsedUrl(playlist) {
    var playListUri = URL.parse(playlist.uri);
    return {
        method: 'put',
        host: playListUri.host,
        path: playListUri.path,
        protocol: playListUri.protocol,
        timeout: 10000
    };
}

function trackIds(json) {
    return _.map(json, function (track) {
        return track.id;
    })
}


exports.addTrackToNewPlaylist = function (options, callback) {
    var form = new FormData();
    form.append('format', 'json');

    if (!options.tracks) {
        callback('Error while addTrackToNewPlaylist options.tracks is null');
        return;
    } else {
        _.each(options.tracks, function (id) {
            form.append('playlist[tracks][][id]', id);
        });
    }
    if (!options.title) {
        callback('Error while addTrackToNewPlaylist options.title is null');
        return;
    } else {
        form.append('playlist[title]', options.title);
    }
    if (!options.sharing) {
        callback('Error while addTrackToNewPlaylist options.sharing is null');
        return;
    } else {
        form.append('playlist[sharing]', options.sharing);
    }
    if (!options.oauth_token) {
        callback('Error while addTrackToNewPlaylist options.oauth_token is null');
        return;
    } else {
        form.append('oauth_token', options.oauth_token);
    }

    form.submit('https://api.soundcloud.com/playlists', function (err, response) {
        if (!err) {

            response.on('error', function (err) {
                callback('Error while addTrackToNewPlaylist track: ' + err);
            });

            var data = "";
            response.on('data', function (chunk) {
                data = data + chunk;
            });

            response.on('end', function () {
                console.log('addPlaylist successful');
                callback(null, JSON.parse(data.toString('utf8')));
            });

        } else {
            console.log('Error while addTrackToNewPlaylist track: ' + err);
            callback('Error while addTrackToNewPlaylist track: ' + err);

        }
    });
};


exports.getPlaylist = function (options, callback) {
    if (!options.oauth_token) {
        return callback('Error oauth_token is required, but is null');
    } else {
        var uri = 'https://api.soundcloud.com/me/playlists?format=json&oauth_token=' + options.oauth_token;
        request(uri, {timeout: 10000}, function (err, response, body) {
            if (!err) {
                console.log('getPlaylist successful');
                var tracks = _.map(JSON.parse(body.toString('utf8')), function (track) {
                    return track;
                });
                callback(null, tracks);
            } else {
                console.log('Error while getPlaylist track: ' + err);
                callback('Error while getPlaylist track: ' + err);

            }
        });
    }
};

exports.getPlaylistById = function (options, callback) {
    if (!options.oauth_token) {
        return callback('Error getPlaylistById options.oauth_token is required, but is null');
    } else if (!options.id) {
        return callback('Error getPlaylistById options.id is required, but is null');
    } else {
        var uri = 'https://api.soundcloud.com/me/playlists/' + options.id + '?format=json&oauth_token=' + options.oauth_token;
        request(uri, {timeout: 10000}, function (err, response, body) {
            if (!err) {
                console.log('getPlaylistById successful');
                var tracks = _.map(JSON.parse(body.toString('utf8')), function (track) {
                    return track;
                });
                callback(null, tracks);
            } else {
                console.log('Error while getPlaylistById track: ' + err);
                callback('Error while getPlaylistById track: ' + err);

            }
        });
    }
};

exports.removePlaylist = function (options, callback) {
    if (!options.oauth_token) {
        return callback('Error removePlaylist options.oauth_token is required but is null ');
    } else if (!options.title) {
        return callback('Error removePlaylist options.title is required and but is null ');
    } else {
        var uri = 'https://api.soundcloud.com/playlists/' + options.title + '?oauth_token=' + options.oauth_token + '&format=json';
        request(uri, {method: 'DELETE', timeout: 10000}, function (err, response) {
            if (err || !response.body || response.body.indexOf(404) !== -1) {
                console.log('Error while removePlaylist track: ' + response.body);
                callback('Error while removePlaylist track: ' + response.body);
            } else {
                callback(null, {result: response.body});
            }
        });
    }
};

exports.getToken = function (options, callback) {

    var curl_options = {
        'url': 'https://api.soundcloud.com/oauth2/token',
        'method': 'POST',
        verbose: true,
        encoding: 'utf8',
        data: options,
        timeout:10000
    };

    curlrequest.request(curl_options, function (err, data, meta) {
        if(err || !data){
            callback(err, null, meta);
        }else {
            callback(err, JSON.parse(data), meta);
        }
    });
};