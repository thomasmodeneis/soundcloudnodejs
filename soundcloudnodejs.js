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

var DEBUG_MODE_ON = process.env.SOUNDCLOUDJS_DEBUG || false;


/**
 * Add a new track
 * @param options
 * @param cb
 * @returns {*}
 */
function addTrack(options, cb) {
    var form = new FormData();

    form.append('format', 'json');
    if (!options.title) {
        return cb('Error while addTrack track options.title is required but is null');
    } else {
        form.append('track[title]', options.title);
    }
    if (!options.description) {
        return cb('Error  while addTrack track options.description is required but is null');
    } else {
        form.append('track[description]', options.description);
    }
    if (!options.genre) {
        return cb('Error  while addTrack track options.genre is required but is null');
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
        return cb('Error  while addTrack track oauth_token is required but is null');
    } else {
        form.append('oauth_token', options.oauth_token);
    }


    if (!options.asset_data) {
        return cb('Error  while addTrack track options.asset_data is required but is null');
    } else {

        var exist_asset_data = fs.existsSync(options.asset_data);
        if(DEBUG_MODE_ON) {
            console.log("addTrack, exist_asset_data, ", exist_asset_data);
        }

        if (exist_asset_data) {
            form.append('track[asset_data]', fs.createReadStream(options.asset_data));
        } else {
            return cb('Error addTrack could not find options.asset_data --> fs.createReadStream(options.asset_data): ' + exist_asset_data);
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
            if(DEBUG_MODE_ON) {
                console.log('addTrack successful');
            }
            cb(null, json);
        });
    });
}

/**
 * Remove a track
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
function removeTrack(options) {
    return new Promise(function (resolve, reject) {
        if (!options.oauth_token) {
            reject(new Error('Error removeTrack oauth_token is required but is null '));
        } else {

            var uri = 'https://api.soundcloud.com/tracks/' + options.id + '?oauth_token=' + options.oauth_token + '&format=json';
            request.getAsync(uri, {method: 'DELETE', timeout: 10000}).spread(function (response) {
                if (response.statusCode == 404) {
                    if(DEBUG_MODE_ON) {
                        console.log('Error: removeTrack, 404, track was not found ', response.statusCode);
                    }
                    reject(new Error('Error 404, track was not found ', response.statusCode));
                } else if (!response.body || response.body.indexOf(404) !== -1) {
                    if(DEBUG_MODE_ON) {
                        console.log('Error: removeTrack, while removeTrack track: ', response);
                    }
                    reject(new Error('Error while removeTrack track: ' + response.body));
                } else {
                    resolve({result: response.body});
                }
            });
        }
    });
}

/**
 * Get a list of tracks
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
function getTracks(options) {
    return new Promise(function (resolve, reject) {
        if (!options.oauth_token) {
            reject(new Error('Error getTracks oauth_token is required but is null'));
        } else {
            var uri = 'https://api.soundcloud.com/me/tracks?format=json&oauth_token=' + options.oauth_token;
            request.getAsync(uri, {timeout: 10000}).spread(function (response, body) {
                if(DEBUG_MODE_ON) {
                    console.log('getTracks successful');
                }
                try {
                    var tracks = _.map(JSON.parse(body.toString('utf8')), function (track) {
                        return track;
                    });
                    resolve(tracks);
                } catch (e) {
                    if(DEBUG_MODE_ON) {
                        console.log('Error while getTracks track: ' + e);
                    }
                    reject(new Error('Error while getTracks track: ' + e));
                }
            }).catch(function (e) {
                if(DEBUG_MODE_ON) {
                    console.log('Error while getTracks track: ', e);
                }
                reject(e);
            });
        }
    });
}

/**
 * Search for a track
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
function searchTrack_q(options) {
    return new Promise(function (resolve, reject) {
        if (!options.oauth_token) {
            reject(new Error('Error searchTrack_q oauth_token is required and is null '));
        } else {

            if (!options.q) {
                reject(new Error('Error searchTrack_q options.q is required and is null'));
            } else {
                var uri = 'https://api.soundcloud.com/me/tracks?format=json&oauth_token=' + options.oauth_token + '&q=' + options.q;
                if(DEBUG_MODE_ON) {
                    console.log("searchTrack_q URI, ", uri);
                }

                request.getAsync(uri, {timeout: 10000}).spread(function (response, body) {
                    //console.log('searchTrack_q successful',body);
                    try {
                        //console.log(body.toString('utf8'))
                        resolve(JSON.parse(body.toString('utf8')));
                    } catch (e) {
                        if(DEBUG_MODE_ON) {
                            console.log('Error while searchTrack_q track: ', e);
                        }
                        reject(e);
                    }
                }).catch(function (e) {
                    if(DEBUG_MODE_ON) {
                        console.log('Error while searchTrack_q track: ', e);
                    }
                    reject(e);
                });
            }
        }
    });
}

/**
 * Resolve a URI
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
function resolveUri(options) {
    return new Promise(function (resolve, reject) {
        if (!options.client_id) {
            reject(new Error('Error resolveUri options.client_id is required but is null'));
        } else {

            if (!options.uri) {
                throw new Error('Error resolveUri options.uri is required and is: ' + options.uri);
            } else {
                var uri = 'http://api.soundcloud.com/resolve.json?url=' + options.uri + '&client_id=' + options.client_id;
                request.getAsync(uri, {timeout: 10000}).spread(function (response, body) {

                    if (!response.body || response.body.indexOf('404') !== -1) {
                        if(DEBUG_MODE_ON) {
                            console.log('Error while resolveUri track: ');
                        }
                        reject(new Error('Error while resolveUri track: '));

                    } else {
                        if(DEBUG_MODE_ON) {
                            console.log('resolveUri successful');
                        }
                        try {
                            resolve(JSON.parse(response.body.toString('utf8')));
                        } catch (e) {
                            if(DEBUG_MODE_ON) {
                                console.log('Error while resolveUri track: ' + e);
                            }
                            reject(new Error('Error while resolveUri track: ' + e));
                        }

                    }
                }).catch(function (e) {
                    if(DEBUG_MODE_ON) {
                        console.log('Error while resolveUri track: ', e);
                    }
                    reject(e);
                });
            }
        }
    });
}

/**
 * Add track to existing playlist
 * @param options
 * @param cb
 * @returns {*}
 */
