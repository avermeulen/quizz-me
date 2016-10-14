
const assert = require('assert'),
    quizAnswerData = require('./quiz-answer-data'),
    Promise = require('bluebird'),
    co = require('co'),
    mongoose = require('mongoose'),
    EmailQueue = require('../utilities/email-queue'),
    models = models = require('../models'),
    mongooseConnect = require('./mongoose-connect'),
    QuizRoutes = require('../routes/quiz-routes');

require('co-mocha');

describe('Quiz routes', function(){
    mongooseConnect();

    const QUIZ_ID = '57c6da441fb2c0ac907f6746';

    beforeEach(function*(){
            yield models.Questionairre.remove({});

            //var quizzes = yield models.Questionairre.find({});
            //console.log(quizzes);


            var quiz = new models
                .Questionairre(quizAnswerData);
            yield quiz.save();


    });

    it("should support answering a question", function(done){
        var quizRoute = new QuizRoutes(models);

        var res = {
            redirect : function(to){
                assert.equal(to, '/quiz/57c6da441fb2c0ac907f6746/answer/1');

                models.Questionairre
                    .findById(QUIZ_ID).then((quiz) => {
                        assert.equal(quiz.answers.length, 1);
                        done();
                    });
            }
        };

        var req = {
            params : {
                quiz_id : QUIZ_ID,
                question_nr : 0
            },
            body : {

            },
            checkBody : function(){
                return {
                    notEmpty : function(){

                    }
                }
            }
        };

        quizRoute.answerQuizQuestion(req, res, function(err){
            done(err);
        });

    });

});
