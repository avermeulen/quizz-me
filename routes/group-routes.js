const mongoose = require('mongoose'),
    _ = require('lodash'),
    ObjectId = mongoose.Types.ObjectId,
    render = require('../utilities/render'),
    reportErrors = require('../utilities/http_utilities').reportErrors,
    AllocateQuiz = require('../utilities/allocate-quiz'),
    coify = require('../utilities/coify');

module.exports = function(models) {

    const UserGroup = models.UserGroup,
        User = models.User,
        Course = models.Course,
        Quiz = models.Questionairre,
        allocateQuiz = AllocateQuiz(models);

    var listGroups = function(req, res, next) {
        return function*() {
            try {
                const groups = yield models.UserGroup.find({});
                var numberOfMembersInAGroup = 0
                groups.forEach(function(group){
                  numberOfMembersInAGroup =group.members.length;
                })
                render(req, res, 'usergroups/list', {
                    groups,
                    numberOfMembersInAGroup
                })
            } catch (err) {
                next(err);
            }
        };
    };

    var showAddScreen = async function(req, res, next) {
        try {
            const users = await models.User.find({
                'active' : true
            })
            .sort({
                firstName : 1
            });

            return render(req, res, 'usergroups/add', {
                users
            })
        } catch (err) {
            next(err);
        }
    };

    function findUsersInGroup(group_id) {
        return function*() {
            var userGroup = yield UserGroup.findOne({
                _id: group_id
            });
            var memberIds = userGroup.members.map((m) => ObjectId(m));
            var users = yield models.User.find({
                _id: {
                    $in: memberIds
                }
            }).sort({
                firstName : 1
            });

            return {
                userGroup,
                users
            };
        };
    }

    var showUserGroup = function(req, res, next) {
        return function*() {
            try {
                const group_id = ObjectId(req.params.group_id),
                    userGroupData = yield findUsersInGroup(group_id),
                    userGroup = userGroupData.userGroup,
                    users = userGroupData.users,
                    userCount = users ? users.length : 0,
                    quizzes = yield Quiz
                    .find({
                        '_id': {
                            '$in': userGroup.quizzes
                        }
                    })
                    .populate('_user');

                render(req, res, 'usergroups/edit', {
                    userGroup,
                    users,
                    userCount,
                    quizzes,
                    mentor_username: req.session.username
                });
            } catch (err) {
                next(err);
            }
        };
    }

    var addGroup = function(req, res, next) {

        return function*() {

            req.checkBody('name', 'Name is required').notEmpty();
            req.checkBody('userId', 'Select some users').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                reportErrors(req, errors);
                return res.redirect('/groups/add');
            }

            var data = req.body,
                userIds = data.userId;

            var userGroup = models.UserGroup({
                name: data.name,
                members: userIds.map((id) => ObjectId(id))
            });

            yield userGroup.save()
            res.redirect('/groups');
        };
    }

    const updateGroup = function(req, res, next) {
        return function*() {
            const group_id = req.params.group_id;
            const group = yield UserGroup.findById(group_id);

            try {
                if (req.body.update_details) {
                    var registrationCode = req.body.registrationCode;
                    var activeForRegistration = req.body.activeForRegistration;

                    yield group.update({
                        registrationCode,
                        activeForRegistration
                    });
                    req.flash('success_message', 'Usergroup updated.');

                } else if (req.body.remove_users) {
                    var userIds = req.body.userId;
                    userIds = Array.isArray(userIds) ?
                        userIds : [userIds];

                    const _userIds = userIds.map((uid) => ObjectId(uid));
                    _userIds.forEach((uid) => group.members.remove(uid))

                    yield group.save();
                    req.flash('success_message', 'User/s removed from the group.');
                }
            } catch (err) {
                return next(err);
            }

            res.redirect(`/groups/edit/${group_id}`)
        }
    };

    const allocateQuizScreen = function(req, res, next) {
        return function*() {
            const courses = yield Course.find({});
            const group_id = req.params.group_id;
            render(req, res, 'usergroups/allocate_quiz', {
                courses,
                group_id
            });
        };
    };

    const allocateQuizAction = function(req, res, next) {
        return function*() {

            try {
                const course_id = req.body.course_id,
                    group_id = req.params.group_id,
                    userGroupData = yield findUsersInGroup(group_id);

                const users = userGroupData.users;

                const allocatedQuizList = yield users.map((user) => allocateQuiz(course_id, user.id, 3))
                const userGroup = yield UserGroup.findById(Object(group_id));

                allocatedQuizList.forEach((quiz) => {
                    if (quiz.status == 'active') {
                        userGroup.quizzes.push(quiz._id);
                    }
                });

                yield userGroup.save();
                res.redirect('/groups');
            } catch (err) {
                next(err);
            }
        };
    };

    const selectUsers = function(req, res, next) {
        return function*() {
            const userGroup = yield UserGroup
                .findById(req.params.group_id);

            const users = yield User.find({
                'active' : true,
                '_id': {
                    '$nin': userGroup.members
                }
            }).sort( {firstName : 1} );

            render(req, res, 'usergroups/add_users', {
                users,
                userGroup
            })
        };
    };

    const addUsers = function(req, res, next) {

        return function*() {
            try {
                const group_id = req.params.group_id;
                const userGroup = yield UserGroup.findById(group_id);

                var userIds = req.body.userId;
                userIds = Array.isArray(userIds) ? userIds : [userIds];

                userIds.forEach((uid) =>
                    userGroup.members.push(ObjectId(uid)));

                yield userGroup.save();

                req.flash('success_message', 'Users added to group.')
                res.redirect(`/groups/edit/${group_id}`);

            } catch (err) {
                next(err);
            }

        };
    };



    const routes = {
        addUsers,
        selectUsers,
        listGroups,
        showAddScreen,
        addGroup,
        updateGroup,
        showUserGroup,
        allocateQuizAction,
        allocateQuizScreen
    }

    return coify(routes);
}
