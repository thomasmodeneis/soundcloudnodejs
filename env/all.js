/**
 * @author Thomas Modeneis <thomas.modeneis@gmail.com>
 */
'use strict';
var path = require('path'),
    rootPath = path.normalize(__dirname + '/../..');

module.exports = {

    client_id: process.env.client_id,
    client_secret: process.env.client_secret,
    grant_type: process.env.grant_type,
    username: process.env.username,
    password: process.env.password,
    redirect_uri: process.env.redirect_uri,
    access_token: process.env.access_token

}
