const path = require('path');
const express = require('express');
const app = express();

const http = require('http');
const httpServer = http.Server(app);

const socketIO = require('socket.io');
const io = socketIO(httpServer);
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

// WebSocket handlers
io.on('connection', function(socket) {
    console.log(`user ${socket.id} connected.`);

    socket.on('disconnect', function(){
        console.log(`user ${socket.id} disconnected`);
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
                // notify every player in the room to start game                 
                io.sockets.in(room.name).emit('gamestart', rooms[room.name].sockets, room.name);
                Object.keys(rooms[room.name].sockets).forEach((char) =>{
                    charToRoom[char] = room.name;
                })
                console.log(charToRoom);
            }else{
                if(room.name in rooms){
                    socket.leave(room.name);
                }
            }
        });
        roomStatus = [];
    });    

    socket.on('placeBomb', (roomId, player) =>{
        io.sockets.to(roomId).emit('placeBomb', player);
    });

    socket.on('updateCharacters', (room, character) =>{
        if(!(character.name in characterStatus)){
            characterStatus[character.name] = character;
        }else{
            characterStatus[character.name].absoluteXPos = character.absoluteXPos;
            characterStatus[character.name].absoluteYPos = character.absoluteYPos;   
            characterStatus[character.name].rotation = character.rotation;
        }
        io.sockets.to(room).emit('updateCharacters', characterStatus[character.name]);
    });

    socket.on('gameover', (room) =>{
        // leave room on gameover
        socket.leave(room);
    });

});

const PORT = 3000;

httpServer.listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});