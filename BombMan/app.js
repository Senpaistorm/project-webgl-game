<<<<<<< HEAD
=======
/* jshint esversion: 6 */

>>>>>>> 7e33643150fa0e003aff961ece8179624f1112b9
const path = require('path');
const express = require('express');
const app = express();

<<<<<<< HEAD
const http = require('http');
const httpServer = http.Server(app);

const socketIO = require('socket.io');
const io = socketIO(httpServer);
app.use(express.static('static'));

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});



// WebSocket handlers
io.on('connection', function(socket) {
    console.log("a user connected");
});

// emits a message every 1 second
setInterval(function() {
    io.sockets.emit('message', 'hi!');
  }, 1000);

const PORT = 3000;

httpServer.listen(PORT, function (err) {
=======
app.use(express.static('static'));

const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
>>>>>>> 7e33643150fa0e003aff961ece8179624f1112b9
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});