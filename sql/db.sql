CREATE DATABASE quizz_me;
CREATE USER quiz_master@localhost IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON quizz_me.* TO quiz_master@localhost;
FLUSH PRIVILEGES;

use quizz_me;

create table courses(
	id int primary key auto_increment,
	name char(100) not null,
	description char(100) not null
);

create table questions (
	id int primary key auto_increment,
    question char(100) not null,
	course_id int,
	foreign key (course_id) references courses(id)
);

create table question_options(
	id int primary key auto_increment,
	answer char(100) not null,
	question_id int,
	foreign key (question_id) references questions(id)
);

create table question_answers(
	id int primary key auto_increment,
	question_option_id int,
	question_id int,
	foreign key (question_option_id) references question_options(id),
	foreign key (question_id) references questions(id)
);

create table candidates(
	id int primary key auto_increment,
	first_name char(100) not null,
	last_name char(100) not null,
	email char(100) not null,
	github_username char(100) not null
);

create table questionairres(
	id int primary key auto_increment,
	name char(100) not null,
	course_id int not null,
	number_of_questions int not null,
	foreign key (course_id) references courses(id)
);

create table candidate_questionairres(
	id int primary key auto_increment,
	candidate_id int not null,
	questionairre_id int not null,
	created_at datetime not null,
	due_at datetime not null,
	completed_at datetime,
	status char(10) not null,
	foreign key (candidate_id) references candidates(id),
	foreign key (questionairre_id) references questionairres(id)
);

create table candidate_questionairre_answers(
	id int primary key auto_increment,
	candidate_questionairre_id int not null,
	question_id int,
	candidate_answer_option_id int,
	answered_at datetime,
	status char(10) not null,
	foreign key (candidate_answer_option_id) references question_options(id),
	foreign key (question_id) references questions(id)
);
