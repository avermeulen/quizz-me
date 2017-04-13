const coify = require('../utilities/coify');
module.exports = function (models) {
    const renderHunchAdd = (res, params) => {
        res.render('hunches/add', params);
    };
    const showAdd = function (req, res, next) {
        return function* () {
            const username = req.params.username;
            const usergroup_id = req.params.usergroup_id;
            const mentor_username = req.params.mentor_username;
            const user = yield models.User.findOne({ githubUsername: username });
            renderHunchAdd(res, {
                username,
                user,
                mentor_username,
                usergroup_id
            });
        };
    };
    const add = function* (req, res, next) {
        try {
            const username = req.body.username;
            const mentor_username = req.body.mentor_username;
            const usergroup_id = req.body.usergroup_id;
            req.checkBody('description', 'Hunch desciption is required').notEmpty();
            req.checkBody('rating', 'Rating is required').notEmpty();
            var errors = req.validationErrors();
            const user = yield models.User.findOne({ githubUsername: username });
            const mentor = yield models.User.findOne({ githubUsername: mentor_username });
            if (errors) {
                reportErrors(req, errors);
                //return res.redirect(`/hunches/add/${username}/mentor/${mentor_username}/group/${usergroup_id}`);
                return renderHunchAdd(res, {
                    username,
                    user,
                    mentor_username,
                    usergroup_id,
                    data: req.body
                });
            }
            const hunch = {
                _mentor: mentor._id,
                description: req.body.description,
                createdAt: new Date(),
                rating: req.body.rating
            };
            user.hunches.push(hunch);
            yield user.save();
            req.flash('success_message', 'Hunch added');
            res.redirect(`/groups/edit/${usergroup_id}`);
        }
        catch (err) {
            next(err);
        }
    };
    return coify({
        showAdd,
        add
    });
};
