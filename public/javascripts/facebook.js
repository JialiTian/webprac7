/* global $ */
/* global FB */
/* global google */
var map;
var markerlist = [];
function initialize() {
	var mapProp = {
		center:new google.maps.LatLng(-34.9290,138.6010),
    	zoom:5,
    	mapTypeId:google.maps.MapTypeId.ROADMAP
  	};
  	map=new google.maps.Map(document.getElementById("map-canvas"), mapProp);
}
google.maps.event.addDomListener(window, 'load', initialize);


// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
  console.log('statusChangeCallback');
  console.log(response);
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
    document.getElementById("login").style.display = "none";
    document.getElementById("logout").style.display = "inline";
    testAPI();
    
  } else if (response.status === 'not_authorized') {
    // The person is logged into Facebook, but not your app.
    document.getElementById('status').innerHTML = 'Please log ' +
    'into this app.';
  } else {
    // The person is not logged into Facebook, so we're not sure if
    // they are logged into this app or not.
    document.getElementById('status').innerHTML = 'Please log ' +
    'into Facebook.';
  }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
  FB.getLoginStatus(function (response) {
    statusChangeCallback(response);
    if(response.status=="connected"){
      //send access token to server
      authToServer(response,function(){
        //after logged in, get friends data and add to map
        addFriendsToMap();
      });
    }
  });
}
// Now that we've initialized the JavaScript SDK, we call 
// FB.getLoginStatus().  This function gets the state of the
// person visiting this page and can return one of three states to
// the callback you provide.  They can be:
//
// 1. Logged into your app ('connected')
// 2. Logged into Facebook, but not your app ('not_authorized')
// 3. Not logged into Facebook and can't tell if they are logged into
//    your app or not.
//
// These three cases are handled in the callback function.
window.fbAsyncInit = function () {
  FB.init({
    appId: '1509368379354395',
    cookie: true,  // enable cookies to allow the server to access 
    // the session
    xfbml: true,
    version: 'v2.5'
  });
  FB.getLoginStatus(function (response) {
 	 	statusChangeCallback(response);
    if(response.status=="connected"){
      //send access token to server
      authToServer(response,function(){
        //after logged in, get friends data and add to map
        addFriendsToMap();
      });
    }
  });

};
// Load the SDK asynchronously
(function (d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) { return; }
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
} (document, 'script', 'facebook-jssdk'));
// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function (response) {
    console.log('Successful login for: ' + response.name);
    document.getElementById('status').innerHTML =
    'Hello!' + response.name;
  });
}

function authToServer(authResponse, callback) { 
  var authReq = new XMLHttpRequest();
  authReq.onreadystatechange = function() {
    if (authReq.readyState==4 && authReq.status==200) {
      console.log('logged in with server');
      callback(); 
    }}
   authReq.open("POST", "http://localhost:3000/auth", true); 
   authReq.setRequestHeader('Content-Type', 'application/json'); 
   authReq.send(JSON.stringify(authResponse));
}
function displayFriendsOnMap(){
	
	
    $(this).siblings().css({"background-color": "lightgreen"});
	$(this).css({"background-color": "white"});
  for(var i = 0;i<markerlist.length;i++){
    if(markerlist[i].title==this.innerHTML){
      markerlist[i].setVisible(true);
    }else{
      markerlist[i].setVisible(false);
    }
  }
}

function addFriendsToMap(){
    var dataURL = "http://localhost:3000/model/friendData.json";
	var friendsReq = new XMLHttpRequest();
	
	friendsReq.onreadystatechange = function() {
		if ((friendsReq.readyState==4) && (friendsReq.status==200)) {
 			var jsonData = JSON.parse(friendsReq.responseText);
 			var friends = jsonData.friends;
      		var namelist = [];
 			var index = 0;
 			while (index < friends.length){
 				var friend = friends[index];
        		namelist.push(friend.name);
 				var marker = new google.maps.Marker({
 							position: new google.maps.LatLng(
 														friend.lat,
 														friend.lng),
 							title: friend.name,
 							map:map,
 							
 					});
        markerlist.push(marker);
 				index++;
 			}	
      var uniqueNamelist = [];
      for(var i=0;i<namelist.length;i++){
        if(namelist.indexOf(namelist[i]) == i){
          uniqueNamelist.push(namelist[i]);
        }
      }
      for(var i=0;i<uniqueNamelist.length;i++){
        var name = uniqueNamelist[i];
        var li = document.createElement("LI");
        var t = document.createTextNode(name);
        li.appendChild(t);
        li.addEventListener("click",displayFriendsOnMap);
        document.getElementById("fl").appendChild(li);
        console.log(uniqueNamelist[i]);
      }
 		}
 	}
 	friendsReq.open("GET", dataURL, true);
	friendsReq.send();
}
function logout(){
FB.logout(function() {
        document.getElementById("logout").style.display = "none";
        document.getElementById("login").style.display = "inline";
        document.getElementById('status').innerHTML = 'Please log into Facebook.';
    });
    $("#display").siblings().remove();
    for (var i = 0; i < markerlist.length; i++) {
      markerlist[i].setMap(null);
    }
}
function display(obj){
  if(obj.innerHTML=="Display All"){
    $(obj).siblings().css({"background-color": "lightgreen"});
    for(var i = 0;i<markerlist.length;i++){
      markerlist[i].setVisible(true); 
    }
    obj.innerHTML="Clear All";
  }else{
    $(obj).siblings().css({"background-color": "lightgreen"});
    for(var i = 0;i<markerlist.length;i++){
      markerlist[i].setVisible(false); 
    }
    obj.innerHTML="Display All";
  }
}