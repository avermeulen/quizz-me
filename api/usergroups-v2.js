module.exports = function(models) {

    const UserGroup = models.UserGroup;

    var list = async function(req, res, next) {
        try {
            var userGroups = await UserGroup
                .find({}, {name : 1})
                .sort({ name : -1});

            res.json(userGroups);

        } catch (err) {
            next(err);
        }
    };

    return {
        list
    };

}
