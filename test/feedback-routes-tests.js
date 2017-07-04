const assert = require('assert');
const models = require('../dist/models');
const mongooseConnect = require('./mongoose-connect');

const FeedbackRoutes = require('../dist/routes/feedback-routes');

describe('The Feedback route', function(){

    it('shoud initialize fine', async function(){

        //FeedbackRoutes(models);
        console.log(models.Email);
        let fbr = new FeedbackRoutes.default(models);
        fbr.index()
        //console.log(new FeedbackRoutes(null));

    });


});
