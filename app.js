// main node server for Bomb Man

// import dependencies
const path = require('path');
const express = require('express');
const app = express();

const http = require('http');
const httpServer = http.Server(app);

const socketIO = require('socket.io');
const io = socketIO(httpServer);

const Character = require('./lib/Character');
const Gameplay = require('./lib/Gameplay');
const Constants = require('./lib/Constants');
const HashMap = require('hashmap');
const Util = require('./lib/Util');

// setup ports
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static('static'));

const UPDATE_FRAME_RATE = 30;
const GAMEOVER_CHECK_RATE = 2000;
// room status that contains all the queued players and their rooms
let roomStatus = [];
// HashMap that maps a room name to a Gameplay Object
let startedGames = new HashMap();

// HashMap that maps a socket id to a username
let socketToName = new HashMap();

// HashMap that maps a socket id to a list of sockets in that socket id
let socketIdToSockets = new HashMap();

// prepare room cache
let prepareroomCache = new HashMap();

let usernames = [];

// WebSocket handlers
io.on('connection', function(socket) {

    socket.on('load', function(){
        socketIdToSockets.set(socket.id, [socket]);
        loadPrepareRoom(socket);
    });

    function loadPrepareRoom(socket) {
        socket.join(socket.id, (err) => {
            if(err) console.error("Error joining room");
        });
        let prepareroom = new Gameplay(Util.prepareroomGameboard(), Constants.PREPARE_ROOM, Constants.PROOM_CONT);
        prepareroom.setRoom(socket.id);
        prepareroom.addPlayer(socket.id, socket.id, 0);
        startedGames.set(socket.id, prepareroom);

        prepareroom.checkPlayerHit = function(areaAffected, players) {};
        io.sockets.to(socket.id).emit('gamestart', prepareroom, socket.id);
    }

    socket.on('socketChange', (username, callback) => {
        let usernameCp = username;
        if(socketToName.search(username)){
            let i = 0;
            usernameCp = `${username}_${i}`;
            while(socketToName.search(usernameCp)){
                i++;
                usernameCp = `${username}_${i}`;
            }
        }
        socketToName.set(socket.id, usernameCp);
        callback(usernameCp);
    });

    socket.on('isRegsistered', (name, callback) => {
        if (usernames.includes(name)) {
            callback(true);
        } else {
            usernames.push(name);
            callback(false);
        }
    });

    socket.on('invitePlayer', (userId) => {
        let invitedSocketId = socketToName.search(userId);
        if(invitedSocketId != socket.id){
            io.to(invitedSocketId).emit('onInvite', socketToName.get(socket.id));
        }
    });

    socket.on('joinRoom', (username, callback) => {
        // fails if user tries to join his own room
        let socketId = socketToName.search(username);
        if(socketId == socket.id) callback(false);

        let objRoom = io.sockets.adapter.sids[socketId];
        if (!objRoom) return callback(false);  
        //get last room that contains given socket
        let rooms = Object.keys(objRoom);
        let room = rooms[rooms.length - 1];
        let game = startedGames.get(room);

        if(isJoinablePrepareroom(game)) {
            //leave all rooms he/she connects to
            Object.keys(socket.rooms).forEach(function(roomName){
                if(roomName != socket.id) {
                    socket.leave(roomName);
                    removePlayer(roomName, socket.id);
                }
            });

            socketIdToSockets.delete(socket.id);
            //delete cache
            prepareroomCache.delete(socket.id);

            //kick all players in my room
            if(startedGames.has(socket.id)){
                let myGame = startedGames.get(socket.id);
                myGame.getPlayerIds().forEach((id) => {
                    if (id != socket.id) {
                        io.sockets.connected[id].leave(socket.id);
                        io.to(id).emit("newGame", "Room host has left the room.");
                    }
                });
                startedGames.delete(socket.id);
            }

            socketIdToSockets.get(room).push(socket);
            game.addPlayer(socket.id, socket.id, game.players.count + 1, 2, 2);
            // cache preparegame for later use
            socketIdToSockets.get(room).forEach((s) => {
                prepareroomCache.set(s.id, game);
            });
            socket.join(room, (err) => {
                if(err) console.error("Error joining room");
            });
            io.sockets.to(room).emit('gamestart', game, room);

            callback(true);
        } else {
            callback(false);
        }
    });

    socket.on('message', function(message) {
        let rooms = socket.rooms;

        let cache = [];

        Object.keys(socket.rooms).forEach(function(roomName){
            if(startedGames.has(roomName)) {
                io.sockets.to(roomName).emit('addMessage', message);
            }
        });

    });

    socket.on('exitRoom', function(roomId){
        socket.leave(roomId);
        removePlayer(roomId, socket.id);
    });

    socket.on('backToMenu', function(){
        // if a cached preparegame exists, start that insteam
        if(prepareroomCache.has(socket.id)){
            let game = prepareroomCache.get(socket.id);
            startedGames.set(game.getRoom(), game);
            if (socket.id != game.getRoom()) {
                io.to(socket.id).emit('showParticipentMenu');
            }

            io.sockets.to(socket.id).emit('gamestart', game, game.getRoom());
        }else{
            socketIdToSockets.set(socket.id, [socket]);
            loadPrepareRoom(socket);
        }
    });

    function isJoinablePrepareroom(game) {
        return game && game.gametype == Constants.PREPARE_ROOM && game.players.size < 4;
    }

    socket.on('disconnecting', function(){

        //remove from cache
        if(prepareroomCache.has(socket.id)) {
            let cachedRoom = prepareroomCache.get(socket.id);
            cachedRoom.removePlayer(socket.id);
            prepareroomCache.delete(socket.id);
            if(cachedRoom.getPlayerIds().length == 1){
                prepareroomCache.delete(cachedRoom.getPlayerIds()[0]);
            }
        }

        //leave all rooms he/she connects to 
        Object.keys(socket.rooms).forEach(function(roomName){
            if(roomName != socket.id) {
                socket.leave(roomName);
                removePlayer(roomName, socket.id);
            }
        });

        if(startedGames.has(socket.id)){
            io.sockets.to(socket.id).emit("newGame", "Room host has left the room.");
            startedGames.delete(socket.id);
        }
        socketIdToSockets.delete(socket.id);
        socketToName.delete(socket.id);
    });

    /**
     * Remove a player of given room
     * roomId: the socketId of the room host
     * player: socketId of taget player that will be removed
     * */ 
    function removePlayer(roomId, playerId) {
        //left game 
        game = startedGames.get(roomId);
        if(game) game.removePlayer(playerId);

        //remove from the group
        group = socketIdToSockets.get(roomId);
        if(group) {
            let index = group.findIndex((player) => {
                return player.id == playerId;
            });
            if(index != -1) group.splice(index, 1);
        }
    }

    // check all game rooms, join if there exists an unfilled room
    socket.on('enqueuePlayer', function(){
        //find all players in that socket room
        let players = socketIdToSockets.get(socket.id);

        if(players){
            players.forEach((player) => {
                io.to(player.id).emit("inQueue");
            })

            // if there's an available room, join it
            if(roomStatus.length > 0){
                roomStatus.forEach((room) =>{
                    if(room.size + players.length <= 4){
                        players.forEach(player => {
                            player.join(room.name, (err) => {
                                if(err) console.error("Error joining room");
                            });
                            room.size++;
                        });
                    }
                });
            }else{
                let roomName = `${socket.id}room`;
                // there is no available room, create one with own name
                players.forEach((player) => {
                    player.join(roomName, (err) => {
                        if(err) console.error("Error joining room");
                    });
                });

                roomStatus.push({name:roomName, size:players.length});
            }
        }
    });

    socket.on('resolveQueue', () =>{
        let rooms = io.sockets.adapter.rooms;

        roomStatus.forEach((room) =>{
            if(room.size >= 2){
                startNewGame(room);
            }else{
                if(room.name in rooms){
                    socket.leave(room.name);
                }
            }
        });
        roomStatus = [];
    });    

    function startNewGame(room){
        let rooms = io.sockets.adapter.rooms;
        let game = new Gameplay(Util.defaultGameboard(), Constants.GAME, Constants.GAME_CONT);
        let i = 0;

        game.setRoom(room.name);
        for(const sid in rooms[room.name].sockets){
            game.addPlayer(socketToName.get(sid), sid, i);
            i++;
        }
        startedGames.set(room.name, game);
        startedGames.forEach(function(sid_game, sid){
            if(!(sid in rooms) || game.players.has(sid)){
                startedGames.delete(sid);
            }
        });
        io.sockets.to(room.name).emit('gamestart', game, room.name);
    }

    socket.on('player_action', (data) =>{
        let game = startedGames.get(data.room);
        if(game) game.handleKey(socket.id, data.intent);
    });

    socket.on('placeBomb', (data) =>{
        let game = startedGames.get(data.room);
        if(game) {
            let player = game.getPlayerBySocketId(socket.id);
            if(player){
                game.placeBomb(player, (bomb) => {
                    io.sockets.to(data.room).emit('bombPlaced', bomb);
                }, (res) => {
                    io.sockets.to(data.room).emit('explode', res);
                });
            }
        }
    });

    socket.on('leaveRoom', (room) =>{
        // leave room on gameover
        socket.leave(room);
    });
});

// Server side game loop that updates game state and send to game room
setInterval(function() {
    startedGames.forEach(function(game, room){
        game.update();
        let state = game.getState();
        io.sockets.in(room).emit('gamestate', state);
    });
}, 1000/UPDATE_FRAME_RATE);

// Server side game loop that checks game over state
// that ticks every 2 seconds
let startedGamesCp;
setInterval(function() {
    startedGamesCp = startedGames.clone();
    startedGamesCp.forEach(function(game, room){
        if(game.isGameOver()){
            io.sockets.in(room).emit('gameover', game.getResult());
            startedGames.delete(room);
        }
    });
}, GAMEOVER_CHECK_RATE);

const PORT = 3000;

httpServer.listen(server_port, server_ip_address, function (err) {
    if (err) console.log(err);
    else console.log( "Listening on " + server_ip_address + ", server_port " + server_port  );
});