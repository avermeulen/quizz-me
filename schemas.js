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

var questionairreSchema = new Schema({
    _user : { type: Schema.Types.ObjectId, ref: 'User' },
    details : courseSchema
});

module.exports = {
    courseSchema : courseSchema,
    questionairreSchema : questionairreSchema,
    userSchema : userSchema
};
