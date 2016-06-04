module.exports = function(passport, FacebookStrategy, config, mongoose){
	
	// Users Schema
	var chatUser = new mongoose.Schema({
		profileID: String,
		fullname: String,
		profilePic: String
	});

	// Create the Model of Users Schema
	var userModel = mongoose.model('chatUser', chatUser);

	// to save the userID in the session
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	// to get the user by id which stored in session
	passport.deserializeUser(function(id, done){
		userModel.findById(id, function(err, user){
			done(err, user);
		});
	});

	passport.use(new FacebookStrategy({
		clientID: config.fb.appID,
		clientSecret: config.fb.appSecret,
		callbackURL: config.fb.callbackURL,
		profileFields: ['id', 'displayName', 'photos']
	}, function(accessToken, refreshToken, profile, done){
		// Check if user exists in our database
		userModel.findOne({'profileID': profile.id}, function(err, result){
			if(result){
				// return user data
				done(null, result)
			}else {
				// if not, get profile info
				var newChatUser = new userModel({
					profileID: profile.id,
					fullname: profile.displayName,
					profilePic: profile.photos[0].value || ''
				});
				// save profile info in Database
				newChatUser.save(function(err){
					done(null, newChatUser);
				});
			}
		});

	}));
}