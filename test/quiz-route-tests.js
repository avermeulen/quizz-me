
const assert = require('assert'),
    quizAnswerData = require('./data/quiz-answer-data'),
    courseData = require('./data/course-instance'),
    userData = require('./data/user.json'),
    quizLastAnswerData = require('./data/quiz-result-answer-last-question'),
    Promise = require('bluebird'),
    co = require('co'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    EmailQueue = require('../utilities/email-queue'),
    models = require('../models'),
    mongooseConnect = require('./mongoose-connect'),
    QuizRoutes = require('../routes/quiz-routes');

require('co-mocha');

var requestCreator = function(params){
    return {
        path : "",
        params : {
            quiz_id : params.quiz_id,
            question_nr : params.question_nr,
            course_id : params.course_id
        },
        body : {
            answer_id : params.answer_id,
            questionType : params.questionType,
            candidateId : params.candidateId
        },
        checkBody : function(){
            return {
                notEmpty : function(){
                }
            }
        }
    };
}

describe('Quiz routes', function(){
    mongooseConnect();

    const QUIZ_ID = '57c6da441fb2c0ac907f6746';

    describe('answer one question ', function(){

        beforeEach(function*(){
                yield models.Questionairre.remove({});
                yield models.User.remove({});

                var quiz = new models
                    .Questionairre(quizAnswerData);

                var theUser = new models.User(userData);

                yield [theUser.save(), quiz.save()];


        });

        it("should show question", function(done){
            var quizRoute = new QuizRoutes(models);

            var res = {
                render : function(view, context){

                    try{
                        var expectedContext = {
                            name: 'Number game',
                            quiz_id: '57c6da441fb2c0ac907f6746',
                            progress_message: 'Question 1 of 3',
                            questionType: 'mcq'
                        }

                        assert.equal(context.quiz_id, expectedContext.quiz_id);
                        assert.equal(context.questionType, expectedContext.questionType);
                        assert.equal(context.name, expectedContext.name);
                        assert.equal(context.progress_message,
                                expectedContext.progress_message);

                        done();
                    }
                    catch(err){
                        done(err);
                    }
                }
            };

            var req = requestCreator({
                quiz_id : QUIZ_ID,
                questionType : 'mcq',
                question_nr : 0,
                answer_id : '57c6da441fb2c0ac907f6753'
            });

            quizRoute.showQuizQuestion(req, res, function(err){
                 done(err);
            });
        });

        it("should support answering a question", function(done){
            var quizRoute = new QuizRoutes(models);

            var res = {
                redirect : function(to){
                    assert.equal(to, '/quiz/57c6da441fb2c0ac907f6746/answer/1');

                    models.Questionairre
                        .findById(QUIZ_ID).then((quiz) => {
                            assert.equal(quiz.answers.length, 1);
                            assert.equal(quiz.answers[0]._answer,
                                    '57c6da441fb2c0ac907f6753');

                            done();
                        });
                }
            };

            var req = requestCreator({
                quiz_id : QUIZ_ID,
                questionType : 'mcq',
                question_nr : 0,
                answer_id : '57c6da441fb2c0ac907f6753'
            });

            quizRoute.answerQuizQuestion(req, res, function(err){
                done(err);
            });
        });

        it("should cancel quiz", function(done){
            var quizRoute = new QuizRoutes(models);

            var res = {
                redirect : function(to){
                    assert.equal(to, '/user/avermeulen');

                    models.Questionairre
                        .findById(QUIZ_ID)
                        .then((quiz) => {
                            assert.equal(quiz.status, 'cancelled');
                            done();
                        });

                }
            };

            var req = requestCreator({
                quiz_id : QUIZ_ID
            });

            quizRoute.cancel(req, res, function(err){
                done(err);
            });
        });

    });

    describe('answering next question', function(){

        before(function*(){
                yield models.Questionairre.remove({});
                var quiz = new models
                    .Questionairre(quizLastAnswerData);
                yield quiz.save();
        });

        it("should succeed", function(done){
            var quizRoute = new QuizRoutes(models);

            var res = {
                redirect : function(to){
                    assert.equal(to, '/quiz/57c6da441fb2c0ac907f6746/answer/2');

                    models.Questionairre
                        .findById(QUIZ_ID).then((quiz) => {
                            assert.equal(quiz.answers.length, 2);
                            done();
                        });
                }
            };

            var req = requestCreator({
                quiz_id : QUIZ_ID
            });

            quizRoute.answerQuiz(req, res, function(err){
                done(err);
            });
        });
    });

    describe('answering last question', function(){

        before(function*(){
                yield models.Questionairre.remove({});
                var quiz = new models
                    .Questionairre(quizLastAnswerData);
                yield quiz.save();
        });

        it("should succeed", function(done){
            var quizRoute = new QuizRoutes(models);

            var res = {
                redirect : function(to){
                    assert.equal(to, '/quiz/57c6da441fb2c0ac907f6746/completed');

                    models.Questionairre
                        .findById(QUIZ_ID).then((quiz) => {
                            assert.equal(quiz.answers.length, 3);
                            assert.equal(quiz.answers[2]._answer, '57c6da441fb2c0ac907f6749');
                            assert.equal(quiz.status, 'completed');
                            assert.equal(quiz.score, 67);
                            assert.deepEqual(quiz.answers.map((a) => a.correct), [false, true, true]);
                            done();
                        });
                }
            };

            var req = requestCreator({
                quiz_id : QUIZ_ID,
                questionType : 'mcq',
                question_nr : 2,
                answer_id : '57c6da441fb2c0ac907f6749'
            });

            quizRoute.answerQuizQuestion(req, res, function(err){
                done(err);
            });
        });
    });

    describe('allocating a quiz', function(){

        before(function*(){

            yield models.User.remove({});
            yield models.Course.remove({});
            yield models.Questionairre.remove({});

            var user = new models.User(userData);
            yield user.save();

            var course = new models.Course(courseData);
            yield course.save();

        });

        it("should succeed", function(done){
            var quizRoute = new QuizRoutes(models);

            var res = {
                render : function(view){
                    assert.equal('quiz_allocated', view);

                    models.Questionairre
                        .find({_user : ObjectId('57a67ec7b5e3444d5ddffc6b')})
                        .then((quizzes) => {
                            assert.equal(quizzes.length, 1);
                            assert.equal(quizzes[0].details.questions.length, 5);
                            done();
                        });
                }
            };

            var req = requestCreator({
                course_id : '57a662337182d85f3ecef87c',
                candidateId : '57a67ec7b5e3444d5ddffc6b'
            });

            req.validationErrors = function(){

            };

            quizRoute.allocateQuizToUsers(req, res, function(err){
                done(err);
            });
        });
    });

});
