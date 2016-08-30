var mongoose = require('mongoose'),
    UserRoutes = require('./routes/user-routes'),
    QuizRoutes = require('./routes/quiz-routes'),
    AuthRoutes = require('./routes/auth-routes'),
    CourseRoutes = require('./routes/course-routes'),
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

    app.post('/course/:course_id/question/:question_id/option/add', courseRoutes.addQuestionOption);
    //app.get('/course/:course_id/select/:select_count', courseRoutes.allocate);

    var userRoutes = UserRoutes(models);

    app.get('/users', userRoutes.listUsers);
    app.get('/user/add', userRoutes.addScreen);
    app.post('/user/add', userRoutes.add);
    app.get('/user/unknown', userRoutes.unknownUser);
    app.get('/user/edit/:username', userRoutes.show);
    app.post('/user/update/:username', userRoutes.update);

    var quizRoutes = QuizRoutes(models);
    app.get('/quiz/:quiz_id', quizRoutes.showQuiz);
    app.get('/quiz/:quiz_id/answer/:question_nr', quizRoutes.showQuizQuestion);
    app.post('/quiz/:quiz_id/answer/:question_nr', quizRoutes.answerQuizQuestion);
    app.get('/quiz/:quiz_id/completed', quizRoutes.completed);
    app.get('/quiz/profile/:user_name', quizRoutes.overview);
    app.get('/quiz/allocate/:course_id', quizRoutes.showQuizzAllocationScreen);
    app.post('/quiz/allocate/:course_id', quizRoutes.allocateQuizToUsers);

    //app.get('/quiz/:quiz_id/results', quizRoutes.showQuizResults);

    var authRoutes = AuthRoutes(models);

    app.get('/login', authRoutes.redirectToGithub);
    app.get('/logout', authRoutes.logout);
    app.get('/callback', authRoutes.callback);

    app.get('/', function(req, res) {
        res.render('index');
    });

};
