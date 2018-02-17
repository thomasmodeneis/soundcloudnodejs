/**
 * @author Thomas Modeneis
 */

'use strict';
var Promise = require("bluebird");
var curlrequest = require('curlrequest');

var request = require('request');
Promise.promisifyAll(request, {multiArgs: true});

var fs = require('fs');
var _ = require('underscore');
var FormData = require('form-data');
var URL = require('url');

var fetch = require('node-fetch');

var DEBUG_MODE_ON = /true/.test(process.env.SOUNDCLOUDJS_DEBUG)


/**
 * Add a new track
 * @param options
 * @param cb
 * @returns {*}
 */
var addTrack = function addTrack(options) {
    return new Promise(function (resolve, reject) {
        var form = new FormData();

        form.append('format', 'json');
        if (!options.title) {
            reject('Error while addTrack track options.title is required but is null');
        } else {
            form.append('track[title]', options.title);
        }
        if (!options.description) {
            reject('Error  while addTrack track options.description is required but is null');
        } else {
            form.append('track[description]', options.description);
        }
        if (!options.genre) {
            reject('Error  while addTrack track options.genre is required but is null');
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
        } else {
            form.append('oauth_token', options.oauth_token);
        }


        if (!options.asset_data) {
            reject('Error  while addTrack track options.asset_data is required but is null');
        } else {

            var exist_asset_data = fs.existsSync(options.asset_data);
            if (DEBUG_MODE_ON) {
                console.log("addTrack, exist_asset_data, ", exist_asset_data);
            }

            if (exist_asset_data) {
                form.append('track[asset_data]', fs.createReadStream(options.asset_data));
            } else {
                reject('Error addTrack could not find options.asset_data --> fs.createReadStream(options.asset_data): ' + exist_asset_data);
            }
        }

        form.getLength(function (err, length) {


            fetch('https://api.soundcloud.com/tracks', {
                method: 'POST',
                body: form,
                headers: {'content-length': length}
            }).then(function (res) {
                return res.json();
            }).then(function (json) {
                if (DEBUG_MODE_ON) {
                    console.log('addTrack successful');
                }
                resolve(json);
            }).catch(function (e) {
                reject(e);
            });

        });

    });
};

/**
 * Remove a track
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
var removeTrack = function removeTrack(options) {
    return new Promise(function (resolve, reject) {
        if (!options.oauth_token) {
            reject(new Error('Error removeTrack oauth_token is required but is null '));
        } else {

            var uri = 'https://api.soundcloud.com/tracks/' + options.id + '?oauth_token=' + options.oauth_token + '&format=json';
            request.getAsync(uri, {method: 'DELETE', timeout: 10000}).spread(function (response) {
                if (response.statusCode === 404) {
                    if (DEBUG_MODE_ON) {
                        console.log('Error: removeTrack, 404, track was not found ', response.statusCode);
                    }
                    reject(new Error('Error 404, track was not found ', response.statusCode));
                } else if (response.statusCode !== 200) {
                    reject(new Error('Error while removeTrack track, statusCode !== 200, ' + response.statusCode));
                } else {
                    try {
                        var json = JSON.parse(response.body)
                        resolve({result: json});
                    } catch (e) {
                        reject(new Error('Error while removeTrack track: ' + JSON.stringify(e)));
                    }
                }
            });
        }
    });
};

/**
 * Remove all tracks for a account.
 *
 * @param tracks
 * @param token
 * @param count
 * @param callback
 */
function removeAllTracks(tracks, token, count, callback) {
    var track = tracks[count];

    if (!track) {
        return callback('done');
    }

    var options = {
        id: track.id,
        oauth_token: token.oauth_token
    };

    removeTrack(options).then(function (track) {
        if (DEBUG_MODE_ON) {
            console.log('removeTrack, ', track);
        }
        count = count + 1;
        removeAllTracks(tracks, token, count, callback)
    }).catch(function (err) {
        console.log('ERROR: removeTrack, ', err);
        count = count + 1;
        removeAllTracks(tracks, token, count, callback)
    })
}

