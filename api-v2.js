var mongoose = require('mongoose'),

    //UserAPI = require('./api/users')
    UserGroupAPI = require('./api/usergroups-v2')

    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    reportErrors = require('./utilities/http_utilities').reportErrors;

module.exports = function(app, models) {

    const userGroupAPI = new UserGroupAPI(models);
    //const userAPI = new UserAPI(models);

    //app.get('/api/users/:username', userAPI.find);
    //app.post('/api/users/:username', userAPI.add);
    //app.get('/api/admins', userAPI.findAdmins);

    app.get('/api/v2/usergroups', userGroupAPI.list);
    //app.get('/api/usergroups/:group_id/members', userGroupAPI.members);


};
