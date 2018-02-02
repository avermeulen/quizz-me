const AllocateQuiz = require('../utilities/allocate-quiz'),
    EmailQuizNotification = require("../utilities/email-quiz-notification"),
    mongooseConnect = require('./mongoose-connect'),
    models = require('../models'),
    courseData = require('./course-data.json'),
    assert = require('assert');

require('co-mocha')

describe('AllocateQuiz', () => {
    mongooseConnect();

    var quiz_id,
        user_id;

    beforeEach(function*(){

        var removeAll = [models.Course.remove({}),
            models.Email.remove({}),
            models.Questionairre.remove({})];

        yield removeAll;

        var course = models.Course(courseData);
        var result = yield course.save();
        quiz_id = result._id;

        var user = models.User({
            "firstName" : "Andre",
            "lastName" : "Vermeulen",
            "email" : "andre@projectcodex.co",
            "githubUsername" : "avermeulen",
            "role" : "candidate",
            "active" : false,
            "__v" : 0
        });

        yield user.save();
        user_id = user._id;
    });

    it('should allocate a quiz', async function() {

        const allocateQuiz = AllocateQuiz(models);

        const emailQuizNotification = EmailQuizNotification(models);
        await allocateQuiz(quiz_id, user_id, 2);
        const quiz = await models.Questionairre.findOne({_user : user_id});

        assert.equal(5, quiz.details.questions.length);
        await emailQuizNotification(user_id, quiz._id);

        var emails = await models.Email.find({})
        assert.equal(emails.length, 1);

    });

});
