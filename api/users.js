const coify = require('../utilities/coify');
const co_func = require('co-functional');

module.exports = function(models){

    const User = models.User;

    const find = function * (req, res){
        const username = req.params.username;
        const users = yield User.find({githubUsername : username});
        const user = users.length === 1 ? users[0] : {};
        res.send(user);
    };

    return coify({
        find
    });

}
