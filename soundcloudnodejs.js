/**
 * @author Thomas Modeneis
 */

'use strict';
var curlrequest = require('curlrequest');
var request = require('request');
var fs = require('fs');
var _ = require('underscore');
var FormData = require('form-data');
var Promise = require("bluebird");
var URL = require('url');

/**
 * Add New Track
 * @param options
 * @param callback
 */
function addTrack(options) {
    return new Promise(function (resolve, reject) {
        var form = new FormData();

        form.append('format', 'json');
        if (!options.title) {
            reject('Error while addTrack track options.title is required but is null');
            return;
        } else {
            form.append('track[title]', options.title);
        }
        if (!options.description) {
            reject('Error  while addTrack track options.description is required but is null');
            return;
        } else {
            form.append('track[description]', options.description);
        }
        if (!options.genre) {
            reject('Error  while addTrack track options.genre is required but is null');
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
            reject('Error  while addTrack track oauth_token is required but is null');
            return;
        } else {
            form.append('oauth_token', options.oauth_token);
        }


        if (!options.asset_data) {
            reject('Error  while addTrack track options.asset_data is required but is null');
            return;
        } else {

            var exist_asset_data = fs.existsSync(options.asset_data);
            console.log(exist_asset_data);

            if (exist_asset_data) {
                form.append('track[asset_data]', fs.createReadStream(options.asset_data));
            } else {
                reject('Error addTrack could not find options.asset_data --> fs.createReadStream(options.asset_data): ' + exist_asset_data);
                return;
            }
        }

        form.submit('https://api.soundcloud.com/tracks', function (err, response) {
            if (!err) {

                response.on('error', function (err) {
                    reject('Error addTrack while addTrack track: ' + err);
                });

                var data = "";
                response.on('data', function (chunk) {
                    data = data + chunk;
                });

                response.on('end', function () {
                    console.log('addTrack successful');
                    try {
                        resolve(JSON.parse(data.toString('utf8')));
                    } catch (e) {
                        reject(e);
                    }
                });

            } else {
                console.log('Error while addTrack track : ' + err);
                reject('Error while addTrack track : ' + err);

            }
        });

    });
}

/**
 * Remove Existing track
 * @param options
 */
function removeTrack(options) {
    return new Promise(function (resolve, reject) {
        if (!options.oauth_token) {
            reject('Error removeTrack oauth_token is required but is null ');
        } else {

            var uri = 'https://api.soundcloud.com/tracks/' + options.id + '?oauth_token=' + options.oauth_token + '&format=json';
            request(uri, {method: 'DELETE', timeout: 10000}, function (err, response) {
                if (err || !response.body || response.body.indexOf(404) !== -1) {
                    console.log('Error while removeTrack track: ' + response.body);
                    reject('Error while removeTrack track: ' + response.body);
                } else {
                    resolve({result: response.body});
                }
            });
        }
    });
}

/**
 *
 * @param options
 * @param callback
 */
function getTracks(options) {
    return new Promise(function (resolve, reject) {
        if (!options.oauth_token) {
            reject('Error getTracks oauth_token is required but is null');
        } else {
            var uri = 'https://api.soundcloud.com/me/tracks?format=json&oauth_token=' + options.oauth_token;
            request(uri, {timeout: 10000}, function (err, response, body) {
                if (!err) {
                    console.log('getTracks successful');
                    try {
                        var tracks = _.map(JSON.parse(body.toString('utf8')), function (track) {
                            return track;
                        });
                        resolve(tracks);
                    } catch (e) {
                        console.log('Error while getTracks track: ' + e);
                        reject('Error while getTracks track: ' + e);
                    }
                } else {
                    console.log('Error while getTracks track: ' + err);
                    reject('Error while getTracks track: ' + err);
                }
            });
        }
    });
}

/**
 * Search for a track
 * @param options
 */
function searchTrack_q(options) {
    return new Promise(function (resolve, reject) {
        if (!options.oauth_token) {
            reject('Error searchTrack_q oauth_token is required and is null ');
        } else {

            if (!options.q) {
                reject('Error searchTrack_q options.q is required and is null');
            } else {
                var uri = 'https://api.soundcloud.com/me/tracks?format=json&oauth_token=' + options.oauth_token + '&q=' + options.q;
                request(uri, {timeout: 10000}, function (err, response, body) {
                    if (!err) {
                        console.log('getTracks successful');
                        try {
                            resolve(JSON.parse(body.toString('utf8')));
                        } catch (e) {
                            console.log('Error while searchTrack_q track: ' + e);
                            reject('Error while searchTrack_q track: ' + e);
                        }
                    } else {
                        console.log('Error while searchTrack_q track: ' + err);
                        reject('Error while searchTrack_q track: ' + err);

                    }
                });
            }
        }
    });
}