/**
 * Get a list of tracks
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
var getTracks = function getTracks(options) {
    return new Promise(function (resolve, reject) {
        if (!options.oauth_token) {
            reject(new Error('Error getTracks oauth_token is required but is null'));
        } else {
            var uri = `https://api.soundcloud.com/me/tracks?format=json&oauth_token=${options.oauth_token}&limit=${options.limit ? options.limit : 100}`;
            request.getAsync(uri, {timeout: 10000}).spread(function (response, body) {
                if (DEBUG_MODE_ON) {
                    console.log('getTracks successful');
                }
                try {
                    var tracks = _.map(JSON.parse(body.toString('utf8')), function (track) {
                        return track;
                    });
                    resolve(tracks);
                } catch (e) {
                    if (DEBUG_MODE_ON) {
                        console.log('Error while getTracks track: ', e);
                    }
                    reject(new Error('Error while getTracks track: ' + JSON.stringify(e)));
                }
            }).catch(function (e) {
                if (DEBUG_MODE_ON) {
                    console.log('Error while getTracks track: ', e);
                }
                reject(e);
            });
        }
    });
};

/**
 * Search for a track
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
var searchTrack_q = function searchTrack_q(options) {
    return new Promise(function (resolve, reject) {
        if (!options.oauth_token) {
            reject(new Error('Error searchTrack_q oauth_token is required and is null '));
        } else {

            if (!options.q) {
                reject(new Error('Error searchTrack_q options.q is required and is null'));
            } else {
                var uri = 'https://api.soundcloud.com/me/tracks?format=json&oauth_token=' + options.oauth_token + '&q=' + options.q;
                if (DEBUG_MODE_ON) {
                    console.log("searchTrack_q URI, ", uri);
                }

                request.getAsync(uri, {timeout: 10000}).spread(function (response, body) {
                    //console.log('searchTrack_q successful',body);
                    try {
                        //console.log(body.toString('utf8'))
                        resolve(JSON.parse(body.toString('utf8')));
                    } catch (e) {
                        if (DEBUG_MODE_ON) {
                            console.log('Error while searchTrack_q track: ', e);
                        }
                        reject(e);
                    }
                }).catch(function (e) {
                    if (DEBUG_MODE_ON) {
                        console.log('Error while searchTrack_q track: ', e);
                    }
                    reject(e);
                });
            }
        }
    });
};

/**
 * Resolve a URI
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
var resolveUri = function resolveUri(options) {
    return new Promise(function (resolve, reject) {
        if (!options.client_id) {
            reject(new Error('Error resolveUri options.client_id is required but is null'));
        } else {

            if (!options.uri) {
                throw new Error('Error resolveUri options.uri is required and is: ' + options.uri);
            } else {
                var uri = 'http://api.soundcloud.com/resolve.json?url=' + options.uri + '&client_id=' + options.client_id;
                request.getAsync(uri, {timeout: 10000}).spread(function (response) {

                    if (!response.body || response.body.indexOf('404') !== -1) {
                        if (DEBUG_MODE_ON) {
                            console.log('Error while resolveUri track: ');
                        }
                        reject(new Error('Error while resolveUri track: '));

                    } else {
                        if (DEBUG_MODE_ON) {
                            console.log('resolveUri successful');
                        }
                        try {
                            resolve(JSON.parse(response.body.toString('utf8')));
                        } catch (e) {
                            if (DEBUG_MODE_ON) {
                                console.log('Error while resolveUri track: ' + e);
                            }
                            reject(new Error('Error while resolveUri track: ' + e));
                        }

                    }
                }).catch(function (e) {
                    if (DEBUG_MODE_ON) {
                        console.log('Error while resolveUri track: ', e);
                    }
                    reject(e);
                });
            }
        }
    });
};

/**
 * Add track to existing playlist
 * @param options
 * @param cb
 * @returns {*}
 */
