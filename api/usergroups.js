const coify = require('../utilities/coify');
const co_func = require('co-functional');

module.exports = function(models) {

    const UserGroup = models.UserGroup;

    var list = function*(req, res, next) {
        try {
            var userGroups = yield UserGroup
                .find({}, '-quizzes')
                .sort({ name : -1});

            var groups = yield co_func.map(function*(userGroup) {
                var members = yield models.User
                    .find({
                        _id: {
                            $in: userGroup.members
                        }
                    }, '-hunches');

                return {
                    _id: userGroup._id,
                    name: userGroup.name,
                    members
                }
            }, userGroups);

            res.json(groups);

        } catch (err) {
            next(err);
        }
    };

    const members = function*(req, res, next) {
        try {
            const group_id = req.params.group_id;
            const userGroup = yield UserGroup
                .findById(group_id);

            if (userGroup) {

                var members = yield models.User
                    .find({
                        _id: {
                            $in: userGroup.members
                        },
                        active: true
                    }, '-__v -hunches')
                    .sort({firstName : 1});
                return res.send(members);
            }
            //invalid group as a result there is no members
            res.send([]);

        } catch (err) {
            next(err);
        }
    }

    return coify({
        list,
        members
    });

}
