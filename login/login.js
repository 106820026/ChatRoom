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

// check if connect to DB successfully
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

// login response
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

// go to login page
app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/login.html'));
});

// add new user to DB and back to login page
app.post('/login',function (req,res) {
	var name=req.body.username;
	var pwd=req.body.password;
	var email=req.body.email;
	var user={username:name,password:pwd,email:email};
	connection.query('SELECT * FROM accounts WHERE username = ?',[name],function(error, results, fields) {
		if (results.length > 0){
			res.send("The username is already been used.");
			console.log('duplicate username');
		}
		else{	
			connection.query('insert into accounts set ?',user,function (err,rs) {
			if (err) throw err;
			console.log('ok');
			res.sendFile(path.join(__dirname + '/views/login.html'));
		});
		}
	});
});

///////////////////////////////////////////
// ChatRoom                             //
//////////////////////////////////////////

// go to chatroom page
app.get('/chatroom', function(request, response) {
	if (request.session.loggedin) {
		// response.redirect('http://7577de9e.ngrok.io');
		response.sendFile(path.join(__dirname + './../encryptedchatroom/views/index.html'));
	} else {
		response.send('Please login to view this page!');
	}
});

///////////////////////////////////////////
// Start server                         //
//////////////////////////////////////////

app.listen(3003, ()=> {
	console.log("Server Started. http://localhost:3003");
});