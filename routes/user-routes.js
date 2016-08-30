const mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    render = require('../utilities/render'),
    reportErrors = require('../utilities/http_utilities').reportErrors;

module.exports = function(models) {

    const User = models.User;

    const listUsers = (req, res) => {
        User
            .find({})
            .then(users => render(req, res, 'users', {
                users: users
            }));
    };

    const addScreen = (req, res) => render(req, res, 'user_add');

    const addUser = (req, res) => {

        req.checkBody('firstName', 'First name is required').notEmpty();
        req.checkBody('lastName', 'Last name is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('githubUsername', 'Github username is required').notEmpty();

        var errors = req.validationErrors();
        if (errors){
            reportErrors(req, errors);
            return res.redirect('/user/add');
        }
        var userData = req.body;
        userData.role = 'candidate';

        User()
          .save()
          .then(() => res.redirect('/users'));

    };

    const showUser = function(req, res){
        var username = req.params.username;

        User.findOne({githubUsername : username})
            .then((user) => {
                var userObj = user.toJSON({virtuals : true});
                render(req, res, 'user_edit', userObj);
            });
    };

    const unknownUser = function (req, res) {
        render(req, res, 'user_unknown', {username : req.flash('username')});
    };

    const updateUser = function(req, res){
        var username = req.params.username;

        User.update({githubUsername : username}, req.body)
            .then(() => {
                res.redirect('/users');
            });

    };

    return {
        listUsers: listUsers,
        addScreen : addScreen,
        add : addUser,
        show : showUser,
        update : updateUser,
        unknownUser : unknownUser
    };
}
