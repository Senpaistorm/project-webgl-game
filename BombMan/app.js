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

app.use(express.static('static'));

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

// room status that contains all the queued players and their rooms
let roomStatus = [];
// character status of all game rooms
let characterStatus = {};
// character to room dictionary
let charToRoom = {};
let startedGames = new HashMap();

const GAMEBOARD_SIZE = 15;
const ITEM_PROC_RATE = 0.5;

// WebSocket handlers
io.on('connection', function(socket) {

    socket.on('disconnect', function(){
        delete charToRoom[socket.id];
        delete characterStatus[socket.id];
    });

    // check all game rooms, join if there exists an unfilled room
    socket.on('enqueuePlayer', function(){
        // if there's an available room, join it
        if(roomStatus.length > 0){
            roomStatus.forEach((room) =>{
                if(room.size < 4){
                    socket.join(room.name, (err) => {
                        if(err) console.error("Error joining room");
                    });
                    room.size++;
                }
            })
        }else{
            // there is no available room, create one with own name
            let roomName = `${socket.id}room`;
            socket.join(roomName, (err) => {
                if(err) console.error("Error joining room");
            });
            roomStatus.push({name:roomName, size:1});
        }
    });

    socket.on('resolveQueue', () =>{
        console.log('resolving game queue');
        let rooms = io.sockets.adapter.rooms;
        roomStatus.forEach((room) =>{
            if(room.size >= 2){
                let game = new Gameplay();
                let i = 0;

                game.setRoom(room.name);
                for(const sid in rooms[room.name].sockets){
                    game.addPlayer(sid, sid, i);
                    i++;
                }
                startedGames.set(room.name, game);
                io.sockets.to(room.name).emit('gamestart', game, room.name);
            }else{
                if(room.name in rooms){
                    socket.leave(room.name);
                }
            }
        });
        roomStatus = [];
    });    

    // socket.on('serverInit', (roomId, gameplay) => {
    //     let itemboard = setRandomItems(gameplay.gameboard);
    //     io.sockets.to(roomId).emit('itemsInit', itemboard);
    // })


    socket.on('placeBomb', (roomId, player) =>{
        io.sockets.to(roomId).emit('placeBomb', player);
    });

    socket.on('gameover', (room) =>{
        // leave room on gameover
        socket.leave(room);
    });

});

// Server side game loop, runs at 60Hz and sends out update packets to all
// clients every tick.
// setInterval(function() {
//     startedGames.forEach((game) => {
//         game.update();
//         game.sendState();
//     });
// }, 1000/30);

function setRandomItems(gameboard){
    let res = [];
    for(let i = 0; i < GAMEBOARD_SIZE; i++){
        let arr = [];
        for (var j = 0; j < GAMEBOARD_SIZE; j++){
            if(Math.random() > ITEM_PROC_RATE && gameboard[i][j]){
                arr.push(Math.floor(Math.random() * 3 + 1));
            }else{
                arr.push(0);
            }
        }
        res.push(arr);
    }
    return res;
}

const PORT = 3000;

httpServer.listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});