var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var async = require('async');


var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'data',
	password : 'data',
	database : 'data'
});

var app = express();
app.set('view engine', 'ejs');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(express.static('public'));
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/account', function (request, response) {
	if(request.session.loggedin)
		response.sendFile( __dirname + "/" + "public/search.html" );
	else
		response.sendFile( __dirname + "/" + "public/account.html" );
});

app.post('/authentication', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect("http://localhost:3000/search.html");
				response.end();
			}
			else{
				connection.query('insert into accounts values(?,?)',[username,password], function(error, results, fields) {
					if(error)
						response.send('you have already account!');
					else{
						request.session.loggedin = true;
						request.session.username = username;
						response.redirect("http://localhost:3000/search.html");
						response.end();
					}
				});
			}			
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/search_book/:type', function (request, response) {
	if(request.session.loggedin){
		connection.query("SELECT * FROM books where type = ?",[request.params.type], function (error, rows, fields) {
			if (!!error) {
				console.log('Error in the query');
			} else {
				response.render('books', { page_title: "Item",data: rows });
			}
		});
	}
	else
        response.redirect("http://localhost:3000/account.html");
});

app.get('/search_author/:author', function (request, response) {
	if(request.session.loggedin){
		connection.query("SELECT * FROM books where author = ?",[request.params.author], function (error, rows, fields) {
			if (!!error) {
				console.log('Error in the query');
			} else {
				response.render('books', { page_title: "Item",data: rows });
			}
		});
	}
	else
        response.redirect("http://localhost:3000/account.html");
});

app.get('/details/:code', function (request, response) {
	if(request.session.loggedin){
		/*connection.query("SELECT * FROM books where code = ?",[request.params.code], function (error, rows, fields) {
			if (!!error) {
				console.log('Error in the query');
			} else {
				response.render('details', { page_title: "Item",data: rows });
			}
		});*/

		async.parallel([
		function(callback) { connection.query("select * from books where code=?",[request.params.code], callback) },
		function(callback) { connection.query("select * from reviews where code=?",[request.params.code], callback) }
		], function(err, results) {
			response.render('details', { data : results[0][0], data1 : results[1][0] });
		});
	}
	else
        response.redirect("http://localhost:3000/account.html");
});

app.get('/gift', function (request, response) {
	if(request.session.loggedin){
		connection.query("SELECT * FROM books where code = ?",[request.params.code], function (error, rows, fields) {
			if (!!error) {
				console.log('Error in the query');
			} else {
				response.render('gift', { page_title: "Item",data: rows });
			}
		});
	}
	else
        response.redirect("http://localhost:3000/account.html");
});

app.get('/share', function (request, response) {
	if(request.session.loggedin){
		connection.query("SELECT * FROM books where code = ?",[request.params.code], function (error, rows, fields) {
			if (!!error) {
				console.log('Error in the query');
			} else {
				response.render('share', { page_title: "Item",data: rows });
			}
		});
	}
	else
        response.redirect("http://localhost:3000/account.html");
});

app.get('/donate', function (request, response) {
	if(request.session.loggedin){
		connection.query("SELECT * FROM books where code = ?",[request.params.code], function (error, rows, fields) {
			if (!!error) {
				console.log('Error in the query');
			} else {
				response.render('donate', { page_title: "Item",data: rows });
			}
		});
	}
	else
        response.redirect("http://localhost:3000/account.html");
});

app.get('/logout', function(request, response) {
	request.session.destroy(err => {
		if (err) {
			return console.log(err);
		}
		response.sendFile( __dirname + "/" + "public/index.html" );
	});

});



/*
app.get('/input', function(request, response) {
	var QUERY1 = "select * from products";
	var QUERY2 = "select * from items";
	connection.query(QUERY1, function(err, result1) {
		connection.query(QUERY2, function(err, result2) {
			console.log(result1);
			console.log(result2);
			response.render('template', { rows : result1, rows2: result2 });
		});
	  });
});*/


/*
app.get('/input', function(request, response) {
	var QUERY1 = "select name from products";
	var QUERY2 = "select item_name from items";
	  async.parallel([
		function(callback) { connection.query(QUERY1, callback) },
		function(callback) { connection.query(QUERY2, callback) }
	  ], function(err, results) {
		  console.log(results[0][0]);
		  console.log(results[1][0]);
		response.render('template', { rows : results[0][0], rows2 : results[1][0] });
	  });
});
*/


app.listen(3000);