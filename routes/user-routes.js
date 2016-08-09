module.exports = function(models) {

    var listUsers = function(req, res){
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


    return {
        listUsers: listUsers,
        addScreen : addScreen,
        add : add
    };
}
