const coify = require('../utilities/coify');
const co_func = require('co-functional');
const validator = require('validator');

module.exports = function(models){

    const User = models.User;
    const UserGroup = models.UserGroup;

    const find = function * (req, res){
        const username = req.params.username;
        const user = yield User.findOne({githubUsername : username}, {hunches : 0});
        if (!user){
            return res.send({ registered : "nope" });
        }
        //const user = users.length === 1 ? users[0]
        res.send(user);
    };

    const findAdmins = function * (req, res){
        const username = req.params.username;

        try{
            const adminUsers = yield User.find({role : "admin"},
                {hunches : 0, __v : 0, role : 0, _id : 0});

            res.send({
                status : "success",
                data : adminUsers
            });
        }
        catch(err){
            res.send({
                status : "error",
                error : err
            })
        }

    };

    const add = function * (req, res, next){
        const data = req.body;

        try{
            const requiredFields = [
                'firstName',
                'lastName',
                'email',
                'githubUsername',
                'registrationCode'
            ];

            var emptyFields = requiredFields
                .filter((field) => {
                    var value = data[field];
                    return value ?
                        validator.isEmpty(value) :
                        true;
                })

            emptyFields = emptyFields.map(function(field){
                return {
                    msg : field + ' not supplied'
                }
            });

            if (emptyFields.length > 0){
                return res.send({
                    status : 'error',
                    errors : emptyFields
                });
            }

            const user = yield User.findOne(
                {githubUsername : data.githubUsername});

            if (user){
                return res.send({
                    status : 'error',
                    errors : [{
                        msg : 'GitHub username in use.'
                    }]
                });
            }

            const userByEmail = yield User.findOne(
                {email : data.email});

            if (userByEmail){
                return res.send({
                    status : 'error',
                    errors : [{
                        msg : 'Email invalid.'
                    }]
                });
            }

            const userGroup = yield UserGroup
                .findOne({ registrationCode : data.registrationCode });

            if (userGroup && userGroup.activeForRegistration){

                const theUser = yield User(data).save();
                userGroup.members.push(theUser._id);

                yield userGroup.save();

                res.send({
                    status : 'success'
                });
            }
            else{
                return res.send({
                    status : 'error',
                    errors : [{
                        msg : 'Registration code invalid.'
                    }]
                });
            }
        }
        catch(e){
            res.send({
                status : 'error',
                errors : [{
                    msg : e.message
                }]
            })
        }
    }

    return coify({
        add,
        find,
        findAdmins
    });

}