/**
 * Resolve a URI
 * @param options
 */
function resolveUri(options) {
    return new Promise(function (resolve, reject) {
        if (!options.client_id) {
            reject('Error resolveUri options.client_id is required but is null');
        } else {

            if (!options.uri) {
                reject('Error resolveUri options.uri is required and is: ' + options.uri);
            } else {
//            http://api.soundcloud.com/resolve.json?url=https://soundcloud.com/user46387694/dog_example&client_id=6e110a037f1c9a14b1d3abd1d97f842a
                var uri = 'http://api.soundcloud.com/resolve.json?url=' + options.uri + '&client_id=' + options.client_id;
                request(uri, {timeout: 10000}, function (err, response, body) {

//                console.log(response.body);

                    if (err || !response.body || response.body.indexOf('404') !== -1) {
                        console.log('Error while resolveUri track: ' + err);
                        reject('Error while resolveUri track: ' + err);

                    } else {
                        console.log('resolveUri successful');
                        try {
                            resolve(JSON.parse(response.body.toString('utf8')));
                        } catch (e) {
                            console.log('Error while resolveUri track: ' + err);
                            reject('Error while resolveUri track: ' + err);
                        }

                    }
                });
            }
        }
    });
}

/**
 * Add track to a playlist
 * @param options
 */
function addTrackToPlaylist(options) {
    return new Promise(function (resolve, reject) {

        var form = new FormData();
        form.append('format', 'json');

        if (!options.tracks) {
            return reject('Error while addTrackToPlaylist options.tracks is null');
        } else {
            _.each(trackIds(options.tracks), function (id) {
                //console.log(id);
                form.append('playlist[tracks][][id]', id);
            });
        }

        if (!options.track.id) {
            return reject('Error while addTrackToPlaylist options.id is null');
        } else {
            form.append('playlist[tracks][][id]', options.track.id);
        }

        if (!options.title) {
            return reject('Error while addTrackToPlaylist track, title is null');
        } else {
            form.append('playlist[title]', options.title);
        }

        if (!options.sharing) {
            return reject('Error while addTrackToPlaylist track, sharing is null');
        } else {
            form.append('playlist[sharing]', options.sharing);
        }

        if (!options.oauth_token) {
            return reject('Error while addTrackToPlaylist track oauth_token is null');
        } else {
            form.append('oauth_token', options.oauth_token);
        }

        form.submit(parsedUrl(options), function (err, response) {
            if (!err) {

                response.on('error', function (err) {
                    reject('Error while addTrackToPlaylist track: ' + err);
                });

                var data = "";
                response.on('data', function (chunk) {
                    data = data + chunk;
                });

                response.on('end', function () {
                    console.log('addPlaylist successful');
                    if (data.toString('utf8').indexOf('xml') !== -1) {
                        resolve(data.toString('utf8'));
                    } else {
                        try {
                            resolve(JSON.parse(data.toString('utf8')));
                        } catch (e) {
                            resolve({});
                        }
                    }
                });

            } else {
                console.log('Error while addTrackToPlaylist track: ' + err);
                reject('Error while addTrackToPlaylist track: ' + err);

            }
        });
    });
}

/** BEGIN INTERNALS **/
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
/** END INTERNALS **/

/**
 * Add track to a new playlist
 * @param options
 */
function addTrackToNewPlaylist(options) {
    return new Promise(function (resolve, reject) {

        var form = new FormData();
        form.append('format', 'json');

        if (!options.tracks) {
            reject('Error while addTrackToNewPlaylist options.tracks is null');
            return;
        } else {
            _.each(options.tracks, function (id) {
                form.append('playlist[tracks][][id]', id);
            });
        }
        if (!options.title) {
            reject('Error while addTrackToNewPlaylist options.title is null');
            return;
        } else {
            form.append('playlist[title]', options.title);
        }
        if (!options.sharing) {
            reject('Error while addTrackToNewPlaylist options.sharing is null');
            return;
        } else {
            form.append('playlist[sharing]', options.sharing);
        }
        if (!options.oauth_token) {
            reject('Error while addTrackToNewPlaylist options.oauth_token is null');
            return;
        } else {
            form.append('oauth_token', options.oauth_token);
        }

        form.submit('https://api.soundcloud.com/playlists', function (err, response) {
            if (!err) {

                response.on('error', function (err) {
                    reject('Error while addTrackToNewPlaylist track: ' + err);
                });

                var data = "";
                response.on('data', function (chunk) {
                    data = data + chunk;
                });

                response.on('end', function () {
                    console.log('addPlaylist successful');
                    try {
                        console.log(data.toString('utf8'))
                        resolve(JSON.parse(data.toString('utf8')));
                    } catch (e) {
                        resolve({});
                    }

                });

            } else {
                console.log('Error while addTrackToNewPlaylist track: ' + err);
                reject('Error while addTrackToNewPlaylist track: ' + err);

            }
        });
    });
}

