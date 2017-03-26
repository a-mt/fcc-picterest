'use strict';
var User = require('../models/user/local');

function AuthHandler(){

    // Create a new account
    this.signup = function(req, res) {
        res.render('auth/signup', {
            title: 'Signup',
            errors: req.flash('errors').pop() || {},
            data: req.flash('data').pop() || {}
        });
    };
    this.addUser = function(req, res) {
        var params = req.body;
        var user   = new User(params);

        // Save user
        user.save(function(err){

            // Data validation of model failed
           if(err) {
               var errors = err.errors || {};

               // Err duplicate
                if (err.name === 'MongoError' && err.code === 11000) {
                    errors.username = {
                        message: 'User already exists'
                    };
                }
                // Render form with errors
                req.flash('errors', errors);
                req.flash('data', req.body);

                res.redirect('/signup');
            } else {
                req.login(user, function () {
                    res.redirect('/');
                });
            }
        });
    };

    // Login with an account
    this.signin = function(req, res) {
	    res.render('auth/signin', {
	        title: 'Login'
	    });
    };

    // Change password
    this.settings = function(req, res){
        res.render('auth/settings', {
            title: 'About me',
	        errors: req.flash("errors").pop() || {},
            data: req.flash('data').pop() || {}
        });
    };
    this.settingsSubmit = function(req, res){
        var user = req.user;

        // Check if given password matches current
        user.verifyPassword(req.body.password, function(err, isMatch){

            // Render form with errors
            if(!isMatch) {
                req.flash('errors', {
                    password: {message: 'Incorrect password.'}
                });
                req.flash('data', req.body);
                res.redirect('/settings');
                return;
            }

            // Save changes
            user.password = req.body.newpassword;
            user.save(function(err){

                // Data validation failed ?
                if(err) {
                    req.flash('errors', {
                        newpassword: err.errors.password
                    });
                    req.flash('data', req.body);
                } else {
                    req.flash('success', 'Your password has been successfully updated');
                }
                res.redirect('/settings');
            });
        });
    };
}

module.exports = new AuthHandler();