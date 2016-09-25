const assert = require('assert'),
    Promise = require('bluebird'),
    co = require('co'),
    mongoose = require('mongoose'),
    EmailQueue = require('../utilities/email-queue'),
    models = models = require('../models'),
    mongooseConnect = require('./mongoose-connect');

require('co-mocha')

describe('EmailQueue with Mongo', () => {
    mongooseConnect();

    beforeEach(function*() {
        yield models.Email.remove({});
    })

    it('should store data in the database correctly', function*() {
        try {

            const USERNAME = 'theUser';
            const EMAIL = 'email@user.za';
            const SUBJECT = 'You got a new quiz!';
            const QUIZ_ID = '925';
            const queueEmail = EmailQueue(models);

            //
            var result = yield queueEmail({
                username: USERNAME,
                subject: SUBJECT,
                quiz_id: QUIZ_ID,
                emailType: 'quiz_sent'
            });

            var emails = yield models.Email.find({emailType : 'quiz_sent'});
            assert.equal(emails.length, 1);

            const email = emails[0];
            assert.equal(email.status, 'NEW');
            console.log(email);
            var containsUsername = email.text.indexOf(USERNAME) != -1;
            assert(containsUsername, 'quiz id should be in the email content');

        } catch (err) {
            assert.fail('there should not be exceptions', err)
        }
    });


});
