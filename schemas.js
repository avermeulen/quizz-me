var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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

module.exports = {
    courseSchema : courseSchema
}
