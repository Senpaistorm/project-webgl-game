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

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static('static'));

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

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

let User = (function(){
    let _id = 1000000;
    return function user(user) {
        this._id = _id++;
        this.username = (user.username)? user.username: "Player" + this._id;
        this.socketId = user.socketId;
        this.status = user.status;
        this.room = (user.room)? user.room: user.socketId;
    };
}());

let users = [];

//add user
app.post('/api/user/', function (req, res, next) {
    let user = new User(req.body);
    users.push(user);
    res.json(user);
    next();
});

//find user by ID
app.get('/api/user/:id/', function(req, res, next) {
    let index = users.findIndex(function(user) {
        return user._id == parseInt(req.params.id);
    });
    if (index === -1) return res.status(404).end('user does not exist');
    else res.json(users[index]);
    next();
});

//Change socketId
app.patch('/api/user/socket/', function (req, res, next) {
    let index = users.findIndex((user) => {
        return user._id == req.body._id;
    });
    if(index === -1) return res.status(404).end('username does not exist');
    users[index].socketId = req.body.socketId;
    if (!users[index].room) users[index].room = req.body.socketId;
});

//Change name
// app.patch('/api/user/:newusername/', function (req, res, next) {
//     let index = user.findIndex(users)
// });

// WebSocket handlers
io.on('connection', function(socket) {

    socket.on('load', function(){
        let prepareroom = new Gameplay(Util.prepareroomGameboard(), Constants.PREPARE_ROOM, Constants.PROOM_CONT);
        prepareroom.setRoom(socket.id);
        prepareroom.addPlayer(socket.id, socket.id, 0);
        startedGames.set(socket.id, prepareroom);

        socketIdToSockets.set(socket.id, [socket]);
        prepareroom.checkPlayerHit = function(areaAffected, players) {};
        io.sockets.to(socket.id).emit('gamestart', prepareroom, socket.id);
    });

    socket.on('invitePlayer', (socketId, inviterId) => {
        console.log(socketId);
        console.log(io.sockets.to(socketId));
        io.sockets.to(socketId).emit('onInvite', inviterId);
    });

    socket.on('joinRoom', (socketId, callback) => {
        let game = startedGames.get(socketId);

        console.log(socketIdToSockets.get(socketId));
        if(isJoinablePrepareroom(game)) {
            callback(true);
            startedGames.delete(socket.id);
            socketIdToSockets.delete(socket.id);
            socketIdToSockets.get(socketId).push(socket);
            game.addPlayer(socket.id, socket.id, game.players.count + 1, 2, 2);
            socket.join(socketId, (err) => {
                if(err) console.error("Error joining room");
            });

            console.log(io.sockets.adapter.rooms);

            io.sockets.to(socketId).emit('gamestart', game, socketId);
        } else {
            callback(false);
        }
    });

    function isJoinablePrepareroom(game) {
        return game && game.gametype == Constants.PREPARE_ROOM && game.players.size < 4;
    }

    socket.on('disconnect', function(){
        startedGames.delete(socket.id);
    });

    // check all game rooms, join if there exists an unfilled room
    socket.on('enqueuePlayer', function(){
        //find all players in that socket room
        let players = socketIdToSockets.get(socket.id);

        if(players){
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
            game.addPlayer(sid, sid, i);
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

httpServer.listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});