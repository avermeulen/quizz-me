co = require('co');

const decorateWithCo = (fn) =>{
    return (req, res, next) => {
        co(fn(req, res, next));
    }
};

module.exports = function(routes){
    const coRoutes = {};

    Object.keys(routes).forEach((route) => {
        const routeFunc = routes[route];
        coRoutes[route] = decorateWithCo(routeFunc)
    });

    return coRoutes;
}
