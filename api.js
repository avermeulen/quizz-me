var mongoose = require('mongoose'),

    UserGroupAPI = require('./api/usergroups')

    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    reportErrors = require('./utilities/http_utilities').reportErrors;

module.exports = function(app, models) {

    const userGroupAPI = new UserGroupAPI(models);

    app.get('/api/usergroups', userGroupAPI.list);
    app.get('/api/usergroups/:group_id/members', userGroupAPI.members);


};
