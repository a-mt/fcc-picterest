var authHandler = require('../controllers/auth.js'),
    passport    = require('passport');

module.exports = function(app) {

    // pages that require an authenticated user redirect to /login
    global.isLoggedIn = function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/login');
        }
    }

    // signup
    app.route('/signup')
        .get(authHandler.signup)
        .post(authHandler.addUser);

    // login
    app.route('/login')
        .get(authHandler.signin)
        .post(passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        }));

    // logout
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // change password
    app.route('/settings')
        .get(isLoggedIn, authHandler.settings)
        .post(isLoggedIn, authHandler.settingsSubmit);

    // login via twitter (if module `passport-twitter` installed)
    if(process.env.AUTH_TWITTER) {
        app.route('/auth/twitter')
           .get(passport.authenticate('twitter'));

        app.route('/auth/twitter/callback')
           .get(passport.authenticate('twitter', {
                successRedirect: '/',
                    failureRedirect: '/login',
                    failureFlash: true
                }
            ));
    }
};