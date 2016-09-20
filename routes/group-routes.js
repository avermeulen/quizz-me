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
                res.render('usergroup_list', {groups})
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
                res.render('usergroup_add', {users})
            }
            catch(err){
                next(err);
            }
        });
    };

    var addGroup = function(req, res, next){
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('userId', 'Select some users').notEmpty();

        console.log(req.body);

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

        userGroup
            .save()
            .then(() => res.redirect('/groups'));
    }


    return {
        listGroups,
        showAddScreen,
        addGroup
    }
}
