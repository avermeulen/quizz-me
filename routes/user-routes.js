const mongoose = require('mongoose'),
    co = require('co'),
    ObjectId = mongoose.Types.ObjectId,
    render = require('../utilities/render'),
    reportErrors = require('../utilities/http_utilities').reportErrors,
    Services = require('./services');

module.exports = function(models) {

    const services = new Services(models);
    const User = models.User;
    const listUsers = (req, res) => {
        User
            .find({})
            .sort({firstName : 1})
            .then(users => {
                render(req, res, 'users', {
                    users: users
                })
            });
    };

    const addScreen = (req, res) => render(req, res, 'user_add');

    function validateUserDetails(req){
        req.checkBody('firstName', 'First name is required').notEmpty();
        req.checkBody('lastName', 'Last name is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('githubUsername', 'Github username is required').notEmpty();
        return req.validationErrors();
    }

    const addUser = (req, res) => {

        var errors = validateUserDetails(req);
        if (errors){
            reportErrors(req, errors);
            return res.redirect('/user/add');
        }

        var userData = req.body;
        userData.role = 'candidate';

        User(userData)
          .save()
          .then(() => res.redirect('/users'));

    };

    const showUser = function(req, res, next){
        var _id = req.params._id;

        User.findById(_id)
            .then((user) => {
                var userObj = user.toJSON({virtuals : true});
                userObj.isActive = userObj.active === true;
                render(req, res, 'user_edit', userObj);
            })
            .catch(function(err){
                next(err);
            })

    };

    const unknownUser = function (req, res) {
        render(req, res, 'user_unknown', {username : req.flash('username')});
    };

    const inactiveUser = function (req, res) {
        render(req, res, 'user_inactive');
    };

    const updateUser = function(req, res){
        var _id = req.params._id;

        var data = req.body;

        if (!data.active){
            data.active = false;
        }
        
        User.update({_id : ObjectId(_id)}, data)
            .then(() => {
                res.redirect('/users');
            });
    };

    const registerUserScreen = function(req, res, next){

        var username = req.flash('new_username');
        var fullName = req.flash('fullName');

        var nameParts = fullName[0].split(' ');
        var firstName = nameParts.length >= 0 ? nameParts[0] : '',
            lastName =  nameParts.length >= 1 ? nameParts[1] : '';

        render(req, res, 'user_register' , { githubUsername : username,
            firstName : firstName,
            lastName : lastName});
    };

    const overview = (req, res) => {
        co(function*(){
            try{
                const userQuizData = yield services
                        .findUserData(req.params.username);

                render(req, res, 'user', userQuizData);
            }
            catch(err){
                next(err);
            }
        });
    }

    const registerUser = (req, res) => {

        var errors = validateUserDetails(req);
        if (errors){
            reportErrors(req, errors);
            return res.redirect('/user/register');
        }

        var userData = req.body;
        userData.role = 'candidate';

        User(userData)
          .save()
          .then(() => res.redirect('/user/registered'));

    };

    return {
        listUsers,
        addScreen,
        add : addUser,
        show : showUser,
        update : updateUser,
        registerUserScreen,
        registerUser,
        inactiveUser,
        unknownUser,
        overview
    };
}
