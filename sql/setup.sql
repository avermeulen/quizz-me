use quizz_me;

delete from options;
delete from questions;
delete from courses;

insert into courses (name, description) values ('Know your world', 'Used for testing purposes');

insert into courses (name, description) values ('Know the oceans', 'Used for testing purposes');

set @course_id = last_insert_id();

insert into questions (question, course_id) values ('Which one of the options below is an ocean?', @course_id);
