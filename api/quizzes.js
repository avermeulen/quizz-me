
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const AllocateQuizToCoder = require("../utilities/allocate-quiz-to-coder");

module.exports = function (models) {
    const Quiz = models.Questionairre;
    const User = models.User;
    const Course = models.Course;
    const allocateQuizToCoder = AllocateQuizToCoder(models);

    async function allAvailable(req, res, next) {
        let courses = await Course
            .find({}, { questions: 0 })
            .sort({ name: "desc" });

        res.json({
            status: "success",
            data: courses
        });
    }

    async function details(req, res, next) {

        try {
            let course = await Course.findOne({ _id: ObjectId(req.params.id) });
            res.json({
                status: "success",
                data: course
            });
        }
        catch (err) {
            res.json({
                status: "error",
                error: err.stack
            });
        }
    }

    async function allocate(req, res, next) {
        try {

            let username = req.body.username;
            let courseId = req.body.courseId;
            let context = req.body.context;

            let quiz = await allocateQuizToCoder({
                courseId, username, context
            });

            res.json({
                status: "success",
                data: {
                    _id : quiz._id,
                    name : quiz.details.name,
                    description : quiz.details.description,
                    status : quiz.status,
                    questions : quiz.details.questions
                }
            });
        }
        catch (err) {
            res.json({
                status: "error",
                error: err.stack
            })
        }
    }

    async function answer(req, res, next) {
        try {

            let username = req.body.username;
            let quizData = req.body.quiz;

            let quiz = await Quiz.findById(quizData._id);

            quiz.answers = quizData.questions.map(function(question){
                return {
                    _question : question._id,
                    questionType : question.questionType,
                    answerText : question.answer
                }
            });

            quiz.status = "completed";

            await quiz.save();

            res.json({
                status: "success",
                data: {
                    _id : quiz._id,
                    name : quiz.details.name,
                    description : quiz.details.description,
                    questions : quiz.details.questions,
                    answers : quiz.answers
                }
            });
        }
        catch (err) {
            res.json({
                status: "error",
                error: err.stack
            })
        }
    }

    return {
        answer,
        allocate,
        allAvailable,
        details
    }

}
