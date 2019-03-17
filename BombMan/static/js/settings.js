// dimensions of the gameboard
const GAMEBOARD_SIZE = 15;
// types of materials on the gameboard
const UNBLOCKED = 0;
const SOFTBLOCK = 1;
const BOMB = 2;
const HARDBLOCK = 4;
// valid input keycodes
const LEFT = 65;
const DOWN = 83;
const UP = 87;
const RIGHT = 68;
const PLACEBOMB = 74;
// initial speed of the characters
const INIT_SPEED = 2;
// powerup items
const POWER_ITEM = 1;
const SPEED_ITEM = 2;
const BOMB_ITEM = 3;
const ITEM_PROC_RATE = 0.5;

let movementToVector = { 65: {x:-1 ,y: 0, keyDown: false}, 
83: {x: 0, y: 1, keyDown: false},
87: {x: 0, y:-1, keyDown: false},
68: {x: 1, y: 0, keyDown: false}};

// let movementToRotation = {
// 	f
// }

let isValidKey = function(keyCode) {
    return keyCode == UP || keyCode == DOWN || keyCode == LEFT || keyCode == RIGHT || keyCode == PLACEBOMB; 
}

let initPositions = [{xPos: 0, yPos:0}, {xPos:14, yPos:0},
    {xPos:0, yPos:14}, {xPos:14, yPos:14}];
