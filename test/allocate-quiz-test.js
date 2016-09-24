const AllocateQuiz = require('../utilities/allocate-quiz'),
    mongooseConnect = require('./mongoose-connect'),
    models = models = require('../models'),
    courseData = require('./course-data.json'),
    assert = require('assert');

require('co-mocha')

describe('AllocateQuiz', () => {
    mongooseConnect();

    var quiz_id,
        user_id;

    beforeEach(function*(){
        yield models.Course.remove({});
        yield models.Questionairre.remove({});

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

    it('should allocate a quiz', function*() {
        
        const allocateQuiz = AllocateQuiz(models);
        yield allocateQuiz(quiz_id, user_id, 2);
        const quiz = yield models.Questionairre.findOne({
            _user : user_id});

        assert.equal(2, quiz.details.questions.length);

    });

});
