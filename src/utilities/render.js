const routes = {
    'courses' : 'coursePath',
    'users' : 'userPath',
    'quiz' : 'quizPath',
    'groups' : 'groupPath'
};

const _ = require('lodash');

function selectRoute(req, params){
    _.keys(routes).forEach((route) => {
        if (req.path.indexOf(route) > 0){
            var routeName = routes[route];
            params[routeName] = true;
        }
    });
}

module.exports = function(req, res, viewName, params){

    params = params || {};
    selectRoute(req, params);

    if (req.session && req.session.username){
        params.username = req.session.username;
        params.isAdmin = req.session.isAdmin;
    }

    res.render(viewName, params);
}
