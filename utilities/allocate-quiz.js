const mongoose = require('mongoose'),
    _ = require('lodash'),
    ObjectId = mongoose.Types.ObjectId;

module.exports = function(models){

    var Course = models.Course,
        Quiz = models.Questionairre,
        User = models.User;

    function allocateQuiz(course_id, user_id, question_count){

        var course_id = course_id instanceof ObjectId ? course_id :  ObjectId(course_id),
            user_id = user_id instanceof ObjectId ? user_id : ObjectId(user_id),
            question_count = question_count || 3;

        return Quiz.find({
                _course: course_id,
                _user: user_id,
                status : 'active'
            })
            .then((quizzes) => {
                if (quizzes.length === 0) {

                    return Course.findById(course_id,
                            '-_id -questions._id -questions.options._id -__v')
                        .then((course) => {

                            var questions = _.sampleSize(course.questions, question_count);
                            var shuffleOptions = (question) => question.options = _.shuffle(question.options);
                            questions.forEach(shuffleOptions);
                            delete course.questions;
                            course.questions = questions;

                            var quiz = Quiz({
                                _user: user_id,
                                _course : course_id,
                                details: course
                            });
                            return quiz.save();
                        });
                } else {
                    return {user_id : user_id, status : 'already allocated'};
                }
            });
    };

    return allocateQuiz;
}
