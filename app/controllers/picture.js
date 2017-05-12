'use strict';

var Picture  = require('../models/picture');
var NB_ELEMS = Number(process.env.NB_ELEMS);

var multer  = require('multer'),
    upload  = multer({ dest: 'uploads/' }).single('file'),
    fs      = require('fs');

function PictureHandler(){

    this.index = function(req, res) {
        renderList(req, res, {});
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
        renderList(req, res, {
            user: req.user,
            title: 'Your dashboard',
            tpl: 'picture/list'
        });
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
            renderList(req, res, {
                user: user,
                title: 'Dashboard of ' + user.username
            });
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

    this.import = function(req, res) {
        res.render('picture/import', {
            title: 'Import a CSV file',
            errors: req.flash('errors').pop() || {}
        });
    };
    this.importSubmit = function(req, res) {

        // Delete files older than 1 hour
        var findRemoveSync = require('find-remove');
        findRemoveSync(__dirname + '/../../uploads', {age: {seconds: 3600}});

        // Submit file
         upload(req, res, function (err) {

            // Something went wrong
            if (err) {
                req.flash('errors', err);
                res.redirect('/picture/import');
                return;
            }

            // Already is ok
            var lineReader = require('readline').createInterface({
              input: require('fs').createReadStream(req.file.path)
            });
            var nok = [];
            var numline = 0, nb = 0;

            lineReader.on('line', function (line) {
              var data = line.split(',');
              numline++;

              if(!data[0]) {
                  return;
              }
              nb++;

              var item      = new Picture();
              item._creator = req.user.id;
              item.url      = data[0];

              if(data[1]) {
                item.author = data[1];
              }
              if(data[2]) {
                  item.link_to = data[2];
              }
              if(data[3]) {
                  item.video = data[3];
              }
              item.save(function(err){
                  if(err) {
                      var msg = '';
                      for(var k in err.errors) {
                          msg += err.errors[k].message + ' ';
                      }
                      nok.push({
                          data: data,
                          err : msg,
                          line: numline
                      });
                  }
              });
            });

            lineReader.on('close', function () {
                nb -= nok.length;
                req.flash('success', nb + ' line(s) have been imported');

                if(nok.length) {
                    req.flash('errors', {csv: nok});
                }

                // Remove the file and give feedback
                fs.unlink(req.file.path);
                res.redirect('/picture/import');
            });
        });
    };
}

function renderList(req, res, opts) {
    var q = {};
    if(opts.user) {
        q._creator = opts.user.id;
    }

    // Nombre total de post
    var nbtotal = 0;
    var chain;

    if(req.xhr) {
        chain = Promise.resolve();
    } else {
        chain = Picture.count(q);
        chain.then(function(count){
            nbtotal = count;
        });
    }

    // Numéro de page
    var p = Number(req.query.p);
    if(isNaN(p) || p < 1) {
        p = 1;
    }

    // Liste des images de la page en cours
    chain.then(function(){
        Picture.find(q, {}, {
            skip : (p-1)*NB_ELEMS,
            limit: NB_ELEMS

        }).populate('_creator').exec(function(err, docs){
            res.render(opts.tpl ? opts.tpl : 'index', {
                title: opts.title,
                docs: err ? [] : docs,
                dashboard: opts.user,

                // Paginig
                nbtotal: nbtotal,
                p: p,
                totalp: nbtotal ? Math.ceil(nbtotal/NB_ELEMS) : 1,
                url: req.url,
            });
        });
    });
}

module.exports = new PictureHandler();