var addTrackToPlaylist = function addTrackToPlaylist(options) {
    return new Promise(function (resolve, reject) {
        var form = new FormData();
        form.append('format', 'json');

        if (!options.tracks) {
            return reject('Error while addTrackToPlaylist options.tracks is null');
        } else {
            _.each(options.tracks, function (track) {
                form.append('playlist[tracks][][id]', track.id);
            });
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

        if (!options.uri) {
            return reject('Error while addTrackToPlaylist uri for playlist is null');
        }

        form.getLength(function (err, length) {

            fetch(`${options.uri}?oauth_token=${options.oauth_token}`, {
                method: 'PUT',
                body: form,
                headers: {'content-length': length}
            }).then(function (res) {

                if (res.status === 200) {
                    if (DEBUG_MODE_ON) {
                        console.log(`INFO: addTrackToNewPlaylist, OK -> ${res.statusCode}.`);
                    }
                    return res.json();
                } else {
                    return null;
                }
            }).then(function (json) {
                if (!json) {
                    reject();
                } else {
                    if (DEBUG_MODE_ON) {
                        console.log('INFO: addTrack successful');
                    }
                    resolve(json);
                }
            }).catch(function (e) {
                reject(e);
            });

        });
    });
};

/**
 * Add track to new playlist
 * @param options
 * @param cb
 * @returns {*}
 */
var addTrackToNewPlaylist = function addTrackToNewPlaylist(options) {
    return new Promise(function (resolve, reject) {
        var form = new FormData();
        form.append('format', 'json');

        if (!options.tracks) {
            return reject('Error while addTrackToNewPlaylist options.tracks is null');
        } else {
            _.each(options.tracks, function (track) {
                form.append('playlist[tracks][][id]', track.id);
            });
        }
        if (!options.title) {
            return reject('Error while addTrackToNewPlaylist options.title is null');
        } else {
            form.append('playlist[title]', options.title);
        }
        if (!options.sharing) {
            return reject('Error while addTrackToNewPlaylist options.sharing is null');
        } else {
            form.append('playlist[sharing]', options.sharing);
        }
        if (!options.oauth_token) {
            return reject('Error while addTrackToNewPlaylist options.oauth_token is null');
        } else {
            form.append('oauth_token', options.oauth_token);
        }

        form.getLength(function (err, length) {

            fetch(`https://api.soundcloud.com/playlists?oauth_token=${options.oauth_token}`, {
                method: 'POST',
                body: form,
                headers: {'content-length': length}
            }).then(function (res) {

                if (res.status === 201) {
                    if (DEBUG_MODE_ON) {
                        console.log(`INFO: addTrackToNewPlaylist, OK -> ${res.statusCode}.`);
                    }
                    return res.json();
                } else {
                    return null;
                }
            }).then(function (json) {
                if (!json) {
                    reject();
                } else {
                    if (DEBUG_MODE_ON) {
                        console.log('INFO: addTrack successful');
                    }
                    resolve(json);
                }
            }).catch(function (e) {
                reject(e);
            });

        });
    });
};

/**
 * Get a playlist
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
var getPlaylist = function getPlaylist(options) {
    return new Promise(function (resolve, reject) {

        if (!options.oauth_token) {
            reject(new Error('Error oauth_token is required, but is null'));
        } else {
            var uri = 'https://api.soundcloud.com/me/playlists?format=json&oauth_token=' + options.oauth_token;
            request.getAsync(uri, {timeout: 10000}).spread(function (response, body) {
                try {
                    var tracks = _.map(JSON.parse(body.toString('utf8')), function (track) {
                        return track;
                    });
                    if (DEBUG_MODE_ON) {
                        console.log('getPlaylist successful');
                    }
                    resolve(tracks);
                } catch (e) {
                    if (DEBUG_MODE_ON) {
                        console.log('Error while getPlaylist track: ', e);
                    }
                    reject(e);
                }
            }).catch(function (e) {
                if (DEBUG_MODE_ON) {
                    console.log('Error while getPlaylist track: ' + e);
                }
                reject(e);
            })
        }
    });
};

/**
 * Get a playlist by id
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
var getPlaylistById = function getPlaylistById(options) {
    return new Promise(function (resolve, reject) {

        if (!options.oauth_token) {
            reject(new Error('Error getPlaylistById options.oauth_token is required, but is null'));
        } else if (!options.id) {
            reject(new Error('Error getPlaylistById options.id is required, but is null'));
        } else {
            var uri = 'https://api.soundcloud.com/me/playlists/' + options.id + '?format=json&oauth_token=' + options.oauth_token;
            request.getAsync(uri, {timeout: 10000}).spread(function (response, body) {
                if (DEBUG_MODE_ON) {
                    console.log('getPlaylistById successful');
                }
                try {
                    var tracks = _.map(JSON.parse(body.toString('utf8')), function (track) {
                        return track;
                    });
                    resolve(tracks);
                } catch (e) {
                    if (DEBUG_MODE_ON) {
                        console.log('Error while getPlaylistById track: ' + e);
                    }
                    reject(e);
                }
            }).catch(function (e) {
                if (DEBUG_MODE_ON) {
                    console.log('Error while getPlaylistById track: ' + e);
                }
                reject(e);
            });
        }
    });
};

/**
 * Remove a playlist
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
var removePlaylist = function removePlaylist(options) {
    return new Promise(function (resolve, reject) {

        if (!options.oauth_token) {
            reject(new Error('Error removePlaylist options.oauth_token is required but is null '));
        } else if (!options.title) {
            reject(new Error('Error removePlaylist options.title is required and but is null '));
        } else {
            var uri = 'https://api.soundcloud.com/playlists/' + options.title + '?oauth_token=' + options.oauth_token + '&format=json';
            request.getAsync(uri, {method: 'DELETE', timeout: 10000}).spread(function (response) {
                if (response.statusCode === 404) {
                    //console.log('Error 404, track was not found ', response.statusCode);
                    reject(new Error('Error 404, Playlist was not found ', response.statusCode));
                } else if (response.statusCode === 500) {
                    //console.log('Error 404, track was not found ', response.statusCode);
                    reject(new Error('Error 500, SoundCloud API is broken :| ', response.statusCode));
                } else if (!response.body || response.body.indexOf(404) !== -1) {
                    //console.log('Error while removeTrack track: ', response.toJSON());
                    reject(new Error('Error while removing Playlist: ', JSON.stringify(response)));
                } else {
                    resolve({result: response.body});
                }
            }).catch(function (e) {
                if (DEBUG_MODE_ON) {
                    console.log('Error while removePlaylist track: ', e);
                }
                //soundcloud returns 401 but playlist is 99% times removed so...ignore this
                resolve("");
            });
        }
    });
};

/**
 * Get a fresh token, need to be use with caution as SoundCloud will allow you to get very few tokens
 * Its smart to save your tokens and re-use it along your code
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
var getToken = function getToken(options) {
    return new Promise(function (resolve) {

        var curl_options = {
            'url': 'https://api.soundcloud.com/oauth2/token',
            'method': 'POST',
            verbose: true,
            encoding: 'utf8',
            data: options,
            timeout: 10000
        };

        curlrequest.request(curl_options, function (err, data, meta) {
            if (err) {
                if (DEBUG_MODE_ON) {
                    console.log("Error: getToken, ", err, data, meta);
                }
                resolve(null);
            } else if (!data) {
                if (DEBUG_MODE_ON) {
                    console.log("Error: getToken, data is null ", data, meta);
                }
                resolve(null);
            } else {
                try {
                    resolve(JSON.parse(data), meta);
                } catch (e) {
                    if (DEBUG_MODE_ON) {
                        console.log("Error: getToken, catch, ", e, data, meta);
                    }
                    resolve(null);
                }
            }
        });
    });
};

var parsedUrl = function parsedUrl(playlist) {
    var playListUri = URL.parse(playlist.uri);
    return {
        method: 'put',
        host: playListUri.host,
        path: playListUri.path,
        protocol: playListUri.protocol,
        timeout: 10000
    };
};

var trackIds = function trackIds(json) {
    return _.map(json, function (track) {
        return track.id;
    })
};

module.exports = {
    addTrack: addTrack,
    removeTrack: removeTrack,
    removeAllTracks: removeAllTracks,
    getTracks: getTracks,
    searchTrack_q: searchTrack_q,
    resolveUri: resolveUri,
    addTrackToPlaylist: addTrackToPlaylist,
    addTrackToNewPlaylist: addTrackToNewPlaylist,
    getPlaylist: getPlaylist,
    getPlaylistById: getPlaylistById,
    removePlaylist: removePlaylist,
    getToken: getToken,
    parsedUrl: parsedUrl,
    trackIds: trackIds,
};