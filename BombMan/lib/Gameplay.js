/**
 * Gameplay on the server to manage the state of the gameboard and players.
 */
// representation of a bomb
let bomb = function(x, y, power){
    return{
        xPos: x,
        yPos: y,
        power: power,
    };
};

const GAMEBOARD_SIZE = 15;
// types of materials on the gameboard
const UNBLOCKED = 0;
const SOFTBLOCK = 1;
const BOMB = 2;
const HARDBLOCK = 4;
// initial speed of the characters
const INIT_SPEED = 3;
// powerup items
const POWER_ITEM = 1;
const SPEED_ITEM = 2;
const BOMB_ITEM = 3;
const ITEM_PROC_RATE = 0.5;


let coord = function(x, y, type){
    return{
        xPos: x,
        yPos: y,
        type: type,
    };
};

const Character = require('./Character');
const HashMap = require('hashmap');
const Constants = require('./Constants');
const Util = require('./Util');

function Gameplay() {
    // map from socket to character
    this.players = new HashMap();
    this.gameboard = Util.defaultGameboard();

    // all the bombs currently in this game
    this.bombs = [];
    // power up items
    this.items = setRandomItems(this.gameboard);
    this.room = null;
    // this.canPlaceBomb = () => {
    // 	return this.bombs.length < this.character.load;
    // };
}

Gameplay.prototype.addPlayerList = function(sList){
    let i = 0;
    sList.forEach((sid) => {
        this.addPlayer(sid, sid, i++);
    });
};

Gameplay.prototype.addPlayer = function (name, sid, i){
    this.players.set(sid, new Character(name, Constants.initPositions[i].xPos,
        Constants.initPositions[i].yPos, Constants.INIT_POWER, Constants.INIT_SPEED, Constants.INIT_LOAD));
};

Gameplay.prototype.removePlayer = function(id){
    if (this.players.has(id)) {
        return this.players.remove(id);
    }
};

Gameplay.prototype.getPlayers = function() {
    return this.players.values();
};

Gameplay.prototype.getPlayerBySocketId = function(id) {
    var player = this.players.get(id);
    if (player) {
      return player.name;
    }
    return null;
};

Gameplay.prototype.setRoom = function(roomName) {
    this.room = roomName;
};

Gameplay.prototype.getRoom = function() {
    return this.room;
};

Gameplay.prototype.checkCollision = function(absoluteXPos, absoluteYPos){
    let x = Math.floor((absoluteXPos + 196)/24.2);
    let y = Math.floor((absoluteYPos + 130.5)/24.2);
    return unOccupied(this.gameboard[x][y]);
}

Gameplay.prototype.update = function(){
    var characters = this.getPlayers();
    for(var i = 0; i < characters.length; i++){
        characters[i].update(this.checkCollision);
    }
};

Gameplay.prototype.sendState = function(){
    //console.log(`broadcasting gamestate to ${this.room}`);
};

Gameplay.prototype.handleKey = function(id, intent){
    var character = this.players.get(id);
    if(intent.up){
        character.move({y: -1});
    }else if(intent.down){
        character.movement.y = 1;
    }
    if(intent.left){
        character.movement.x = -1;
    }else if(intent.right){
        character.movement.x = 1;
    }
    if(intent.bomb){
        this.placeBomb(character);
    }
}

Gameplay.prototype.placeBomb = async (character) => {
    let x = character.xPos, y = character.yPos;
    if(!this.isValidPosition(x,y)) return null;
    let myBomb = bomb(x, y, character.power);
    this.gameboard[x][y] = BOMB;
    this.bombs.push(myBomb);
    let res;
    //asynchronously wait [speed] seconds
    let promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("done");
        }, 
        3000);
    });
    await promise;
    // explode bomb if it still exists
    res = this.bombExists(myBomb) ? this.explodeBomb(myBomb) : null;
    if(res)	this.core.explode(res.expCoords);
}

Gameplay.prototype.getBomb = (x, y) => {
    for(let i = 0; i < this.bombs.length; i++){
        if (this.bombs[i].xPos == x && this.bombs[i].yPos == y){
            return this.bombs[i];
        }
    }
    return null;
};

Gameplay.prototype.destroyBomb = (bomb) =>{
    for(let i = 0; i < this.bombs.length; i++){
        if (this.bombs[i] === bomb){
            return this.bombs.splice(i,1);
        }
    }
};

Gameplay.prototype.bombExists = (myBomb) => {
    for (let i = 0; i < this.bombs.length; i++) {
        if (this.bombs[i] === myBomb) {
            return true;
        }
    }
    return false;
};

// check if any player hit by the boom
Gameplay.prototype.checkPlayerHit = (areaAffected, players) => {
    areaAffected.forEach((explodeArea) => {
        players.forEach((player) => {
            if (player.xPos == explodeArea.xPos && player.yPos == explodeArea.yPos) 
                this.core.removePlayer(player.name);
        });
    });
}

