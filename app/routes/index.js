var pictureHandler = require(process.cwd() + '/app/controllers/picture.js');

module.exports = function(app) {

    // login / logout
    require('./auth')(app);

    // homepage
    app.get('/', pictureHandler.index);

    // pictures
    app.route('/picture/new')
       .get(isLoggedIn, pictureHandler.add)
       .post(isLoggedIn, pictureHandler.addSubmit);

    app.route('/picture/import')
       .get(isLoggedIn, pictureHandler.import)
       .post(isLoggedIn, pictureHandler.importSubmit);

    app.get('/dashboard/:user*', pictureHandler.listUser);
    app.get('/dashboard', isLoggedIn, pictureHandler.list);
    app.post('/picture/delete', isLoggedIn, pictureHandler.delete);
};