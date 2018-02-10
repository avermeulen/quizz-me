const assert = require('assert');
const Quizzes = require('../api/quizzes');
const models = require('../models');
const mongooseConnect = require('./mongoose-connect');
const AllocateQuizToCoder = require("../utilities/allocate-quiz-to-coder");

describe("quizzes api", function () {

  mongooseConnect();
  let Course = models.Course;
  let User = models.User;
  let Quiz = models.Questionairre;

  let allocateQuizToCoder = AllocateQuizToCoder(models);

  let testCourse = null;
  let testUser = null;
  let testQuiz = null;

  const TEST_QUIZ_CONTEXT = "Test Quiz Context 123";

  beforeEach(async function () {

    await Course.remove();
    await User.remove();
    await Quiz.remove();

    testUser = await User.create({
      firstName: "Jo",
      lastName: "Black",
      githubUsername: "jo.black",
      email: "jo@email.com",
      role: "candidate",
      active: true
    });

    await Course.create({
      name: "Test course",
      description: "This is all about the course",
      questions: [{
        question: "What color is the sky?",
        questionType: "freetext"
      }, {
        question: "What color are the mountains?",
        questionType: "freetext"
      },
      {
        question: "What color are trees in winter?",
        questionType: "freetext"
      }
      ]
    });

    await Course.create({
      name: "Test course two",
      description: "This is another course",
      questions: [{
        question: "What color is the sky on Mondays?",
        questionType: "freetext"
      }, {
        question: "What color are the mountains when you sleep?",
        questionType: "freetext"
      },
      {
        question: "What color are trees in summer?",
        questionType: "freetext"
      }
      ]
    });

    testCourse = await Course.findOne({ name: "Test course two" });

    testQuiz = await allocateQuizToCoder({
      courseId : testCourse._id, 
      username : testUser.githubUsername,
      context : TEST_QUIZ_CONTEXT
    });

  });


  it("should be able to find all the courses", function (done) {

    let quizzes = Quizzes(models);
    var res = {
      json: function (result) {
        try {
          assert.equal(2, result.data.length);
          done();
        }
        catch (err) {
          done(err);
        }
      }
    };

    quizzes.allAvailable({}, res);

  });

  it("should be able to find a specific the courses", function (done) {

    let quizzes = Quizzes(models);

    var res = {
      json: function (result) {
        try {
          let course = result.data;
          assert.equal(3, course.questions.length);
          assert.equal("Test course two", course.name);
          assert.equal("This is another course", course.description);
          done();
        }
        catch (err) {
          done(err);
        }
      }
    };

    quizzes.details({ params: { id: testCourse._id.toString() } }, res);

  });

  it("should be able to allocate a quiz", function (done) {

    let quizzes = Quizzes(models);

    var res = {
      json: async function (result) {
        try {

          let allocatedQuiz = await Quiz.findOne({
            _user : testUser._id,
            context : "Test Context"
          });

          assert.equal("Test Context", allocatedQuiz.context);
          assert.equal("active", allocatedQuiz.status);

          done();
        }
        catch (err) {
          done(err);
        }
      }
    };

    try {

      var req = {
        body: {
          username : "jo.black",
          courseId : testCourse._id,
          context : "Test Context" 
        }
      };

      quizzes.allocate(req, res);

    }
    catch (err) {
      done(err);
    }

  });

  it("should not allocate a quiz this is already allocated", function (done) {

    let quizzes = Quizzes(models);

    var res = {
      json: async function (result) {
        try {

          let allocatedQuizzes = await Quiz.find({
            _user : testUser._id,
            context : TEST_QUIZ_CONTEXT
          });

          assert.equal(1, allocatedQuizzes.length);

          done();
        }
        catch (err) {
          done(err);
        }
      }
    };

    try {

      var req = {
        body: {
          username : "jo.black",
          courseId : testCourse._id,
          context : TEST_QUIZ_CONTEXT 
        }
      };

      quizzes.allocate(req, res);

    }
    catch (err) {
      done(err);
    }

  });

  it("should be able to answer a quiz", function (done) {

    let quizzes = Quizzes(models);

    var res = {
      json: async function (result) {
        try {
          let course = result.data;
          let answeredQuiz = await Quiz.findById(testQuiz._id);

          assert.equal(3, answeredQuiz.answers.length);

          assert.equal("One", answeredQuiz.answers[0].answerText);
          assert.equal("Two", answeredQuiz.answers[1].answerText);
          assert.equal("Three", answeredQuiz.answers[2].answerText);
          assert.equal("completed", answeredQuiz.status)

          done();
        }
        catch (err) {
          done(err);
        }
      }
    };

    try {

      var testQuizData = {
        _id : testQuiz._id,
        name : testQuiz.details.name,
        description : testQuiz.details.description,
        questions : testQuiz.details.questions,
        answers : testQuiz.answers
      };

      testQuizData.questions[0].answer = "One";
      testQuizData.questions[1].answer = "Two";
      testQuizData.questions[2].answer = "Three";

      var req = {
        body: {
          username: "jo.black",
          quiz: testQuizData
        }
      };

      quizzes.answer(req, res);

    }
    catch (err) {
      done(err);
    }

  });

});
