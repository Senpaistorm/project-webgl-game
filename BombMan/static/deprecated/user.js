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
    	send("POST", "/api/user/", {status: PREPARE_ROOM}, function(err, res) {
    		localStorage.setItem('user', JSON.stringify({_id: res._id, username: res.username}));
            notifyUsetInfoUpdate(res);
    	});
    }

    if(!localStorage.getItem('user')) {
    	addNewUser();
    }

    module.getMyId = function() {
        return localStorage.getItem('user')._id;
    }

    // module.changeName = function(newusername){
   	// 	localStorage.setItem('username', JSON.stringify(newusername));
   	// 	return true;
    // };

    //PATCH
    module.setSocketId = function(socketId) {
    	let id = JSON.parse(localStorage.getItem('user'))._id;
    	send("PATCH", "/api/user/socket", {_id: id, socketId: socketId}, (err, res) => {});
    }

    module.setMyRoom = function(roomId) {
        let id = JSON.parse(localStorage.getItem('user'))._id;
        send("PATCH", "/api/user/room/", {_id: id, room: roomId}, (err, res) => {});
    }

    module.changeMyStatus = function(newStatus) {
        let id = JSON.parse(localStorage.getItem('user'))._id;
        send("PATCH", "/api/user/room/", {_id: id, status: newStatus}, (err, res) => {});
    }

    //GET
    module.getUser = function(id, callback) {
    	send("GET", "/api/user/" + id + "/", {}, (err, res) => {
    	   callback(err, res);
    	});
    }

    module.getMyInfo = function(socketId=null) {
        let id = socketId ? socketId : JSON.parse(localStorage.getItem('user'))._id;
    	send("GET", "/api/user/" + id + "/", {}, (err, res) => {
    		//if name is out of date
    		if(err) addNewUser();
            else notifyUsetInfoUpdate(res);
    	});
    };

    let userListeners = [];

    function notifyUsetInfoUpdate(user) {
        userListeners.forEach((listener) => {
            listener(user);
        });
    }

    module.onUserInfoUpdate = function(listener) {
        userListeners.push(listener)
    }
		
	return module;
})();