/**
 * Get a playlist
 * @param options
 * @returns {*}
 */
function getPlaylist(options) {
    return new Promise(function (resolve, reject) {

        if (!options.oauth_token) {
            reject('Error oauth_token is required, but is null');
        } else {
            var uri = 'https://api.soundcloud.com/me/playlists?format=json&oauth_token=' + options.oauth_token;
            request(uri, {timeout: 10000}, function (err, response, body) {
                if (!err) {
                    console.log('getPlaylist successful');
                    try {
                        var tracks = _.map(JSON.parse(body.toString('utf8')), function (track) {
                            return track;
                        });
                        resolve(tracks);
                    } catch (e) {
                        console.log('Error while getPlaylist track: ' + err);
                        reject('Error while getPlaylist track: ' + err);
                    }
                } else {
                    console.log('Error while getPlaylist track: ' + err);
                    reject('Error while getPlaylist track: ' + err);
                }
            });
        }
    });
}

/**
 * Get a playlist by id
 * @param options
 * @returns {*}
 */
function getPlaylistById(options) {
    return new Promise(function (resolve, reject) {

        if (!options.oauth_token) {
            reject('Error getPlaylistById options.oauth_token is required, but is null');
        } else if (!options.id) {
            reject('Error getPlaylistById options.id is required, but is null');
        } else {
            var uri = 'https://api.soundcloud.com/me/playlists/' + options.id + '?format=json&oauth_token=' + options.oauth_token;
            request(uri, {timeout: 10000}, function (err, response, body) {
                if (!err) {
                    console.log('getPlaylistById successful');
                    try {
                        var tracks = _.map(JSON.parse(body.toString('utf8')), function (track) {
                            return track;
                        });
                        resolve(tracks);
                    } catch (e) {
                        console.log('Error while getPlaylistById track: ' + err);
                        reject('Error while getPlaylistById track: ' + err);
                    }
                } else {
                    console.log('Error while getPlaylistById track: ' + err);
                    reject('Error while getPlaylistById track: ' + err);
                }
            });
        }
    });
}


/**
 * Remove a playlist
 * @param options
 * @returns {*}
 */
function removePlaylist(options) {
    return new Promise(function (resolve, reject) {

        if (!options.oauth_token) {
            reject('Error removePlaylist options.oauth_token is required but is null ');
        } else if (!options.title) {
            reject('Error removePlaylist options.title is required and but is null ');
        } else {
            var uri = 'https://api.soundcloud.com/playlists/' + options.title + '?oauth_token=' + options.oauth_token + '&format=json';
            request(uri, {method: 'DELETE', timeout: 10000}, function (err, response) {
                if (err || !response.body || response.body.indexOf(404) !== -1) {
                    console.log('Error while removePlaylist track: ' + response.body);
                    reject('Error while removePlaylist track: ' + response.body);
                } else {
                    resolve({result: response.body});
                }
            });
        }
    });
}

function getToken(options, callback) {
    return new Promise(function (resolve, reject) {

        var curl_options = {
            'url': 'https://api.soundcloud.com/oauth2/token',
            'method': 'POST',
            verbose: true,
            encoding: 'utf8',
            data: options,
            timeout: 10000
        };

        curlrequest.request(curl_options, function (err, data, meta) {
            if (err || !data) {
                reject(err);
            } else {
                try {
                    resolve(JSON.parse(data), meta);
                } catch (e) {
                    reject(e);
                }
            }
        });
    });
}

module.exports = {
    addTrack: addTrack,
    removeTrack: removeTrack,
    getTracks: getTracks,
    searchTrack_q: searchTrack_q,
    resolveUri: resolveUri,
    addTrackToPlaylist: addTrackToPlaylist,
    addTrackToNewPlaylist: addTrackToNewPlaylist,
    getPlaylist: getPlaylist,
    getPlaylistById: getPlaylistById,
    removePlaylist: removePlaylist,
    getToken: getToken
};