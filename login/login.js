var mysql = require('mysql');
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root',
	database : 'nodelogin'
});
connection.connect(function(err) {
	if (err) {
		console.log('connecting error');
		return;
	}
	console.log('connecting success');
});

app.use('/', express.static(__dirname));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/login.html'));
});

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
			// response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.use('/chatroom', function(request, response) {
	if (request.session.loggedin) {
		response.redirect('http://c4d24b75.ngrok.io');
		// response.sendFile(path.join(__dirname, "../encryptedchatroom/views/index.html"));
	} else {
		response.send('Please login to view this page!');
	}
});

app.listen(3003, ()=> {
	console.log("Server Started. http://localhost:3003");
});