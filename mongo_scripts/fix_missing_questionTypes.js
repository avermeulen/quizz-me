const mongoose = require('mongoose');
const mongoDatabaseUrl = process.env.MONGODB_URL || 'mongodb://localhost/quizz_me';
const models = require('../models');
const co = require('co');
mongoose.Promise = Promise;

const options = {
    server: {
        socketOptions: {
            keepAlive: 1
        }
    }
};
mongoose.connect(mongoDatabaseUrl, options).connection;

co(function*(){

    var courses = yield models.Course.find({});
    var updateList = [];
    courses.forEach((course) => {
        course.questions.forEach((question) => {
            if (!question.questionType){
                //defaults to mcq
                question.questionType = "mcq";
                updateList.push(course.save());
            }
            else{
                //console.log(question);
            }
        });
    });

    yield updateList;

    var updateQuizzes = []
    var quizzes = yield models.Questionairre.find({});
    quizzes.forEach(function(quiz){
        var questions = quiz.details.questions;
        questions.forEach((question) => {
            if (!question.questionType){
                //defaults to mcq
                question.questionType = "mcq";
                updateQuizzes.push(quiz.save());
            }
            else{
                
            }
        });

    });

    yield updateQuizzes;

    mongoose.connection.close()

});
