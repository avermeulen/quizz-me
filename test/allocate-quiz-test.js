const AllocateQuiz = require('../utilities/allocate-quiz'),
    mongooseConnect = require('./mongoose-connect'),
    models = models = require('../models');


describe('AllocateQuiz', () => {
    mongooseConnect();
    
    beforeEach(() => {

        models.Course.remove({});

    });

    it('should allocate a quiz', () => {

        const allocateQuiz = AllocateQuiz(models);

        allocateQuiz();


    });

});
