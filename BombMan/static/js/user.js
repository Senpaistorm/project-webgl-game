let user = (function() {
	'use strict';

	let module = {};

	function send(method, url, data, callback){
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    //add a new user and return the given user name
    function addNewUser() {
    	send("POST", "/api/user/", {}, function(err, res) {
    		localStorage.setItem('user', JSON.stringify({_id: res._id, username: res.username}));
    	});
    }

    if(!localStorage.getItem('user')) {
    	addNewUser();
    }

    // module.changeName = function(newusername){
   	// 	localStorage.setItem('username', JSON.stringify(newusername));
   	// 	return true;
    // };

    module.setSocketId = function(socketId) {
    	let id = JSON.parse(localStorage.getItem('user'))._id;
    	send("PATCH", "/api/user/socket", {_id: id, socketId: socketId}, (err, res) => {});
    }

    module.getSocket = function(id, callback) {
    	send("GET", "/api/user/" + id + "/", {}, (err, res) => {
    		if(!err) callback(res.socketId);
    	});
    }

    module.getName = function(socketId=null) {
        let id = socketId ? socketId : JSON.parse(localStorage.getItem('user'))._id;

    	send("GET", "/api/user/" + id + "/", {}, (err, res) => {
    		//if name is out of date
    		if(err) addNewUser();
    		else console.log(res.socketId + " aefaew");
    	});
    	return JSON.parse(localStorage.getItem('user'));
    }
		
	return module;
})();