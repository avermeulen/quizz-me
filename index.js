var name = "Andre"
console.log("go", name);

var express = require('express'),
    exphbs  = require('express-handlebars'),
	bodyParser =  require('body-parser');

var app = express();

app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//setup template handlebars as the template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var questions = {
	1 : {
		id : 1,
		text : "Which number is the biggest?",
		answers : [
			"34",
			"23",
			"47",
			"11"
		],
		answer : "47"
	},
	2 : {
		id : 2,
		text : "Which number is the smallest?",
		answers : [
			"34",
			"23",
			"47",
			"11"
		],
		answer : "11"
	},
	3 : {
		id : 3,
		text : "What color is the sky?",
		answers : [
			"red",
			"blue",
			"yellow",
			"grey"
		],
		answer : "blue"
	}
};

app.get("/", (req, res) =>{
    res.redirect("/question/1");
});

app.get('/question/:question_id', function (req, res) {

	//var question =

	res.render('quiz', {question : questions[req.params.question_id]});
});

app.get('/done', function (req, res) {
	res.render('done');
});

app.get('/correct/:question_id', function (req, res) {
	res.render("incorrect", {"question_id" : question_id});
});

app.get('/incorrect/:question_id', function (req, res) {
	res.render("correct", {"question_id" : question_id});
});

app.post('/answer/:question_id', function (req, res) {

	console.log("=> " + req.params.question_id);

	var currentQuestion = questions[req.params.question_id];

	var correct = currentQuestion.answer === req.body.answer;
	console.log("answer correct? : " + correct);

	//res.send(req.body);
	var question_id = (Number(req.params.question_id) + 1);
	if (questions[question_id] === undefined){
		console.log('done : ' + question_id)
		res.redirect("/done");
	}
	else{
		res.redirect("/question/" + question_id);
	}
});

var port = process.env.portNumber || 3000;
app.listen(port, function () {
    console.log('express-handlebars example server listening on:', port);
});