function addTrackToPlaylist(options, cb) {

    var form = new FormData();
    form.append('format', 'json');

    if (!options.tracks) {
        return cb('Error while addTrackToPlaylist options.tracks is null');
    } else {
        _.each(trackIds(options.tracks), function (id) {
            //console.log(id);
            form.append('playlist[tracks][][id]', id);
        });
    }

    if (!options.track.id) {
        return cb('Error while addTrackToPlaylist options.id is null');
    } else {
        form.append('playlist[tracks][][id]', options.track.id);
    }

    if (!options.title) {
        return cb('Error while addTrackToPlaylist track, title is null');
    } else {
        form.append('playlist[title]', options.title);
    }

    if (!options.sharing) {
        return cb('Error while addTrackToPlaylist track, sharing is null');
    } else {
        form.append('playlist[sharing]', options.sharing);
    }

    if (!options.oauth_token) {
        return cb('Error while addTrackToPlaylist track oauth_token is null');
    } else {
        form.append('oauth_token', options.oauth_token);
    }

    form.submit(parsedUrl(options), function (err, response) {
        if(DEBUG_MODE_ON) {
            console.log("addTrackToPlaylist, submit, ", response.statusCode);
        }
        if (err) {
            if(DEBUG_MODE_ON) {
                console.log('Error while addTrackToPlaylist track: ', err);
            }
            cb(err);
        } else if (response.statusCode !== 200) {
            if(DEBUG_MODE_ON) {
                console.log(`addTrackToPlaylist, Soundcloud API returned Error ${response.statusCode}, cuz their API does this things, but probably it went all good.`);
            }
            cb(`addTrackToPlaylist, Soundcloud API returned Error ${response.statusCode}, cuz their API does this things, but probably it went all good.`);
        } else {
            //SoundCloud API is inconsistent, the fact that the response can't be marshaled does not mean request failed :|
            //so we assume it worked
            cb(null);
        }
    });
}

/**
 * Add track to new playlist
 * @param options
 * @param cb
 * @returns {*}
 */
function addTrackToNewPlaylist(options, cb) {

    var form = new FormData();
    form.append('format', 'json');

    if (!options.tracks) {
        return cb('Error while addTrackToNewPlaylist options.tracks is null');
    } else {
        _.each(options.tracks, function (id) {
            form.append('playlist[tracks][][id]', id);
        });
    }
    if (!options.title) {
        return cb('Error while addTrackToNewPlaylist options.title is null');
    } else {
        form.append('playlist[title]', options.title);
    }
    if (!options.sharing) {
        return cb('Error while addTrackToNewPlaylist options.sharing is null');
    } else {
        form.append('playlist[sharing]', options.sharing);
    }
    if (!options.oauth_token) {
        return cb('Error while addTrackToNewPlaylist options.oauth_token is null');
    } else {
        form.append('oauth_token', options.oauth_token);
    }

    form.submit('https://api.soundcloud.com/playlists', function (err, response) {

        if (err) {
            if(DEBUG_MODE_ON) {
                console.log('Error while addTrackToNewPlaylist track: ' + err);
            }
            cb(err);
        } else if (response.statusCode !== 200) {
            if(DEBUG_MODE_ON) {
                console.log(`addTrackToNewPlaylist, Soundcloud API returned Error ${response.statusCode}, cuz their API does this things, but probably it went all good.`);
            }
            cb(`addTrackToNewPlaylist, Soundcloud API returned Error ${response.statusCode}, cuz their API does this things, but probably it went all good.`);
        } else {
            //SoundCloud API is inconsistent, the fact that the response can't be marshaled does not mean request failed :|
            //so we assume it worked
            cb(null);
        }
    });
}

