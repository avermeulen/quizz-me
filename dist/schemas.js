"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const mongoose_1 = require("mongoose");
//let Schema = mongoose.Schema;
var hunch = new mongoose_1.Schema({
    description: String,
    _mentor: { type: mongoose_1.Schema.Types.ObjectId, ref: userSchema },
    createdAt: { type: Date, default: Date.now() },
    rating: Number
});
var userSchema = new mongoose_1.Schema({
    firstName: String,
    lastName: String,
    githubUsername: String,
    email: String,
    role: String,
    hunches: [hunch],
    active: { type: Boolean, default: false }
});
exports.userSchema = userSchema;
userSchema.virtual('admin').get(function () {
    return this.role === 'admin';
});
userSchema.virtual('candidate').get(function () {
    return this.role === 'candidate';
});
var optionSchema = new mongoose_1.Schema({
    answerOption: String,
    isAnswer: Boolean
});
var questionSchema = new mongoose_1.Schema({
    question: String,
    questionType: String,
    options: [optionSchema]
});
questionSchema.virtual('mcq').get(function () {
    return this.questionType === 'mcq';
});
questionSchema.virtual('freetext').get(function () {
    return this.questionType === 'freetext';
});
var courseSchema = new mongoose.Schema({
    name: String,
    description: String,
    questions: [questionSchema]
});
exports.courseSchema = courseSchema;
var userGroupSchema = new mongoose.Schema({
    name: String,
    description: String,
    registrationCode: String,
    activeForRegistration: Boolean,
    members: [mongoose_1.Schema.Types.ObjectId],
    quizzes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Questionairre' }]
});
exports.userGroupSchema = userGroupSchema;
var answerSchema = new mongoose_1.Schema({
    _answer: mongoose_1.Schema.Types.ObjectId,
    _question: mongoose_1.Schema.Types.ObjectId,
    questionType: String,
    answerText: String,
    correct: Boolean,
    answeredAt: { type: Date, default: Date.now() }
});
var emailSchema = new mongoose_1.Schema({
    _toUser: mongoose_1.Schema.Types.ObjectId,
    emailType: String,
    to: String,
    from: String,
    subject: String,
    text: String,
    status: String
});
exports.emailSchema = emailSchema;
var quizSchema = new mongoose_1.Schema({
    _user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    _course: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course' },
    status: { type: String, default: 'active' },
    nextQuestionNumber: { type: Number, default: 0 },
    score: Number,
    details: courseSchema,
    answers: [answerSchema],
    createdAt: { type: Date, default: Date.now() },
    completedAt: { type: Date }
});
exports.quizSchema = quizSchema;
//type FeedbackSessionState = 'Open' | 'Closed';
const feedbackSessionSchema = new mongoose_1.Schema({
    description: String,
    status: String,
    createdAt: { type: Date, default: Date.now() },
    completedAt: { type: Date },
    _reviewGroup: { type: mongoose_1.Schema.Types.ObjectId, ref: 'UserGroup' },
    _coderGroup: { type: mongoose_1.Schema.Types.ObjectId, ref: 'UserGroup' }
});
exports.feedbackSessionSchema = feedbackSessionSchema;
const coderFeedbackSchema = new mongoose_1.Schema({
    _feedbackSession: { type: mongoose_1.Schema.Types.ObjectId, ref: 'FeedbackSession' },
    _coder: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    feedbackList: [
        {
            _reviewer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            feedback: String,
            reviewedAt: Date
        }
    ]
});
exports.coderFeedbackSchema = coderFeedbackSchema;
//# sourceMappingURL=schemas.js.map