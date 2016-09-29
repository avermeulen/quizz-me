var mongoose = require('mongoose'),
    UserRoutes = require('./routes/user-routes'),
    QuizRoutes = require('./routes/quiz-routes'),
    AuthRoutes = require('./routes/auth-routes'),
    CourseRoutes = require('./routes/course-routes'),
    GroupRoutes = require('./routes/group-routes'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    reportErrors = require('./utilities/http_utilities').reportErrors;

module.exports = function(app, models) {

    var courseRoutes = CourseRoutes(models)

    app.get('/courses', courseRoutes.allCourses);
    app.get('/course/add', courseRoutes.showAddCourse);
    app.post('/course/add', courseRoutes.addCourse);
    app.get('/course/:course_id', courseRoutes.showCourse);
    app.get('/course/:course_id/question/add', courseRoutes.showAddQuestion);
    app.post('/course/:course_id/question/add', courseRoutes.addQuestion);
    app.get('/course/:course_id/question/:question_id', courseRoutes.showQuestion);

    app.get('/course/:course_id/question/:question_id/delete', courseRoutes.deleteQuestion);

    app.get('/course/:course_id/question/:question_id/option/add', function(req, res, next) {
        res.render('option', req.params);
    });

    app.post('/course/:course_id/question/:question_id/option/:option_id/delete', courseRoutes.deleteCourseQuestionOption);


    app.post('/course/:course_id/question/:question_id/option/add', courseRoutes.addQuestionOption);
    //app.get('/course/:course_id/select/:select_count', courseRoutes.allocate);

    var userRoutes = UserRoutes(models);

    app.get('/users', userRoutes.listUsers);
    app.get('/user/add', userRoutes.addScreen);
    app.post('/user/add', userRoutes.add);
    app.get('/user/unknown', userRoutes.unknownUser);
    app.get('/user/inactive', userRoutes.inactiveUser);
    app.get('/user/:username', userRoutes.profile);
    app.get('/user/edit/:username', userRoutes.show);
    app.post('/user/update/:username', userRoutes.update);
    app.get('/user/register', userRoutes.registerUserScreen);
    //app.get('/user/register', userRoutes.registerUser);
    app.post('/user/register', userRoutes.registerUser);

    var quizRoutes = QuizRoutes(models);
    app.get('/quiz/:quiz_id', quizRoutes.showQuiz);
    app.get('/quiz/:quiz_id/cancel', quizRoutes.cancel);
    app.get('/quiz/:quiz_id/results', quizRoutes.quizResults);
    app.get('/quiz/:quiz_id/answer/:question_nr', quizRoutes.showQuizQuestion);
    app.post('/quiz/:quiz_id/answer/:question_nr', quizRoutes.answerQuizQuestion);
    app.get('/quiz/:quiz_id/completed', quizRoutes.completed);
    app.get('/profile', quizRoutes.profile);
    app.get('/quiz/allocate/:course_id', quizRoutes.showQuizzAllocationScreen);
    app.post('/quiz/allocate/:course_id', quizRoutes.allocateQuizToUsers);

    var authRoutes = AuthRoutes(models);

    app.get('/login', authRoutes.redirectToGithub);
    app.get('/logout', authRoutes.logout);
    app.get('/callback', authRoutes.callback);


    app.get('/', function(req, res) {

        var username = req.session.user;
        res.redirect('/profile')

    });

    var groupRoutes = new GroupRoutes(models);

    app.get('/groups', groupRoutes.listGroups);
    app.get('/groups/edit/:group_id', groupRoutes.showUserGroup);
    app.get('/groups/add', groupRoutes.showAddScreen);
    app.post('/groups/add', groupRoutes.addGroup);
    app.get('/groups/allocate/:group_id', groupRoutes.allocateQuizScreen);
    app.post('/groups/allocate/:group_id', groupRoutes.allocateQuizAction);

};
