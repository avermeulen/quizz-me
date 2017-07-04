const co = require('co');
const fsp = require('fs-promise');
const Handlebars = require('handlebars');
const Promise = require('bluebird');
module.exports = function (models, emailSender) {
    if (!models) {
        throw new Error('Email service needs the mongoose models');
    }
    const Email = models.Email, User = models.User;
    function dequeueEmail(params) {
        return co(function* () {
            var emailsToSend = yield Email.find({ status: 'NEW' });
            const updatedAllEmails = emailsToSend.map((email) => {
                email.status = 'PENDING';
                return email.save();
            });
            yield updatedAllEmails;
            const emailsSent = emailsToSend.map((email) => emailSender(email));
            yield emailsSent;
            const emails = emailsToSend.map((email) => {
                email.status = 'SENT';
                return email.save();
            });
            yield emails;
            return emails;
        });
    }
    return dequeueEmail;
};
//# sourceMappingURL=email-dequeue.js.map