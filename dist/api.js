var mongoose = require('mongoose'), UserAPI = require('./api/users');
UserGroupAPI = require('./api/usergroups');
ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    reportErrors = require('./utilities/http_utilities').reportErrors;
module.exports = function (app, models) {
    const userGroupAPI = new UserGroupAPI(models);
    const userAPI = new UserAPI(models);
    app.get('/api/users/:username', userAPI.find);
    app.post('/api/users/:username', userAPI.add);
    app.get('/api/usergroups', userGroupAPI.list);
    app.get('/api/usergroups/:group_id/members', userGroupAPI.members);
};
//# sourceMappingURL=api.js.map