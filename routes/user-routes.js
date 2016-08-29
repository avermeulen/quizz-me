const mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    render = require('../utilities/render'),
    reportErrors = require('../utilities/http_utilities').reportErrors;

module.exports = function(models) {

    var listUsers = (req, res) => {
        models.User
            .find({})
            .then(users => render(req, res, 'users', {
                users: users
            }));
    };

    var addScreen = (req, res) => res.render('user_add');

    var add = (req, res) => {

        req.checkBody('firstName', 'First name is required').notEmpty();
        req.checkBody('lastName', 'Last name is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('githubUsername', 'Github username is required').notEmpty();

        var errors = req.validationErrors();
        if (errors){
            reportErrors(req, errors);
            return res.redirect('/user/add');
        }

        models.User(req.body)
                    .save()
                    .then(() => res.redirect('/users'));

    };


    const unknownUser = function (req, res) {
        render(req, res, 'user_unknown', {username : req.flash('username')});
    }

    return {
        listUsers: listUsers,
        addScreen : addScreen,
        add : add,
        unknownUser : unknownUser
    };
}
