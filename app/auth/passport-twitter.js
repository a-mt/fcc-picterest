'use strict';
var User            = require('../models/user/twitter');
var TwitterStrategy = require('passport-twitter').Strategy;

module.exports = function (passport) {

    if(!process.env.TWITTER_KEY) {
        throw new Error('The environment variable TWITTER_KEY isn\'t set');
    }
    if(!process.env.TWITTER_SECRET) {
        throw new Error('The environment variable TWITTER_SECRET isn\'t set');
    }
    if(!process.env.APP_URL) {
        throw new Error('The environment variable APP_URL isn\'t set');
    }

	passport.use(new TwitterStrategy(
	    {
    		consumerKey    : process.env.TWITTER_KEY,
    		consumerSecret : process.env.TWITTER_SECRET,
    		callbackURL    : process.env.APP_URL + 'auth/twitter/callback'
    	},
    	function (token, refreshToken, profile, done) {
    	  process.nextTick(function () { // Fire User.findOne when we have all our data back

			User.findOne({ 'twitter_id': profile.id }, function (err, user) {
				if (err) {
				    return done(err);
				}

                //If the user is found then log them in
				if (user) {
					return done(null, user);

                // If not, create it
				} else {
				    user = new User({
				        username   : profile.username,
				        twitter_id : profile.id
					});
					user.save(function (err) {
						if (err) throw err;
						return done(null, user);
					});
				}
			});

    	  });
    	}
    ));
};