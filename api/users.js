const coify = require('../utilities/coify');
const co_func = require('co-functional');
const validator = require('validator');

module.exports = function(models){

    const User = models.User;

    const find = function * (req, res){
        const username = req.params.username;
        const user = yield User.findOne({githubUsername : username});
        //const user = users.length === 1 ? users[0]
        res.send(user);
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
                });

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

            try{
                yield User(data).save()
                res.send({
                    status : 'success'
                });
            }
            catch(e){
                res.send({
                    status : 'error',
                    errors : [{
                        msg : e.message
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
        find
    });

}
