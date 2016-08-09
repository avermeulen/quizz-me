module.exports = function(models) {

    var listUsers = function(req, res) {
        models.User
            .find({})
            .then(users => res.render('users', {
                users: users
            }));

    };

    return {
        listUsers: listUsers
    }
}
