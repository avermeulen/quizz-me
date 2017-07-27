const models = require("../models");
const mongoose = require("mongoose");

var Questionairre = models.Questionairre;

async function connect(){
    var mongoDatabaseUrl = process.env.MONGODB_URL || 'mongodb://localhost/quizz_me';
    await mongoose.connect(mongoDatabaseUrl, {}).connection;
}

async function findQuestion(questionText){
    var quizzes = await Questionairre.find({
        "details.questions.question" : questionText
    });

    for (var quiz of quizzes){
        
        let question = quiz.details.questions.filter(function(q){
            return q.question === questionText;
        });

        console.log(question[0].question);
    }

}

try{
    connect();
    findQuestion("What does the HttpRequest render function do?");
    console.log("done!");
    mongoose.connection.close();
}
catch(e){
    console.log(e);
}