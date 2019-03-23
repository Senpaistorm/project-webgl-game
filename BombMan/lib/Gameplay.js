/**
 * Gameplay on the server to manage the state of the gameboard and players.
 */

// representation of a bomb
let bomb = function(x, y, power, name){
    return{
        xPos: x,
        yPos: y,
        power: power,
        name: name,
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
    this.items = Util.setRandomItems(this.gameboard);
    this.room = null;
}

Gameplay.prototype.addPlayer = function (name, id, i){
    this.players.set(id, new Character(name, Constants.initPositions[i].xPos,
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
    return player;
};

Gameplay.prototype.setRoom = function(roomName) {
    this.room = roomName;
};

Gameplay.prototype.getRoom = function() {
    return this.room;
};

Gameplay.prototype._collisionDetection = function(x, y, player) {
    let xOrig = Math.floor((x + 196)/24.2);
    let yOrig = Math.floor((y + 130.5)/24.2);
    let dx = Util._normalize(player.movement.x);
    let dy = Util._normalize(player.movement.y);
    let xPos = Math.floor((x + 196 + (dx * 8))/24.2);
    let yPos = Math.floor((y + 130.5 + (dy * 8))/24.2);
    if(xPos == xOrig && yPos == yOrig) return false;

    if(xPos < 0 || yPos < 0 || xPos >= GAMEBOARD_SIZE || yPos >= GAMEBOARD_SIZE){
        return true;
    }
    let location = this.gameboard[xPos][yPos];
    let ret = Util.isCollision(location);
    // in case of diagonal, calculate adjacent collisions
    if(Util.isValidPosition(xPos, yPos - dy) && 
            Util.isValidPosition(xPos - dx, yPos)){
                
        let collidableX = this.gameboard[xPos - dx][yPos];
        let collidableY = this.gameboard[xPos][yPos - dy];
        ret = ret || (Util.isCollision(collidableX) && Util.isCollision(collidableY));
    }
    return ret;
}

Gameplay.prototype.update = function(){
    var characters = this.getPlayers();
    for(var i = 0; i < characters.length; i++){
        characters[i].update(this._collisionDetection);
    }
};

Gameplay.prototype.getState = function(){
    let state = {
        players : this.getPlayers(),
        bombs : this.bombs,
        gameboard : this.gameboard,
        items: this.items,
    };

    return state;
    
};

Gameplay.prototype.handleKey = function(id, intent){
    var character = this.players.get(id);
    if(intent.up){
        character.move({y: -1 * character.speed});
    }else if(intent.down){
        character.move({y: 1 * character.speed});
    }else{
        character.move({y: 0});
    }

    if(intent.left){
        character.move({x: -1 * character.speed});
    }else if(intent.right){
        character.move({x: 1 * character.speed});
    }else{
        character.move({x: 0});
    }
};

Gameplay.prototype.canPlaceBomb = function(character){
    let num_bombs = this.bombs.filter(x => x.name == character.name).length;
    return num_bombs < character.load;
}

Gameplay.prototype.isValidBombPosition = function (x, y) {
    return Util.isValidPosition(x,y) && Util.unOccupied(this.gameboard[x][y]);
};

Gameplay.prototype.placeBomb = async function(character, createCallback, explodeCallback){
    let x = character.xPos, y = character.yPos;
    if(!this.isValidBombPosition(x,y)) return null;
    if(!this.canPlaceBomb(character)) return null;
    let myBomb = bomb(x, y, character.power, character.name);
    console.log(`bomb down at ${x} ${y}`);
    createCallback(myBomb);
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
    if(res)	explodeCallback(res);
}

Gameplay.prototype.explode = function(res){

}

Gameplay.prototype.getBomb = function(x, y) {
    for(let i = 0; i < this.bombs.length; i++){
        if (this.bombs[i].xPos == x && this.bombs[i].yPos == y){
            return this.bombs[i];
        }
    }
    return null;
};

Gameplay.prototype.destroyBomb = function(bomb){
    for(let i = 0; i < this.bombs.length; i++){
        if (this.bombs[i] === bomb){
            return this.bombs.splice(i,1);
        }
    }
};

Gameplay.prototype.bombExists = function(myBomb) {
    for (let i = 0; i < this.bombs.length; i++) {
        if (this.bombs[i] === myBomb) {
            return true;
        }
    }
    return false;
};

// check if any player hit by the boom
Gameplay.prototype.checkPlayerHit = function(areaAffected, players) {
    areaAffected.forEach((explodeArea) => {
        players.forEach((player) => {
            if (player.xPos == explodeArea.xPos && player.yPos == explodeArea.yPos) 
                this.removePlayer(player.name);
        });
    });
}

Gameplay.prototype.explodeBomb = function(bombExplode) {
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
    this.checkPlayerHit(affected.expCoords, this.players);
    return affected;
}

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