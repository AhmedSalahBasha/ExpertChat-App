module.exports = function(express, app, passport, config, rooms){
	var router = express.Router();


	// --- GET | Index ROUTE ---
	router.get('/', function (req, res, next) {
		 res.render('index', {title: 'Welcome to ExpertChat'});
	});

	// --- Middleware | to prevent not authenticated user to access pages
	function securePages (req, res, next) {
		 if(req.isAuthenticated()){
		 	next();
		 }else{
		 	res.redirect('/');
		 }
	}

	// --- GET | Facebook Authentication ---
	router.get('/auth/facebook', passport.authenticate('facebook'));

	// --- GET | Facebook Callback ---
	router.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect: '/chatrooms',
		failureRedirect: '/'
	}));

	// --- GET | Chatrooms ROUTE ---
	router.get('/chatrooms', securePages, function (req, res, next) {
		 res.render('chatrooms', {
		 	title: 'Chat Rooms',
		 	user: req.user,
		 	config: config
		 });
	});

	// --- GET | Single Room ROUTE ---
	router.get('/room/:id', securePages, function(req, res, next){
		var room_name = findTitle(req.params.id);
		res.render('room', {
			user: req.user,
			room_number: req.params.id,
			room_name: room_name,
			config: config
		})
	});

	// --- Function | Get the name of the room by room_number ---
	function findTitle(room_id){
		var n = 0;
		while (n < rooms.length) {
			if (rooms[n].room_number == room_id) {
				return rooms[n].room_name;
				break;
			}else {
				n++;
				continue;
			}
		}
	}

	// --- GET | Logout ROUTE ---
	router.get('/logout', function(req, res, next){
		req.logout();
		res.redirect('/');
	});

	app.use('/', router);
}

