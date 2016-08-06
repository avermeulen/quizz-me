var co = require('co');

exports.allCourses = function(req, res){
    console.log('...');
    co(function *(){
        var services = yield req.getServices();
        console.log(services);

        var courses = yield services.courseService.findAllCourses();

        res.send(courses);
    });
};

exports.courseById = function(req, res){
    co(function *(){
        var course_id = req.params.course_id;
        var services = yield req.getServices();
        var course = yield services.courseService.findCourseById(req.params.course_id);
        res.send(course);
    });
};


exports.questionAdd = function(req, res, next){
    co(function *(){
        var course_id = req.params.course_id,
            data = req.body;
        data.course_id = course_id;

        var services = yield req.getServices();
        try{
            yield services.courseService.addQuestion(data);
            res.redirect('/courses/' + course_id);
        }
        catch(err){
            next(err);
        }
    });
}

exports.questionAddShow = function(req, res){
    var course_id = req.params.course_id;
    res.render('add_question', {course_id : course_id});
}
