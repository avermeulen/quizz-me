const coify = require('../utilities/coify');
const co_func = require('co-functional');

module.exports = function(models){

    const User = models.User;

    const find = function * (req, res){
        const username = req.params.username;
        const user = yield User.find({githubUsername : username});
        res.send(user);
    };
    
    return coify({
        find
    });

}
