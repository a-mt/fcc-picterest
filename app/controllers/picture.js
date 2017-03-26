'use strict';

var Picture  = require('../models/picture');
var NB_ELEMS = Number(process.env.NB_ELEMS);

function PictureHandler(){

    this.index = function(req, res) {
        var p = Number(req.query.p);
        if(isNaN(p) || p < 1) {
            p = 1;
        }

        Picture.find({}, {}, {
            skip : (p-1)*NB_ELEMS,
            limit: NB_ELEMS
        }).populate('_creator').exec(function(err, docs){
            res.render('index', {
                docs: (err ? [] : docs),
                p: (docs.length < NB_ELEMS ? false: p+1)
            });
        });
    };

    // Add a Picture
    this.add = function(req, res) {
        res.render('picture/new', {
            title: 'Add a picture',
            errors: req.flash('errors').pop() || {},
            data: req.flash('data').pop() || {}
        });
    };
    this.addSubmit = function(req, res) {
        var post = req.body;
        var item = new Picture(post);
        item._creator = req.user.id;

        // Save it
        item.save(function(err, obj){

            // Data validation of model failed
           if(err) {
               var errors = err.errors || {};

                // Render form with errors
                req.flash('errors', errors);
                req.flash('data', req.body);

                res.redirect('/picture/new');
            } else {
                res.redirect('/dashboard');
            }
        });
    };

    // List existing Pictures of the current user
    this.list = function(req, res) {
        renderList(req, res, false); 
    };

    // List pictures of the given user
    this.listUser = function(req, res) {

        // Retrieve  given user
        var username = req.params.user;
        var User     = require('../models/user/local');

        User.findOne({
            username: username
        }, function(err, user){
            if(err || !user) {
                res.status(404);
                
                if(req.xhr) {
                    res.send('Not found');
                } else {
                    res.redirect('/');
                }
                return;
            }
            renderList(req, res, user);
        });
    },

    // Delete
    this.delete = function(req, res) {
        var id = req.body.id;
        Picture.findById(id, function (err, item) {
            
            // Not found
            if(err || !item) {
                res.status(404).send('Not found');
                return;
            }
            if(item._creator != req.user.id) {
                res.status(403).send('Forbidden');
                return;
            }

            // Delete
            item.remove(function(){
                req.flash('success', 'The picture has been successfully deleted');
                res.redirect('/dashboard');
            });
        });
    };
}

function renderList(req, res, user) {

    var p = Number(req.query.p);
    if(isNaN(p) || p < 1) {
        p = 1;
    }
    Picture.find({
        _creator: user ? user.id : req.user.id
    }, {}, {
        skip : (p-1)*NB_ELEMS,
        limit: NB_ELEMS
    }).populate('_creator').exec(function(err, docs){
        res.render(user ? 'index' : 'picture/list', {
            title: user ? 'Dashboard of ' + user.username : 'Your dashboard',
            docs: err ? [] : docs,
            dashboard: user,
            p: (docs.length < NB_ELEMS ? false: p+1)
        });
    });
}

module.exports = new PictureHandler();
