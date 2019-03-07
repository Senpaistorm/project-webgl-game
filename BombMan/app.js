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

let roomStatus = [];

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
                    socket.join(room.name, (err) => {});
                    room.size++;
                }
            })
            console.log(roomStatus);
        // there is no available room, create one with own name
        }else{
            let roomName = `${socket.id}room`;
            socket.join(roomName, (err) => {});
            roomStatus.push({name:roomName, size:1});
        }

    });

    socket.on('resolveQueue', () =>{
        console.log('resolving game queue');
        resolveQueue(socket.id);
    });    

    let resolveQueue = function(){
        let rooms = io.sockets.adapter.rooms;
        roomStatus.forEach((room) =>{
            if(room.size >= 2){
                // TODO: start game for room room.name
                // store started room id
                // notify every player in the room to start game 
            }else{
                // TODO: leave room for room.name
                io.sockets.clients(room.name).forEach(function(s){
                    s.leave(room.name);
                });
            }
        })
        roomStatus = [];
    }

});

const PORT = 3000;

httpServer.listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});