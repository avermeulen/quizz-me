var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    firstName : String,
    lastName : String,
    githubUsername : String,
    email : String
});

var optionSchema = new Schema({
    answerOption : String,
    isAnswer : Boolean
});

var questionSchema = new Schema({
    question : String,
    options : [optionSchema]
});

var courseSchema = new Schema({
    name : String,
    description : String,
    questions : [questionSchema]
});

var answerSchema = new Schema({
        _awnser : Schema.Types.ObjectId,
        correct : Boolean,
        answeredAt : {type : Date, default : Date.now()}
});

var questionairreSchema = new Schema({
    _user : { type: Schema.Types.ObjectId, ref: 'User' },
    status : String,
    details : courseSchema,
    answers : [answerSchema]
});

module.exports = {
    courseSchema : courseSchema,
    questionairreSchema : questionairreSchema,
    userSchema : userSchema
};
