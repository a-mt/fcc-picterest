'use strict';

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var TwitterUser = new Schema({
    provider: { type: String, default: 'twitter' },
    username: {
        type: String,
        trim: true,
        required: [true, 'The field "username" is required']
    },
    twitter_id: {
        type: String,
        required: [true, 'The field "id" is required']
    }
}, { collection: 'users' });

module.exports = mongoose.model('TwitterUser', TwitterUser);