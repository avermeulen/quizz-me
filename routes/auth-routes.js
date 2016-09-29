const superagent = require('superagent');

module.exports = function(models){

    const CLIENT_ID = process.env.CLIENT_ID || 'd48293f543a760af1132';
    const CLIENT_SECRET = process.env.CLIENT_SECRET || "fa2a4abd4214dfce6f0ec2fb4334cf52a6ae2232";
    const User = models.User;

    var redirectToGithub =  function(req, res){
        res.redirect("https://github.com/login/oauth/authorize?scope=user:email&client_id=" + CLIENT_ID);
    };

    var logout = function (req, res, next) {
        delete res.session;
        res.redirect('/login');
    }

    var callback = function(req, res){
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
                return res.send(err);
            }

            superagent
                .get('https://api.github.com/user?access_token=' + response.body.access_token)
                .end(function(err, response){
                    var username = response.body.login,
                        fullName = response.body.name;

                    User
                        .findOne({githubUsername : username})
                        .then((user) => {
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
                                res.redirect('/user/register');
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
