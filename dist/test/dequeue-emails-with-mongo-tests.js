const assert = require('assert'), Promise = require('bluebird'), co = require('co'), mongoose = require('mongoose'), emailData = require('./email.json'), DequeueEmail = require('../utilities/email-dequeue'), EmailSender = require('../utilities/email-sender'), models = models = require('../models'), mongooseConnect = require('./mongoose-connect');
require('co-mocha');
describe('DequeueEmail with Mongo', () => {
    mongooseConnect();
    before(function () {
        if (!process.env.TEST_EMAIL) {
            this.skip();
        }
    });
    beforeEach(function* () {
        yield models.Email.remove({});
        const email = models.Email(emailData);
        yield email.save();
    });
    it('should store data in the database correctly', function* () {
        try {
            this.timeout(60000);
            const deqeueEmail = DequeueEmail(models, new EmailSender(process.env.EMAIL, process.env.EMAIL_CREDENTIALS));
            yield deqeueEmail;
            var emails = yield models.Email.find({ 'status': 'SENT' });
            assert.equal(emails.length, 1);
        }
        catch (err) {
            assert.fail('there should not be exceptions', err);
        }
    });
});
