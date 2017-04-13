var mongoose = require('mongoose');
var schemas = require('./schemas');

mongoose.Promise = Promise;

module.exports = {
    Course : mongoose.model('Course', schemas.courseSchema),
    //Question : mongoose.model('Question', schemas.questionSchema),
    User : mongoose.model('User', schemas.userSchema),
    Questionairre : mongoose.model('Questionairre', schemas.quizSchema),
    UserGroup : mongoose.model('UserGroups', schemas.userGroupSchema),
    Email : mongoose.model('Email', schemas.emailSchema)
};
