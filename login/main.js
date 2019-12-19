var mysql = require('mysql');
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

///////////////////////////////////////////
// DataBase                             //
//////////////////////////////////////////

// connect to DB
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root',
	database : 'nodelogin'
});

// chect if connect to DB successfully
connection.connect(function(err) {
	if (err) {
		console.log('connecting error');
		return;
	}
	console.log('connecting success');
});

// let everyone can get everything
app.use(express.static(__dirname));

// IDK
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

///////////////////////////////////////////
// Login                                //
//////////////////////////////////////////

// respone the request from localhost (Login Page)
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/login.html'));
});

// 
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/chatroom');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/signup', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/signup.html'));
});

///////////////////////////////////////////
// Sign Up                              //
//////////////////////////////////////////

app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/login.html'));
});

///////////////////////////////////////////
// ChatRoom                             //
//////////////////////////////////////////

app.post('/chatroom', function(request, response) {
	if (request.session.loggedin) {
		response.redirect('http://c4d24b75.ngrok.io');
	} else {
		response.send('Please login to view this page!');
	}
});

app.listen(3003, ()=> {
	console.log("Server Started. http://localhost:3003");
});