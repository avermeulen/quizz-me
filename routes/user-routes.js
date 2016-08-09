const mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId;

module.exports = function(models) {

    var listUsers = (req, res) => {
        models.User
            .find({})
            .then(users => res.render('users', {
                users: users
            }));
    };

    var addScreen = (req, res) => res.render('user_add');

    var add = (req, res) => models.User(req.body)
                                .save()
                                .then(() => res.redirect('/users'));

    var overview = (req, res) => {
        models.User
            .findOne({githubUsername : req.params.user_name})
            .then((user) => {
                models
                    .Questionairre
                    .find({_user : ObjectId(user._id)})
                    .then((questionairres) => {
                        res.render('user', {
                            user : user,
                            questionairres : questionairres
                        })
                    });
            })
    };

    return {
        listUsers: listUsers,
        addScreen : addScreen,
        add : add,
        overview : overview
    };
}
