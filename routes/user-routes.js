const mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    reportErrors = require('../utilities/http_utilities').reportErrors;

module.exports = function(models) {

    function render(res, viewName, params){
        params.userPath = true;
        res.render(viewName, params);
    }

    var listUsers = (req, res) => {
        models.User
            .find({})
            .then(users => render(res, 'users', {
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



    return {
        listUsers: listUsers,
        addScreen : addScreen,
        add : add
    };
}
