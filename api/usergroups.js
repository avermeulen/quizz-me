const coify = require('../utilities/coify');
const co_func = require('co-functional');

module.exports = function(models){

    const UserGroup = models.UserGroup;

    var list = function * (req, res, next){
        try{
            var userGroups = yield UserGroup.find({}, '-quizzes');

            var members = yield models.User
                .find({_id : {$in : userGroups[1].members }})

            var groups = yield co_func.map(function*(userGroup){
                var members = yield models.User
                    .find({_id : {$in : userGroup.members }});
                //
                return {
                    _id : userGroup._id,
                    name : userGroup.name,
                    members
                }
            }, userGroups);

            res.send(groups);
        }
        catch(err){
            next(err);
        }
    };

    const members = function * (req, res){
        const group_id = req.params.group_id;
        const userGroup = yield UserGroup.findById(group_id);

        var members = yield models.User
            .find({_id : {$in : userGroup.members }, active: true}, '-__v')

        res.send(members);
    }



    return coify({
        list,
        members
    });

}
