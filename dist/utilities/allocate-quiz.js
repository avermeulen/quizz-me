const mongoose = require('mongoose'), _ = require('lodash'), co = require('co'), ObjectId = mongoose.Types.ObjectId, EnqueueEmail = require('../utilities/email-queue');
module.exports = function (models) {
    var Course = models.Course, Quiz = models.Questionairre, User = models.User;
    const enqueueEmail = EnqueueEmail(models);
    const isObjectId = (id) => id instanceof ObjectId ? id : Object(id);
    const selectAndShuffleQuestions = (course, question_count) => {
        const mcqQuestions = _.filter(course.questions, (question) => question.questionType === 'mcq');
        const freetextQuestions = _.filter(course.questions, (question) => question.questionType === 'freetext');
        const questions = _.sampleSize(mcqQuestions, question_count);
        const shuffleOptions = (question) => question.options = _.shuffle(question.options);
        questions.forEach(shuffleOptions);
        return questions.concat(freetextQuestions);
    };
    function allocateQuiz(course_id, user_id, question_count) {
        var course_id = isObjectId(course_id), user_id = isObjectId(user_id), question_count = question_count || 3;
        return co(function* () {
            var activeQuizForUser = yield Quiz.find({
                _course: course_id,
                _user: user_id,
                status: 'active'
            });
            if (activeQuizForUser.length === 0) {
                const course = yield Course.findById(course_id, '-_id -questions._id -questions.options._id -__v');
                if (course.questions) {
                    question_count = course.questions.length;
                    if (course.questions && course.questions.length > 5) {
                        question_count = Math.ceil(course.questions.length / 2) + 1;
                    }
                }
                course.questions = selectAndShuffleQuestions(course, question_count);
                var quiz = Quiz({
                    _user: user_id,
                    _course: course_id,
                    details: course
                });
                yield quiz.save();
                var user = yield User.findById(user_id);
                yield enqueueEmail({
                    emailType: 'quiz_sent',
                    subject: 'You got a new quiz',
                    username: user.githubUsername,
                    quiz_id: quiz._id
                });
                return quiz;
            }
            else {
                return { user_id, course_id, status: 'already allocated' };
            }
        });
    }
    ;
    return allocateQuiz;
};
