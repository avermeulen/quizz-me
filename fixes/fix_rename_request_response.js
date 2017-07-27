const models = require("../models");
const mongoose = require("mongoose");

var Questionairre = models.Questionairre;

async function connect(){
    var mongoDatabaseUrl = process.env.MONGODB_URL || 'mongodb://localhost/quizz_me';
    await mongoose.connect(mongoDatabaseUrl, {}).connection;
}

async function findQuestion(questionText, newText){
    var quizzes = await Questionairre.find({
        "details.questions.question" : questionText
    });

    let allCalls = [];

    for (var quiz of quizzes){
        
        

        try{
            let question = quiz.details.questions.filter(function(q){
                return q.question === questionText;
            });
            
            question[0].question = newText;

            allCalls.push(quiz.save());
            console.log("*");

        }
        catch(e){
            console.log("******");
            console.log(e);
        }
    }

    await Promise.all(allCalls);

}

async function doIt(){
    try{
        
        await connect();
        await findQuestion("What does the HttpRequest render function do?", "What does the HttpResponse render function do?");

        console.log("done!");
        mongoose.connection.close();
    }
    catch(e){
        console.log(e);
    }
}

doIt();
