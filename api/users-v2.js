
module.exports = function(models){

    const User = models.User;
    //const UserGroup = models.UserGroup;

    const toggleStatus = async function(req, res){
        try{
            const _id = req.params._id;
            const user = await User.findById(_id);
            if (!user){
                res.json({
                    status : "error",
                    error : "User not found."
                });
            }

            user.active = !user.active;

            const updatedUser = await user.save();

            res.json({
                status : "success",
                data : updatedUser
            });
        }
        catch(err){
            res.json({
                status : "error",
                error,
                stack : err.stack
            })
        }
    };

    return {
        toggleStatus
    };

}
