var express = require('express');
var router = express.Router();
var data = require('../javascripts/data.js');
var config = require('../config');
var FB = require('fb');
/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/auth',function(req,res){
	console.log('receibed short-lived-token');
	//verify app id
	//exchange for long term access token
	FB.api('oauth/access_token',
		{ grant_type: 'fb_exchange_token',
			client_id: config.facebook.appId,
			client_secret: config.facebook.appSecret, 
			fb_exchange_token: req.body.authResponse.accessToken 
		},
		function (response) {
			if(!response || response.error) {
				console.log(!response ? 'error occurred' : response.error);
				return; 
			}
			console.log('long term token obtained'); 
			req.session.accessToken = response.access_token; 
			req.session.expires = response.expires ? res.expires : 0; 
			res.sendStatus(200);
		});
});

router.get('/model/friendData.json', function(req, res) {
/* send a FB request for the friends edge of the current user node using the long term access associated with this user */
	var accessToken = req.session.accessToken;
	if (!accessToken) {
		console.log('access token not available'); 
		res.sendStatus(404);
	} 
	else{ 
		FB.api("/me/friends",
				{ access_token: accessToken },
				function(response) {
					if (response && !response.error) {
						console.log('received: ' + JSON.stringify(response.data));
						// for each friend in the response get the location data
						processFriends(response.data, accessToken, 
									function(locationData,friendsProcessed) {
										console.log(friendsProcessed);
										console.log('finished processing friends' + 
														JSON.stringify(locationData));
										res.send(JSON.stringify(locationData));
									});
					} 
					else { 
						console.log(response.error);
						res.sendStatus(500);
					}
				});
	}
});

function processFriends(friends, accessToken, callback) { 
	console.log('processing friends ' + friends);
	var friendCount = friends.length;
	var friendsProcessed = 0;
	var locationData = { friends: [] };
	var friendIndex = 0; 
	while(friendIndex < friendCount) {
		var friend = friends[friendIndex];
		// Get friend locations and add to the location Data
		getFriendLocations(friend, accessToken,
				function(name, locations) {
					// get friends will call this callback with name of friend 
					// and locations.
					// Add code to add these places to locationData object here 
					var placeIndex = 0;
					var placeCount = locations.length;
					while(placeIndex < placeCount) {
						var place = locations[placeIndex].place.location; 
						console.log('adding place: ' + JSON.stringify(place));
						var markerInfo = { name: name , 
										lat:place.latitude,
										lng:place.longitude,
										visible:"show"
										}; 
						locationData.friends.push(markerInfo);
						placeIndex++; 
					}
					friendsProcessed++;
					// if we've processed all the friends return the location data 
					if (friendsProcessed == friendCount) {
						callback(locationData,friendsProcessed); 
					}
				});
		
		friendIndex++;
	}
}

function getFriendLocations(friend, accessToken, callback) { 
	console.log('getting location information for ' + friend.name); 
	FB.api("/"+friend.id+"/tagged_places",
			{ access_token: accessToken }, 
			function(placesResponse) {
				if (placesResponse && !placesResponse.error) { 
					console.log(placesResponse.data); 
					callback(friend.name, placesResponse.data);
				} 
				else {
					console.log(placesResponse.error); 
					placesResponse.sendStatus(500);
				}
			}
	);
}
router.post('/updateFriendStatus', function(req, res) { 
	//Connect to the database
	req.pool.getConnection(function(err,connection) { 
		if (err) throw err;
		var query = "SELECT fbid FROM user where user.name='"+req.data.name+"';"; 
		connection.query(query,
			function(err, rows, fields) { 
				if (err) throw err;
				query = "UPDATE friend SET visible='"+req.data.visible+
					"' WHERE fbid1="+req.session.fbid+" AND fbid2="+rows[0].fbid+";";
				connection.query(query,
					function(err, rows, fields) { 
						connection.release();
						if (err) throw err; 
						res.sendStatus(200)
				}); 
		});
	}); 
});

router.get('/model/friendslist', function(req, res) {
	// connect to database
	req.pool.getConnection(function(err,connection) { 
		if (err) throw err;
		// send query
		connection.query('SELECT name, visible FROM friend INNER JOIN user on fbid=fbid2 WHERE friend.fbid1='+req.session.fbid,
						function(err, rows, fields) { 
							if (err) throw err;
							console.log(rows);
							// release connection
							connection.release();
							// return query response to client
							res.send(JSON.stringify({friends: rows})); 
						});
	}); 
});
module.exports = router;
