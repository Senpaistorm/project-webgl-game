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
// all room ids that have started a game
let startedGamerooms = [];
// character statuses of all game rooms
let characterStatus = {};
let nameToRoom = {};

// WebSocket handlers
io.on('connection', function(socket) {
    console.log(`user ${socket.id} connected. `);

    socket.on('disconnect', function(){
        console.log(`user ${socket.id} disconnected`);
    });

    // check all game rooms, join if there exists an unfilled room
    socket.on('enqueuePlayer', function(){
        // if there's an available room, join it
        if(roomStatus.length > 0){
            console.log(roomStatus);
            roomStatus.forEach((room) =>{
                if(room.size < 4){
                    socket.join(room.name, (err) => {
                        if(err) console.error("Error joining room");
                    });
                    room.size++;
                    return;
                }
            })
        }
        // there is no available room, create one with own name
        let roomName = `${socket.id}room`;
        socket.join(roomName, (err) => {
            if(err) console.error("Error joining room");
        });
        roomStatus.push({name:roomName, size:1});
    });

    socket.on('resolveQueue', () =>{
        console.log('resolving game queue');
        let rooms = io.sockets.adapter.rooms;
        roomStatus.forEach((room) =>{
            if(room.size >= 2){
                // store started room id
                startedGamerooms.push(room.name);
                // notify every player in the room to start game 
                console.log(rooms[room.name]);
                io.sockets.in(room.name).emit('gamestart', rooms[room.name].sockets, room.name);
            }else{
                if(room.name in rooms){
                    socket.leave(room.name);
                }
            }
        });
        roomStatus = [];
    });    

    // socket.on('gamestarted', (players, roomId) =>{
    //     if(!(roomId in characterStatus)){
    //         characterStatus[roomId] = players;
    //     }
    // });

    // socket.on('playerKeydown', (roomId, keyCode) =>{
    //     io.sockets.to(roomId).emit('playerKeydown', socket.id, keyCode);
    // });

    // socket.on('playerKeyup', (roomId, keyCode) =>{
    //     io.sockets.to(roomId).emit('playerKeyup', socket.id, keyCode);
    // });

    socket.on('updateCharacters', (room, character) =>{
        if(!(character.name in characterStatus)){
            characterStatus[character.name] = character;
            nameToRoom[character.name] = room;
        }else{
            characterStatus[character.name].absoluteXPos = character.absoluteXPos;
            characterStatus[character.name].absoluteYPos = character.absoluteYPos;   
        }
        io.sockets.to(room).emit(
            'updateCharacters', characterStatus[character.name]);
    });

    // setInterval(function updateCharacters(){ 
    //     Object.keys(characterStatus).forEach((name) =>{
    //         io.sockets.to(nameToRoom[name]).emit(
    //             'updateCharacters', characterStatus[name]);
    //     });
    // },1000);
});

const PORT = 3000;

httpServer.listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});