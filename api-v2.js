const mongoose = require('mongoose'),
    UserGroupAPI = require('./api/usergroups-v2'),
    UserAPIv2 = require('./api/users-v2'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    reportErrors = require('./utilities/http_utilities').reportErrors,
    Quizzes = require("./api/quizzes");

module.exports = function(app, models) {

    const userGroupAPI = new UserGroupAPI(models);
    const userAPIv2 = new UserAPIv2(models);
    const quizzes = new Quizzes(models);

    app.get('/api/v2/usergroups', userGroupAPI.list);
    app.post("/api/v2/users/:_id/toggle_status", userAPIv2.toggleStatus);

    app.get("/api/v2/quizzes", quizzes.allAvailable);
    app.get("/api/v2/quizzes/:id", quizzes.details);
    app.post("/api/v2/quizzes/allocate", quizzes.allocate);
    app.post("/api/v2/quizzes/answer", quizzes.answer);
    
};
