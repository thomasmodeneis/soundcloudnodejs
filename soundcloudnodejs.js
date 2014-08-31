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
        callback('Error while uploading track options.title: ' + options.title);
        return;
    } else {
        form.append('track[title]', options.title);
    }
    if (options.description === undefined) {
        callback('Error options.description is required and is: ' + options.description);
        return;
    } else {
        form.append('track[description]', options.description);
    }
    if (options.genre === undefined) {
        callback('Error options.genre is required and is:  ' + options.genre);
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
        callback('Error oauth_token is required and is: ' + options.oauth_token);
        return;
    } else {
        form.append('oauth_token', options.oauth_token);
    }


    if (options.asset_data === undefined) {
        callback('Error options.asset_data is required and is: ' + options.asset_data);
        return;
    } else {

        var exist_asset_data = fs.existsSync(options.asset_data);
        console.log(exist_asset_data);

        if (exist_asset_data) {
            form.append('track[asset_data]', fs.createReadStream(options.asset_data));
        } else {
            callback('Error could not find options.asset_data --> fs.createReadStream(options.asset_data): ' + exist_asset_data);
            return;
        }
    }

    form.submit('https://api.soundcloud.com/tracks', function (err, response) {
        if (!err) {

            response.on('error', function (err) {
                callback('Error while uploading track: ' + err);
            });

            var data = "";
            response.on('data', function (chunk) {
                data = data + chunk;
            });

            response.on('end', function () {
                console.log('upload successful');
                callback(null, JSON.parse(data.toString('utf8')));
            });

        } else {
            console.log('Error while uploading track: ' + err);
            callback('Error while uploading track: ' + err);

        }
    });
};

exports.removeTrack = function (options, callback) {
    if (options.oauth_token === undefined) {
        callback('Error oauth_token is required and is: ' + options.oauth_token);
        return;
    } else {

        var uri = 'https://api.soundcloud.com/tracks/' + options.id + '?oauth_token=' + options.oauth_token + '&format=json';
        request(uri, {method: 'DELETE'}, function (err, response) {
            if (err || response.body !== undefined && response.body.indexOf(404) !== -1) {
                console.log('Error while deleting track: ' + response.body);
                callback('Error while uploading track: ' + response.body);
            } else {
                callback(null, {result: response.body});
            }
        });
    }
};

exports.getTracks = function (options, callback) {
    if (options.oauth_token === undefined) {
        callback('Error oauth_token is required and is: ' + options.oauth_token);
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


exports.addTrackToPlaylist = function (options, callback) {
    var form = new FormData();
    form.append('format', 'json');


    console.log(JSON.stringify(options));


    if (options.tracks === undefined) {
        callback('Error while uploading options.tracks : ' + options.tracks);
        return;
    } else {
        _.each(trackIds(options.tracks), function (id) {
            console.log(id);
            form.append('playlist[tracks][][id]', id);
        });
    }

    if (options.id === undefined) {
        callback('Error while uploading options.id : ' + options.id);
        return;
    } else {
        form.append('playlist[tracks][][id]', options.id);
    }

    if (options.title === undefined) {
        callback('Error while uploading track : ' + options.title);
        return;
    } else {
        form.append('playlist[title]', options.title);
    }

    if (options.sharing === undefined) {
        callback('Error while uploading track : ' + options.sharing);
        return;
    } else {
        form.append('playlist[sharing]', options.sharing);
    }

    if (options.oauth_token === undefined) {
        callback('Error while uploading track : ' + options.oauth_token);
        return;
    } else {
        form.append('oauth_token', options.oauth_token);
    }

    console.log(parsedUrl(options));
    form.submit(parsedUrl(options), function (err, response) {
        if (!err) {

            response.on('error', function (err) {
                callback('Error while uploading track: ' + err);
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
            console.log('Error while uploading track: ' + err);
            callback('Error while uploading track: ' + err);

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
    return _.map(json.tracks, function(track) {
        return track.id;
    })
}


exports.addTrackToNewPlaylist = function (options, callback) {
    var form = new FormData();
    form.append('format', 'json');

    if (options.tracks === undefined) {
        callback('Error while uploading options.tracks : ' + options.tracks);
        return;
    } else {
        _.each(options.tracks, function (id) {
            form.append('playlist[tracks][][id]', id);
        });
    }
    if (options.title === undefined) {
        callback('Error while uploading options.title : ' + options.title);
        return;
    } else {
        form.append('playlist[title]', options.title);
    }
    if (options.sharing === undefined) {
        callback('Error while uploading options.sharing : ' + options.sharing);
        return;
    } else {
        form.append('playlist[sharing]', options.sharing);
    }
    if (options.oauth_token === undefined) {
        callback('Error while uploading options.oauth_token : ' + options.oauth_token);
        return;
    } else {
        form.append('oauth_token', options.oauth_token);
    }

    form.submit('https://api.soundcloud.com/playlists', function (err, response) {
        if (!err) {

            response.on('error', function (err) {
                callback('Error while uploading track: ' + err);
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
            console.log('Error while uploading track: ' + err);
            callback('Error while uploading track: ' + err);

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
        callback('Error options.oauth_token is required and is: ' + options.oauth_token);
        return;
    } else if ( options.id === undefined) {
        callback('Error  options.id is required and is: ' +  options.id);
        return;
    }else {
        var uri = 'https://api.soundcloud.com/me/playlists/' + options.id + '?format=json&oauth_token=' + options.oauth_token;
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

exports.removePlaylist = function (options, callback) {
    if (options.oauth_token === undefined) {
        callback('Error options.oauth_token is required and is: ' + options.oauth_token);
        return;
    } else if ( options.title === undefined) {
        callback('Error  options.title is required and is: ' +  options.title);
        return;
    }else {
        var uri = 'https://api.soundcloud.com/playlists/' + options.title + '?oauth_token=' + options.oauth_token + '&format=json';
        request(uri, {method: 'DELETE'}, function (err, response) {
            if (err || response.body !== undefined && response.body.indexOf(404) !== -1) {
                console.log('Error while deleting track: ' + response.body);
                callback('Error while uploading track: ' + response.body);
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
