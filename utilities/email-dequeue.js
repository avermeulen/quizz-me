const co = require('co');
const fsp = require('fs-promise');
const Handlebars = require('handlebars');
const Promise = require('bluebird');

module.exports = function(models, emailSender){

    if (!models){
        throw new Error('Email service needs the mongoose models')
    }

    const Email = models.Email,
        User = models.User;

    return function(params){
        return co(function*(){

            var emailsToSend = Email.find({status : 'NEW'});
            const updatedAllEmails = emailsToSend.map((email) => {
                email.status = 'PENDING';
                return email.save();
            });

            yield updatedAllEmails;

            var emailsSent = emailsToSend.map((email) => emailSender(email));
            yield emailsSent;

            const emails = emailsToSend.map((email) => {
                email.status = 'SENT';
                return email.save();
            });

            yield emails;

        });
    }
}
