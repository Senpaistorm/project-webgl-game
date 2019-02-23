# Bomb Man

## About Us
Xiang Li
Jinze Li

## About the Application
Bomb Man is a WebGL based 3D multi-player game. The number of players in a single game can be 2-4. The goal of Bomber Man is to eliminate your opponent by placing your bombs in tactical positions. You can get closer to your opponent by blasting your way through the obstacles.

## Beta Version 
In the Beta version, all basic game mechanics will be implemented. We will not worry about user signin/signup or authentication. Players are put in a queue whenever they open the website. The server refreshes periodically to check the number of players in queue. A game can be started with at least 2 players in queue.

## Final Version
In the Final version, we will implement user signin/signup and a game menu. The game menu will allow players to choose a game mode to queue in (free-for-all, 1v1, 2v2). It will also allow players to choose their character. Different characters will have different starting stats. We will also support multiple game maps.

## Technologies
* WebGL - JavaScript API for rendering interactive 2D and 3D graphics 
* three.js - easy to use, lightweight, 3D library. The library provides Canvas 2D, SVG, CSS3D and WebGL renderers.
* WebRTC - provides web browsers and mobile applications with real-time communication 
* HTML, CSS, Javascript - frontend browser rendering
* node.js - backend


## Top Challenges
* integrating several APIs (WebGL, WebRTC, three.js, backend) 
* real time synchronization with WebRTC
* 3D graphics rendering with three.js
* 2D User interface (game menu)
* Player queue implementation
