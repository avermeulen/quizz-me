const mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    reportErrors = require('../utilities/http_utilities').reportErrors;

module.exports = function(models) {

    var listUsers = (req, res) => {
        models.User
            .find({})
            .then(users => res.render('users', {
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

    var overview = (req, res, next) => {
        models.User
            .findOne({githubUsername : req.params.user_name})
            .then((user) => {
                models
                    .Questionairre
                    .find({_user : ObjectId(user._id)})
                    .then((questionairres) => {
                        res.render('user', {
                            user : user,
                            questionairres : questionairres.map((quiz) => {
                                quiz.active = quiz.status != "completed";
                                return quiz;
                            })
                        });
                    }).catch((err) => next(err));
            });
    };

    return {
        listUsers: listUsers,
        addScreen : addScreen,
        add : add,
        overview : overview
    };
}
