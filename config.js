/**
 * @author Thomas Modeneis <thomas.modeneis@gmail.com>
 */
'use strict';
var _ = require('underscore');

// Load app configuration
var env =  process.env.NODE_ENV || 'development';

module.exports = _.extend(
    require(__dirname + '/env/all.js'),
    require(__dirname + '/env/' + env + '.js') || {});
