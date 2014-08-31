/**
 * @author Thomas Modeneis <thomas.modeneis@gmail.com>
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
    if (options.title === undefined) {
        callback('Error while addTrack track options.title: ' + options.title);
        return;
    } else {
        form.append('track[title]', options.title);
    }
    if (options.description === undefined) {
        callback('Error  while addTrack track options.description is required and is: ' + options.description);
        return;
    } else {
        form.append('track[description]', options.description);
    }
    if (options.genre === undefined) {
        callback('Error  while addTrack track options.genre is required and is:  ' + options.genre);
        return;
    } else {
        form.append('track[genre]', options.genre);
    }


    var exist_artwork_data = fs.existsSync(options.artwork_data);
    if (exist_artwork_data) {
        form.append('track[artwork_data]', fs.createReadStream(options.artwork_data));
    }

    form.append('track[sharing]', options.sharing);

    if (options.oauth_token === undefined) {
        callback('Error  while addTrack track oauth_token is required and is: ' + options.oauth_token);
        return;
    } else {
        form.append('oauth_token', options.oauth_token);
    }


    if (options.asset_data === undefined) {
        callback('Error  while addTrack track options.asset_data is required and is: ' + options.asset_data);
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
    if (options.oauth_token === undefined) {
        callback('Error removeTrack oauth_token is required and is: ' + options.oauth_token);
        return;
    } else {

        var uri = 'https://api.soundcloud.com/tracks/' + options.id + '?oauth_token=' + options.oauth_token + '&format=json';
        request(uri, {method: 'DELETE'}, function (err, response) {
            if (err || response.body !== undefined && response.body.indexOf(404) !== -1) {
                console.log('Error while removeTrack track: ' + response.body);
                callback('Error while removeTrack track: ' + response.body);
            } else {
                callback(null, {result: response.body});
            }
        });
    }
};

exports.getTracks = function (options, callback) {
    if (options.oauth_token === undefined) {
        callback('Error getTracks oauth_token is required and is: ' + options.oauth_token);
        return;
    } else {
        var uri = 'https://api.soundcloud.com/me/tracks?format=json&oauth_token=' + options.oauth_token;
        request(uri, function (err, response, body) {
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
    if (options.oauth_token === undefined) {
        callback('Error searchTrack_q oauth_token is required and is: ' + options.oauth_token);
        return;
    } else {

        if (options.q === undefined) {
            callback('Error searchTrack_q options.q is required and is: ' + options.q);
            return;
        } else {
            var uri = 'https://api.soundcloud.com/me/tracks?format=json&oauth_token=' + options.oauth_token + '&q=' + options.q;
            request(uri, function (err, response, body) {
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
    if (options.client_id === undefined) {
        callback('Error resolveTrack options.client_id is required and is: ' + options.client_id);
        return;
    } else {

        if (options.uri === undefined) {
            callback('Error resolveTrack options.uri is required and is: ' + options.uri);
        } else {
//            http://api.soundcloud.com/resolve.json?url=https://soundcloud.com/user46387694/dog_example&client_id=6e110a037f1c9a14b1d3abd1d97f842a
            var uri = 'http://api.soundcloud.com/resolve.json?url=' + options.uri + '&client_id=' + options.client_id;
            request(uri, function (err, response, body) {
                if (err) {
                    console.log('Error while resolveTrack track: ' + err);
                    callback('Error while resolveTrack track: ' + err);

                } else {

                    response.on('error', function (err) {
                        callback('Error while resolveTrack track: ' + err);
                    });

                    console.log('resolveTrack successful');
                    callback(null, JSON.parse(response.body.toString('utf8')));


                }
            });
        }
    }
};


exports.addTrackToPlaylist = function (options, callback) {
    var form = new FormData();
    form.append('format', 'json');


    console.log(JSON.stringify(options.tracks));


    if (options.tracks === undefined) {
        callback('Error while addTrackToPlaylist options.tracks : ' + options.tracks);
        return;
    } else {
        _.each(trackIds(options.tracks), function (id) {
            console.log(id);
            form.append('playlist[tracks][][id]', id);
        });
    }

    if (options.track.id === undefined) {
        callback('Error while addTrackToPlaylist options.id : ' + options.track.id);
        return;
    } else {
        form.append('playlist[tracks][][id]', options.track.id);
    }

    if (options.title === undefined) {
        callback('Error while addTrackToPlaylist track : ' + options.title);
        return;
    } else {
        form.append('playlist[title]', options.title);
    }

    if (options.sharing === undefined) {
        callback('Error while addTrackToPlaylist track : ' + options.sharing);
        return;
    } else {
        form.append('playlist[sharing]', options.sharing);
    }

    if (options.oauth_token === undefined) {
        callback('Error while addTrackToPlaylist track : ' + options.oauth_token);
        return;
    } else {
        form.append('oauth_token', options.oauth_token);
    }

    console.log(parsedUrl(options));
    form.submit(parsedUrl(options), function (err, response) {
        if (!err) {

            response.on('error', function (err) {
                callback('Error while addTrackToPlaylist track: ' + err);
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
        protocol: playListUri.protocol
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

    if (options.tracks === undefined) {
        callback('Error while addTrackToNewPlaylist options.tracks : ' + options.tracks);
        return;
    } else {
        _.each(options.tracks, function (id) {
            form.append('playlist[tracks][][id]', id);
        });
    }
    if (options.title === undefined) {
        callback('Error while addTrackToNewPlaylist options.title : ' + options.title);
        return;
    } else {
        form.append('playlist[title]', options.title);
    }
    if (options.sharing === undefined) {
        callback('Error while addTrackToNewPlaylist options.sharing : ' + options.sharing);
        return;
    } else {
        form.append('playlist[sharing]', options.sharing);
    }
    if (options.oauth_token === undefined) {
        callback('Error while addTrackToNewPlaylist options.oauth_token : ' + options.oauth_token);
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
    if (options.oauth_token === undefined) {
        callback('Error oauth_token is required and is: ' + options.oauth_token);
        return;
    } else {
        var uri = 'https://api.soundcloud.com/me/playlists?format=json&oauth_token=' + options.oauth_token;
        request(uri, function (err, response, body) {
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
    if (options.oauth_token === undefined) {
        callback('Error getPlaylistById options.oauth_token is required and is: ' + options.oauth_token);
        return;
    } else if (options.id === undefined) {
        callback('Error getPlaylistById options.id is required and is: ' + options.id);
        return;
    } else {
        var uri = 'https://api.soundcloud.com/me/playlists/' + options.id + '?format=json&oauth_token=' + options.oauth_token;
        request(uri, function (err, response, body) {
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
    if (options.oauth_token === undefined) {
        callback('Error removePlaylist options.oauth_token is required and is: ' + options.oauth_token);
        return;
    } else if (options.title === undefined) {
        callback('Error removePlaylist options.title is required and is: ' + options.title);
        return;
    } else {
        var uri = 'https://api.soundcloud.com/playlists/' + options.title + '?oauth_token=' + options.oauth_token + '&format=json';
        request(uri, {method: 'DELETE'}, function (err, response) {
            if (err || response.body !== undefined && response.body.indexOf(404) !== -1) {
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
        data: options
    };

    curlrequest.request(curl_options, function (err, data, meta) {
        callback(err, JSON.parse(data), meta);
    });
}
