const mongoose = require('mongoose'),
    _ = require('lodash'),
    co = require('co'),
    ObjectId = mongoose.Types.ObjectId;

module.exports = function(models){

    var Course = models.Course,
        Quiz = models.Questionairre,
        User = models.User;

    const isObjectId = (id) => id instanceof ObjectId ? id : Object(id);

    const selectAndShuffleQuestions = (course, question_count) => {
        var questions = _.sampleSize(course.questions, question_count);
        var shuffleOptions = (question) => question.options = _.shuffle(question.options);
        questions.forEach(shuffleOptions);
        return questions
    };

    function allocateQuiz(course_id, user_id, question_count){

        var course_id = isObjectId(course_id),
            user_id = isObjectId(user_id),
            question_count = question_count || 3;

        return co(function*(){

            var activeQuizForUser = yield Quiz.find({
                    _course: course_id,
                    _user: user_id,
                    status : 'active'
                });

            if (activeQuizForUser.length === 0){
                const course = yield Course.findById(course_id,
                        '-_id -questions._id -questions.options._id -__v');

                course.questions = selectAndShuffleQuestions(course, question_count);

                var quiz = Quiz({
                    _user: user_id,
                    _course : course_id,
                    details: course
                });

                return yield quiz.save();
            }
            else {
                return {user_id, course_id, status : 'already allocated'};
            }
        });
    };

    return allocateQuiz;
}
