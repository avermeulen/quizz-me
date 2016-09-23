const mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    render = require('../utilities/render'),
    reportErrors = require('../utilities/http_utilities').reportErrors,
    co = require('co');;

module.exports = function(models) {

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

    var showUserGroup = function (req, res, next) {
        co(function *(){
            try{
                var group_id = ObjectId(req.params.group_id);
                const UserGroup = models.UserGroup;
                var userGroup = yield UserGroup.findOne({_id : group_id});
                var memberIds = userGroup.members.map((m) => ObjectId(m));
                var users = yield models.User.find({ _id : { $in : memberIds}})

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


    return {
        listGroups,
        showAddScreen,
        addGroup,
        showUserGroup
    }
}
