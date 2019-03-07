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

let playerQueue = [];

// WebSocket handlers
io.on('connection', function(socket) {
    console.log(`a user ${socket.id} connected. `);
    socket.on('disconnect', function(){
        console.log(`user ${socket.id} disconnected`);
    });

    // push a player's socket id into the queue
    socket.on('enqueuePlayer', function(){
        playerQueue.push(socket);
    });

    socket.on('dequeuePlayer', function(){
    });    

    let resolveQueue = function(){
        if(playerQueue.length >= 4){
            let players = playerQueue.splice(0,4);
            players.forEach(function(p){
                p.emit()
            })
        }
    }

});

const PORT = 3000;

httpServer.listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});