# Bomb Man

## Web Socket Documentation

The application uses the socket.io library as real-time communication tool between a single server and all clients. A socket gets created and connected to the server upon opening the web app in the browser. Clients(index.js) and server(app.js) communicate with each other with an event-based method. Data can be sent by with .emit(eventName, data) and received with .on(eventName, data).

### Client Socket Listeners

* event name: `newGame`
    - description: fired whenever client joins a new game or finishes a previous game
    - args: message(string, optional): error message

* event name: `addMessage`
    - description: add another user's message onto the ingame chat
    - args: message(string): message to be added

* event name: `gamestate`
    - description: receive game state from the server and call updateGameState from core
    - args: state(object): gamestate containing players, gameboard information, etc. more details in server module's Gameplay.prototype.getState

* event name: `showParticipentMenu`
    - description: when you join another player's room, hide game menu buttons and only show Exit Game button
    - args: none

* event name: `gamestart`
    - description: fired when a game is started, notify frontend core and gui
    - args: 
        - gameplay(object): contains raw JSON data from server's Gameplay object
        - room(string): the room name

* event name: `bombPlaced`
    - description: fired when server successfully places a bomb, call the frontend handler and notify gui
    - args: bomb(object): bomb object that contains x,y coordinates and its power

* event name: `explode`
    - description: fired when server is exploding a bomb, call the frontend handler and notify gui
    - args: res(object): contains affected coordinates and exploding coordinates for gui's rendering

* event name: `onInvite`
    - description: listener for when another client invites this client
    - args: username(string): the inviter's username

* event name: `gameover`
    - description: fired when server detects a game that is over, update gui and display gameover modal
    - args: result(object): game result object, see Gameplay.prototype.getResult for more details

* event name: `inQueue`
    - description: notifies the client that it is placed in a queue
    - args: none


### Server Socket Listeners

* event name : `load`
    - description: load the prepare room, fired upon frontend's load event
    - args: none

* event name: `socketChange`
    - description: map the existing username to a new socket
    - args: 
        - username: (string) the username
        - callback: (function) sent by the client to update ui

* event name: `isRegistered`
    - description: check if a given name is already registered
    - args: 
        - name: (string) username to check
        - callback: (function) call the callback function on true if the username already exists, false otherwise

* event name: `invitePlayer`
    - description: invite another player specified by userId to join room, emit to the other player an 'onInvite' event if it exists
    - args: userId(string) the username to be invited

* event name: `joinRoom`
    - description: join another player's room if available
    - args: 
        - username: (string) the username whose room that you want to join
        - callback: (string) used by the client to update ui, call the function on true if successfully join room, false otherwise

* event name: `message`
    - description: send a message to all other sockets in the this socket's room
    - args: message:(string) the message to be sent

* event name: `exitRoom`
    - description: fired when a player wants to exit room
    - args: roomId:(string) the room name that player wants to exit

* event name: `backToMenu`
    - description: fired when a player wants to go back to the main menu
    - args: none

* event name: `enqueuePlayer`
    - description: a player is queueing for a game, place that player on the server's game queue
    - args: none

* event name: `resolveQueue`
    - description: fired after a period of time after a client queues for a game, start games for game rooms with greater than 2 players
    - args: none

* event name: `player_action`
    - description: find the game specified by the room provided and handle the input from the client
    - args: object
        - room: (string) the room id
        - intent: (object) the keyboard input converted to intent, more details in index.js

* event name: `leaveRoom`
    - description: remove the socket from a given room
    - args: room: (string) the room id