/**
 * Get a playlist
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
function getPlaylist(options) {
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
                    if(DEBUG_MODE_ON) {
                        console.log('getPlaylist successful');
                    }
                    resolve(tracks);
                    return null;
                } catch (e) {
                    if(DEBUG_MODE_ON) {
                        console.log('Error while getPlaylist track: ' + e);
                    }
                    reject(e);
                }
            }).catch(function (e) {
                if(DEBUG_MODE_ON) {
                    console.log('Error while getPlaylist track: ' + e);
                }
                reject(e);
            })
        }
    });
}

/**
 * Get a playlist by id
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
function getPlaylistById(options) {
    return new Promise(function (resolve, reject) {

        if (!options.oauth_token) {
            reject(new Error('Error getPlaylistById options.oauth_token is required, but is null'));
        } else if (!options.id) {
            reject(new Error('Error getPlaylistById options.id is required, but is null'));
        } else {
            var uri = 'https://api.soundcloud.com/me/playlists/' + options.id + '?format=json&oauth_token=' + options.oauth_token;
            request.getAsync(uri, {timeout: 10000}).spread(function (response, body) {
                if(DEBUG_MODE_ON) {
                    console.log('getPlaylistById successful');
                }
                try {
                    var tracks = _.map(JSON.parse(body.toString('utf8')), function (track) {
                        return track;
                    });
                    resolve(tracks);
                } catch (e) {
                    if(DEBUG_MODE_ON) {
                        console.log('Error while getPlaylistById track: ' + e);
                    }
                    reject(e);
                }
            }).catch(function (e) {
                if(DEBUG_MODE_ON) {
                    console.log('Error while getPlaylistById track: ' + e);
                }
                reject(e);
            });
        }
    });
}

/**
 * Remove a playlist
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
function removePlaylist(options) {
    return new Promise(function (resolve, reject) {

        if (!options.oauth_token) {
            reject(new Error('Error removePlaylist options.oauth_token is required but is null '));
        } else if (!options.title) {
            reject(new Error('Error removePlaylist options.title is required and but is null '));
        } else {
            var uri = 'https://api.soundcloud.com/playlists/' + options.title + '?oauth_token=' + options.oauth_token + '&format=json';
            request.getAsync(uri, {method: 'DELETE', timeout: 10000}).spread(function (response) {
                if (response.statusCode == 404) {
                    //console.log('Error 404, track was not found ', response.statusCode);
                    reject(new Error('Error 404, Playlist was not found ', response.statusCode));
                } else if (response.statusCode == 500) {
                    //console.log('Error 404, track was not found ', response.statusCode);
                    reject(new Error('Error 500, SoundCloud API is broken :| ', response.statusCode));
                } else if (!response.body || response.body.indexOf(404) !== -1) {
                    //console.log('Error while removeTrack track: ', response.toJSON());
                    reject(new Error('Error while removing Playlist: ', JSON.stringify(response)));
                } else {
                    resolve({result: response.body});
                }
            }).catch(function (e) {
                if(DEBUG_MODE_ON) {
                    console.log('Error while removePlaylist track: ', e);
                }
                //soundcloud returns 401 but playlist is 99% times removed so...ignore this
                resolve("");
            });
        }
    });
}

/**
 * Get a fresh token, need to be use with caution as SoundCloud will allow you to get very few tokens
 * Its smart to save your tokens and re-use it along your code
 * @param options
 * @returns {bluebird|exports|module.exports}
 */
function getToken(options) {
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
                if(DEBUG_MODE_ON) {
                    console.log("Error: getToken, ", err, data, meta);
                }
                resolve(null);
            } else if (!data) {
                if(DEBUG_MODE_ON) {
                    console.log("Error: getToken, data is null ", data, meta);
                }
                resolve(null);
            } else {
                try {
                    resolve(JSON.parse(data), meta);
                } catch (e) {
                    if(DEBUG_MODE_ON) {
                        console.log("Error: getToken, catch, ", e, data, meta);
                    }
                    resolve(null);
                }
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