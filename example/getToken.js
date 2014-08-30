/**
 * @author Thomas Modeneis <thomas.modeneis@gmail.com>
 */
'use strict';
var soundcloudnodejs = require('../soundcloudnodejs');
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
//    console.log(meta);

    if (err || token.access_token === undefined) {
        console.log('getToken err: ' + err + ' token.access_token: ' + token.access_token);
    } else {
        //set to config so is now global
        config.access_token = token.access_token;
        console.log(config.access_token)
    }
});