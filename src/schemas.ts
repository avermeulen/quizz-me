import * as mongoose from 'mongoose';

import {Schema} from 'mongoose';

//let Schema = mongoose.Schema;

var hunch = new Schema({
    description : String,
    _mentor : {type : Schema.Types.ObjectId, ref : userSchema},
    createdAt : { type : Date, default : Date.now() },
    rating : Number
});

var userSchema = new Schema({
    firstName : String,
    lastName : String,
    githubUsername : String,
    email : String,
    role : String,
    hunches : [hunch],
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

var courseSchema = new mongoose.Schema({
    name : String,
    description : String,
    questions : [questionSchema]
});

var userGroupSchema = new mongoose.Schema({
    name : String,
    description : String,
    registrationCode : String,
    activeForRegistration : Boolean,
    members : [Schema.Types.ObjectId],
    quizzes : [{ type: Schema.Types.ObjectId, ref: 'Questionairre' }]
});

var answerSchema = new  Schema({
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
    nextQuestionNumber : {type : Number, default : 0},
    score : Number,
    details : courseSchema,
    answers : [answerSchema],
    createdAt : {type : Date, default : Date.now()},
    completedAt : {type : Date}
});

//type FeedbackSessionState = 'Open' | 'Closed';

const feedbackSessionSchema = new Schema({
    description: String,
    status : String,
    createdAt : {type : Date, default : Date.now()},
    completedAt : {type : Date},
    _reviewGroup : { type: Schema.Types.ObjectId, ref: 'UserGroup' },
    _coderGroup : { type: Schema.Types.ObjectId, ref: 'UserGroup' }
});


const coderFeedbackSchema = new Schema({
    _feedbackSession : { type: Schema.Types.ObjectId, ref: 'FeedbackSession' },
    _coder : { type: Schema.Types.ObjectId, ref: 'User' },
    feedbackList : [
        {
            _reviewer : { type: Schema.Types.ObjectId, ref: 'User' },
            feedback : String,
            reviewedAt : Date
        }
    ]
});


export {
    coderFeedbackSchema,
    courseSchema,
    feedbackSessionSchema,
    quizSchema,
    userSchema,
    userGroupSchema,
    emailSchema
};
