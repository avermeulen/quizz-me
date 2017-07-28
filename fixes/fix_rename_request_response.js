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

        //await findQuestion("What does the HttpRequest render function do?", 
        //    "What does the HttpResponse render function do?");
        
        console.log("--------------------------");

        //await findQuestion("What is the difference between the HttpRequest send and render methods?", 
        //    "What is the difference between the HttpResponse send and render methods?");

        await findQuestion("Tell us which school did you completed your Senior Certificate at. If you have any other tertiary education, tell us what you studied and where.", 
            "Tell us which school you completed your Senior Certificate at. If you have any other tertiary education, tell us what you studied and where.");
        

        console.log("done!");
        mongoose.connection.close();
    }
    catch(e){
        console.log(e);
    }
}

doIt();
