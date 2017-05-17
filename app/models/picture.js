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
    },
    video: {
        type: String,
        trim: true
    },
    link_to: {
        type: String,
        trim: true,
        validate: {
          validator: function(v) {
            return /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(v);
          },
          message: '{VALUE} is not a valid url!'
        }
    },
    author: {
        type: String,
        trim: true
    },
    tags : [String]
});

module.exports = mongoose.model('Picture', Picture);