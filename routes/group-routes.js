const mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    render = require('../utilities/render'),
    reportErrors = require('../utilities/http_utilities').reportErrors,
    AllocateQuiz = require('../utilities/allocate-quiz'),
    co = require('co')

module.exports = function(models) {

    const UserGroup = models.UserGroup,
          User = models.User,
          Course = models.Course,
          allocateQuiz = AllocateQuiz(models);

    var listGroups = function(req, res){
        co(function*(){
            try{
                const groups = yield models.UserGroup.find({});
                render(req, res, 'usergroup_list', {groups})
            }
            catch(err){
                next(err);
            }
        });
    };

    var showAddScreen = function(req, res, next){
        co(function*(){
            try{
                const users = yield models.User.find({});
                return render(req, res, 'usergroup_add', {users})
            }
            catch(err){
                next(err);
            }
        });
    };

    function findUsersInGroup(group_id){
        return co(function* (){
            const UserGroup = models.UserGroup;
            var userGroup = yield UserGroup.findOne({_id : group_id});
            var memberIds = userGroup.members.map((m) => ObjectId(m));
            var users = yield models.User.find({ _id : { $in : memberIds}});
            return {
                userGroup,
                users
            };
        });
    }

    var showUserGroup = function (req, res, next) {
        co(function *(){
            try{
                const group_id = ObjectId(req.params.group_id),
                    userGroupData = yield findUsersInGroup(group_id),
                    userGroup = userGroupData.userGroup,
                    users = userGroupData.users;

                render(req, res, 'usergroup_edit', {userGroup, users});
            }
            catch(err){
                next(err);
            }
        });
    }

    var addGroup = function(req, res, next){

        co(function *(){

            req.checkBody('name', 'Name is required').notEmpty();
            req.checkBody('userId', 'Select some users').notEmpty();

            var errors = req.validationErrors();
            if (errors){
                reportErrors(req, errors);
                return res.redirect('/groups/add');
            }

            var data = req.body,
                userIds = data.userId;

            var userGroup = models.UserGroup({
                name: data.name,
                members : userIds.map((id) => ObjectId(id))
            });

            yield userGroup.save()
            res.redirect('/groups');
        })
    }

    const allocateQuizScreen = function (req, res, next) {
        co(function*(){

            const courses = yield Course.find({}),
                group_id = req.params.group_id;
            render(req, res, 'usergroup_allocate_quiz', {courses, group_id});
        });
    };

    const allocateQuizAction = function (req, res, next) {
        co(function*(){

            try{
                const course_id = req.body.course_id,
                    group_id = req.params.group_id,
                    userGroupData = yield findUsersInGroup(group_id);

                const users = userGroupData.users;

                var allocations = users.map((user) => allocateQuiz(course_id, user.id , 3))

                yield allocations;

                res.redirect('/groups');
            }
            catch(err){
                next(err);
            }
        });
    };

    return {
        listGroups,
        showAddScreen,
        addGroup,
        showUserGroup,
        allocateQuizAction,
        allocateQuizScreen
    }
}
