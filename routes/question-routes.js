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
    console.log('...');
    co(function *(){
        var services = yield req.getServices();
        var course = yield services.courseService.findCourseById(req.params.course_id);
        res.send(course);
    });
};
