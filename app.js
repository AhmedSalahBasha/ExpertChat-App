var express 	 	 = require("express"),
	app 		  	 = express(),
	path 		 	 = require("path"),
	cookieParser 	 = require('cookie-parser'),
	session 	  	 = require('express-session'),
	config  	  	 = require('./config/config.js'),
	ConnectMongo 	 = require('connect-mongo')(session),
	mongoose	  	 = require('mongoose').connect(config.dbURL),
	passport 	 	 = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy,
	rooms 		 	 = [];

//where find the html files
app.set('views', path.join(__dirname, 'views'));
//render html files using hogan module
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
//where find the css files
app.use(express.static(path.join(__dirname, 'public')));
//use cookieParser for cookies
app.use(cookieParser());
//use session for session use

var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
	// development specific settings
	app.use(session({secret: config.sessionSecret, saveUninitialized:true, resave: true}));
}else {
	// production specific settings
	app.use(session({
		secret: config.sessionSecret,
		store: new ConnectMongo({
			//url: config.dbURL,
			mongooseConnection: mongoose.connections[0],
			stringify: true
		}),
		saveUninitialized:true,
	    resave: true
	}));
}

app.use(passport.initialize());
app.use(passport.session());

require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);

//invoke the function that holds all the routes
require('./routes/routes.js')(express, app, passport, config, rooms);



/* ---- open the server | Old Method ----
app.listen(3000, function(){
	console.log('Project Has Started On Port 3000 ...');
	console.log('Mode: ' + env);
});*/

// install and invoke socket.io
app.set('port', process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket/socket.js')(io, rooms);

server.listen(app.get('port'), function(){
	console.log('ExpertChat Application is Running on port: ' + app.get('port'))
});