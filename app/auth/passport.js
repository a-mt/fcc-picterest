'use strict';
var User = require('../models/user/local');

module.exports = function (passport) {

    // Serialize and deserialize user instances to and form the session
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});
	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});
	var c = 0;

	// Local auth
	if(hasModule('passport-local')) {
	    process.env['AUTH_LOCAL'] = 1;
	    c++;
	    require('./passport-local')(passport);
	}
	// Login via Twitter
	if(hasModule('passport-twitter')) {
	    process.env['AUTH_TWITTER'] = 1;
	    c++;
	    require('./passport-twitter')(passport);
	}
	
	if(!c) {
	    process.env['AUTH_NONE'] = 1;
	}
};

function hasModule(modulename) {
    try {
        require.resolve(modulename);
        return true;
    } catch(e) {
        return false;
    }
}
