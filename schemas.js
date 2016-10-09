var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    firstName : String,
    lastName : String,
    githubUsername : String,
    email : String,
    role : String,
    active : {type : Boolean, default: false}
});

userSchema.virtual('admin').get(function(){
    return this.role === 'admin';
});

userSchema.virtual('candidate').get(function(){
    return this.role === 'candidate';
});

var optionSchema = new Schema({
    answerOption : String,
    isAnswer : Boolean
});

var questionSchema = new Schema({
    question : String,
    questionType : String,
    options : [optionSchema]
});

questionSchema.virtual('mcq').get(function(){
    return this.questionType === 'mcq';
});

questionSchema.virtual('freetext').get(function(){
    return this.questionType === 'freetext';
});

var courseSchema = new Schema({
    name : String,
    description : String,
    questions : [questionSchema]
});

var userGroupSchema = new Schema({
    name : String,
    description : String,
    members : [Schema.Types.ObjectId],
    quizzes : [{ type: Schema.Types.ObjectId, ref: 'Questionairre' }]
});

var answerSchema = new Schema({
    _answer : Schema.Types.ObjectId,
    _question : Schema.Types.ObjectId,
    questionType : String,
    answerText : String,
    correct : Boolean,
    answeredAt : {type : Date, default : Date.now()}
});

var emailSchema = new Schema({
    _toUser : Schema.Types.ObjectId,
    emailType : String,
    to : String,
    from : String,
    subject : String,
    text : String,
    status : String
});

var quizSchema = new Schema({
    _user : { type: Schema.Types.ObjectId, ref: 'User' },
    _course : { type: Schema.Types.ObjectId, ref: 'Course' },
    status : {type: String, default : 'active'},
    score : Number,
    details : courseSchema,
    answers : [answerSchema],
    createdAt : {type : Date, default : Date.now()},
    completedAt : {type : Date}

});

module.exports = {
    courseSchema,
    quizSchema,
    userSchema,
    userGroupSchema,
    emailSchema
};
