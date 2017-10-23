const mongoose = require('mongoose'),
    UserGroupAPI = require('./api/usergroups-v2'),
    UserAPIv2 = require('./api/users-v2'),
    QuizService = require("./services/quiz-service"),
    QuizAPI = require("./api/quiz-api"),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    reportErrors = require('./utilities/http_utilities').reportErrors;

module.exports = function(app, models) {

    const userGroupAPI = new UserGroupAPI(models);
    const userAPIv2 = new UserAPIv2(models);
    const quizService = new QuizService(models);
    const quizAPI = new QuizAPI(quizService);

    app.get("/api/v2/usergroups", userGroupAPI.list);
    app.post("/api/v2/users/:_id/toggle_status", userAPIv2.toggleStatus);

    app.get("/api/v2/quiz/:quiz_id", quizAPI.getQuiz);
    app.post("/api/v2/quiz/:quiz_id/answer/:question_id", quizAPI.answerQuiz);

};
