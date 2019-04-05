# Bomb Man

## About Us
* Xiang Li
* Jinze Li

## About the Application
Bomb Man is a WebGL based 3D multi-player game. The number of players in a single game can be 2-4. The goal of Bomb Man is to eliminate your opponent by placing your bombs in tactical positions. You can get closer to your opponent by blasting your way through the obstacles. The player side that eliminates all other players wins.  
[Web Socket Documentation](BombMan)
[Game Module Documentation](BombMan/lib)

### [Live Game](https://bombman.me)
### [Demo](https://youtu.be/liAVEiFeZ7k)

## Beta Version 
In the Beta version, all basic game mechanics will be implemented. Players can queue for a game whenever they open the website. The server refreshes periodically to check the number of players in queue. A game can be started with at least 2 players in queue. We will have one basic map ready for play. 

### Controls: 
* W: Up
* S: Down
* A: Left
* D: Right
* J: Place Bomb

## Final Version
In the Final version, we will implement a game menu, power-up items, and in-game chat! The game menu will allow players to practice controls in a mini game room. The game menu also lets users to join/invite other players' game room by providing a username. It will also allow players to start a game with their friends. Power-up items gives players the ability to walk faster, place more bombs, and place more powerful bombs.

## Technologies
* WebGL - JavaScript API for rendering interactive 2D and 3D graphics 
* three.js - easy to use, lightweight, 3D library. The library provides Canvas 2D, SVG, CSS3D and WebGL renderers.
* socket.io - a javascript library that provides web browsers with real-time communication 
* HTML, CSS, Javascript - frontend browser rendering
* node.js - backend server


## Top Challenges
* integrating several APIs (WebGL, socket.io, three.js, backend) 
* real time synchronization with socket.io
* 3D graphics rendering with three.js
* 2D User interface (game menu)
* Player queue implementation
