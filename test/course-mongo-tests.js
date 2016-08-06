var mongoose = require('mongoose'),
    assert = require('assert'),
    schemas = require('../schemas'),
    Promise = require('bluebird'),
    async = require('co'),
    Course = mongoose.model('Course', schemas.courseSchema);

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/quizz_me');

function addQuestion(course, question){
    course
        .questions
        .push({
            question : question
        });
};

function addCourseWithQuestions(courseDetails, questions) {
    return async(function *(){
        var course = new Course(courseDetails);
        course = yield course.save();
        questions.forEach((question) => addQuestion(course, question));
        return course.save();
    });
}

function addTestCourseWithTwoQuestions() {
    return addCourseWithQuestions({
        name: 'test course',
        description: 'a test course'
    }, ['What color are the sky?',
        'What color are the mountains?']);
};

describe('mcq mongoose config', () => {
    beforeEach((done) => {
        Course.remove({}, (err) => {
            done(err);
        });
    });

    it('should allow for adding courses', (done) => {

        async(function *(){
            try{
                var course = new Course({
                    name: 'test course',
                    description: 'a test course'
                });
                yield course.save();
                var courses = yield Course.find({
                        name: 'test course'
                    });

                assert.equal(1, courses.length);
                done();
            }
            catch(err){
                done(err);
            }
        });
    });

    it('should allow for adding course questions', (done) => {
        addTestCourseWithTwoQuestions().then(() => {
                Course.findOne({
                        name: 'test course'
                    })
                    .then(function(course) {
                        assert.equal(2, course.questions.length);
                        done();
                    })
                    .catch((err) => done(err));
            });
    });

    it('should allow for adding question options', (done) => {
        addTestCourseWithTwoQuestions().then(() => {
                Course.findOne({
                        name: 'test course'
                    })
                    .then(function(course) {
                        var questions = course.questions[0].options;
                        questions.push({answerOption : 'Blue', isAnswer : true});
                        questions.push({answerOption : 'Orange', isAnswer : false});
                        return course.save();
                    })
                    .then((course) => {
                        Course.findOne({
                                name: 'test course'
                            })
                        .then((course) => {
                            assert.equal(2, course.questions[0].options.length);
                            done();
                        });
                    })
                    .catch((err) => done(err));
            });
    });
});