Gameplay.prototype.isValidPosition = (x, y) => {
    return x >= 0 && x < GAMEBOARD_SIZE && y >= 0 && y < GAMEBOARD_SIZE && unOccupied(this.gameboard[x][y]);
};

Gameplay.prototype.explodeBomb = (bombExplode) => {
    let affected = {blocks: [], bombs: [], expCoords: []};
    let bombQueue = [bombExplode];
    let foundLeft , foundRight, foundUp, foundDown;
    let x , y , i;
    
    // bfs on queue of exploding bombs
    while(bombQueue.length > 0){
        let curBomb = bombQueue.shift();
        x = curBomb.xPos, y = curBomb.yPos, i = 1;
        affected.expCoords.push(coord(x,y,0));
        // check for boundaries
        foundRight = x + i >= GAMEBOARD_SIZE;
        foundLeft = x - i < 0;
        foundDown = y + i >= GAMEBOARD_SIZE;
        foundUp = y - i < 0;
        // find closest impact
        while(!(foundLeft && foundRight && foundUp && foundDown) && i <= curBomb.power){
            let affectedCoord;
            // check every direction
            if(!foundRight && x + i < GAMEBOARD_SIZE){
                affectedCoord = coord(x+i, y, this.gameboard[x+i][y]);
                if(affectedCoord.type != HARDBLOCK)
                    affected.expCoords.push(affectedCoord);
                if(affectedCoord.type == BOMB){ 
                    let impactBomb = this.getBomb(x+i, y);
                    bombQueue.push(impactBomb);
                }else if(affectedCoord.type != UNBLOCKED){
                    affected.blocks.push(affectedCoord);
                }
                foundRight = this.gameboard[x+i][y] != UNBLOCKED;
            }
            if(!foundLeft && x - i >= 0){
                affectedCoord = coord(x-i, y, this.gameboard[x-i][y]);
                if(affectedCoord.type != HARDBLOCK)
                    affected.expCoords.push(affectedCoord);
                if(affectedCoord.type == BOMB){ 
                    let impactBomb = this.getBomb(x-i, y);
                    bombQueue.push(impactBomb);
                }else if(affectedCoord.type != UNBLOCKED){
                    affected.blocks.push(affectedCoord);
                }
                foundLeft =  this.gameboard[x-i][y] != UNBLOCKED;
            }
            if(!foundDown && y + i < GAMEBOARD_SIZE){
                affectedCoord = coord(x, y+i, this.gameboard[x][y+i]);
                if(affectedCoord.type != HARDBLOCK)	
                    affected.expCoords.push(affectedCoord);
                if(affectedCoord.type == BOMB){ 
                    let impactBomb = this.getBomb(x, y+i);
                    bombQueue.push(impactBomb);
                }else if(affectedCoord.type != UNBLOCKED){
                    affected.blocks.push(affectedCoord);
                }
                foundDown = this.gameboard[x][y+i] != UNBLOCKED;
            }
            if(!foundUp && y - i >= 0){
                affectedCoord = coord(x, y-i, this.gameboard[x][y-i]);
                if(affectedCoord.type != HARDBLOCK)
                    affected.expCoords.push(affectedCoord);
                if(affectedCoord.type == BOMB){ 
                    let impactBomb = this.getBomb(x, y-i);
                    bombQueue.push(impactBomb);
                }else if(affectedCoord.type != UNBLOCKED){
                    affected.blocks.push(affectedCoord);
                }
                foundUp = this.gameboard[x][y-i] != UNBLOCKED;
            }
            i++;
        }
        affected.bombs.push(curBomb);
        this.gameboard[curBomb.xPos][curBomb.yPos] = UNBLOCKED;
    }
    for(let i = 0; i < affected.blocks.length; i++){
        let block = affected.blocks[i];
        if(block.type == SOFTBLOCK){
            this.gameboard[block.xPos][block.yPos] = UNBLOCKED;
        }
    }
    for(let i = 0; i < affected.bombs.length; i++){
        this.destroyBomb(affected.bombs[i]);
    }
    // remove duplicate coordinates
    affected.expCoords = removeDupCoords(affected.expCoords);
    return affected;
}

let unOccupied = (block) => {
    return !(block == SOFTBLOCK || block == HARDBLOCK || block == BOMB);
};

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


function removeDupCoords(coords) {
    let unique = {};
    let res = [];
    coords.forEach(function(c) {
        if(!unique[[c.xPos,c.yPos]]) {
        unique[[c.xPos,c.yPos]] = true;
        res.push(coord(c.xPos,c.yPos,0));
        }
    });
    return res;
}

module.exports = Gameplay;