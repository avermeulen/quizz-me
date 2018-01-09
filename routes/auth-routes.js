const superagent = require('superagent');
const logger = require('winston');

module.exports = function(models){

    logger.info("CLIENT_ID : " + process.env.CLIENT_ID);
    logger.info("CLIENT_SECRET : " + process.env.CLIENT_SECRET);

    const CLIENT_ID = process.env.CLIENT_ID || 'd48293f543a760af1132';
    const CLIENT_SECRET = process.env.CLIENT_SECRET || "fa2a4abd4214dfce6f0ec2fb4334cf52a6ae2232";
    const User = models.User;

    logger.info("CLIENT_ID : " + CLIENT_ID);
    logger.info("CLIENT_SECRET : " + CLIENT_SECRET);

    var redirectToGithub =  function(req, res){
        res.redirect("https://github.com/login/oauth/authorize?scope=user:email&client_id=" + CLIENT_ID);
    };

    var logout = function (req, res, next) {
        delete req.session;
        res.redirect('/login');
    }

    var callback = function(req, res, next){
        superagent
          .post('https://github.com/login/oauth/access_token')
          .send({
                  client_id : CLIENT_ID,
                  client_secret : CLIENT_SECRET,
                  code : req.query.code
          })
          .set('Accept', 'application/json')
          .end(function(err, response){
            // Calling the end function will send the request
            if (err){
                logger.error(err.stack);
                logger.error(err);
                return res.send(err);
            }

            superagent
                .get('https://api.github.com/user?access_token=' + response.body.access_token)
                .end(function(err, response){

                    logger.info("sent token!");

                    if (err){
                        logger.error(err);
                        return next(err);
                    }

                    var username = response.body.login,
                        fullName = response.body.name;
                        logger.debug('checking for user')
                    User
                        .findOne({githubUsername : username})
                        .then((user) => {
                            logger.debug('user')
                            logger.debug(user)
                            if (user){

                                if(user.active === false){
                                    return res.redirect('/user/inactive')
                                }

                                req.session.username = username;
                                req.session.role = user.role;
                                req.session.active = user.active;
                                req.session.isAdmin = user.role === "admin";

                                res.redirect('/profile');
                            }
                            else {
                                req.flash('new_username', username);
                                req.flash('fullName', fullName);
                                res.redirect('/user/new/register');
                            }
                        });
                });
          });
    };

    return {
        redirectToGithub : redirectToGithub,
        callback : callback,
        logout : logout
    }
};
