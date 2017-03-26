'use strict';

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var Picture = new Schema({
    _creator: {
        type: String,
        ref: 'LocalUser',
        required: true
    },
    url: {
        type: String,
        trim: true,
        required: [true, 'The field "url" is required']
    }
});

module.exports = mongoose.model('Picture', Picture);