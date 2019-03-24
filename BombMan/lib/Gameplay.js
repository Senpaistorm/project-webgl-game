/**
 * Gameplay on the server to manage the state of the gameboard and players.
 */
const Character = require('./Character');
const HashMap = require('hashmap');
const Constants = require('./Constants');
const Util = require('./Util');

// types of materials on the gameboard
const UNBLOCKED = 0;
const SOFTBLOCK = 1;
const BOMB = 2;
const HARDBLOCK = 4;


function Gameplay(map, type, container) {
    // map from socket to character
    this.players = new HashMap();
    this.gameboard = map;
    this.gametype = type;
    this.container = container;
    this.items = Util.setRandomItems(this.gameboard);
    // all the bombs currently in this game
    this.bombs = [];
    // power up items
    this.room = null;
    // game result to be sent once game is over
    this.result = {};
}

/**
 * Add a player with name and socket id
 */
Gameplay.prototype.addPlayer = function (name, id, i){
    this.players.set(id, new Character(name, Constants.initPositions[i].xPos,
        Constants.initPositions[i].yPos, Constants.INIT_SPEED, Constants.INIT_POWER, Constants.INIT_LOAD));
    this.result[name] = {alive: 1};
};

Gameplay.prototype.removePlayer = function(id){
    if (this.players.has(id)) {
        this.result[id].alive = 0;
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

/**
 * Predict player's location in the future, return true if a collision is
 * detected.
 */
Gameplay.prototype._collisionDetection = function(x, y, player) {
    let xOrig = Math.floor((x + 196)/24.2);
    let yOrig = Math.floor((y + 130.5)/24.2);
    let dx = Util._normalize(player.movement.x);
    let dy = Util._normalize(player.movement.y);
    let xPos = Math.floor((x + 196 + (dx * 10 + player.speed))/24.2);
    let yPos = Math.floor((y + 130.5 + (dy * 10 + player.speed))/24.2);
    if(xPos == xOrig && yPos == yOrig) return false;

    if(xPos < 0 || yPos < 0 || xPos >= this.gameboard.length || yPos >= this.gameboard.length){
        return true;
    }
    let location = this.gameboard[xPos][yPos];
    let ret = Util.isCollision(location);
    // in case of diagonal, calculate adjacent collisions
    if(this.isValidPosition(xPos, yPos - dy) && 
            this.isValidPosition(xPos - dx, yPos)){
                
        let collidableX = this.gameboard[xPos - dx][yPos];
        let collidableY = this.gameboard[xPos][yPos - dy];
        ret = ret || (Util.isCollision(collidableX) && Util.isCollision(collidableY));
    }
    return ret;
}

Gameplay.prototype.update = function(){
    var characters = this.getPlayers();

    characters.forEach((character) =>{
        let xOrig = character.xPos;
        let yOrig = character.yPos;
        character.update(this._collisionDetection.bind(this));
        if(Math.abs(character.xPos - xOrig) > 0 || Math.abs(character.yPos - yOrig) > 0){
            this.onPlayerMoveChanged(character);
        }
    })
    
};

Gameplay.prototype.isValidPosition = function(x, y){
    return x >= 0 && x < this.gameboard.length && y >= 0 && y < this.gameboard.length;
}

/**
 * Serialize gameplay to a state for communication usage
 * with the clients
 */
Gameplay.prototype.getState = function(){
    let state = {
        players : this.getPlayers(),
        bombs : this.bombs,
        gameboard : this.gameboard,
        items: this.items,
    };
    return state;
};

Gameplay.prototype.getResult = function(){
    return this.result;
}

/**
 * Change the movement vector of character based on intent of client
 */
Gameplay.prototype.handleKey = function(id, intent){
    var character = this.players.get(id);
    if(!character) return;
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
    return this.isValidPosition(x,y) && Util.unOccupied(this.gameboard[x][y]);
};

/**
 * First, createCallback notifies the clients to create a bomb, 
 * then explodeCallback notifies the clients to explode the bomb after the bomb 
 * has been resolved.
 */
Gameplay.prototype.placeBomb = async function(character, createCallback, explodeCallback){
    let x = character.xPos, y = character.yPos;
    if(!this.isValidBombPosition(x,y)) return null;
    if(!this.canPlaceBomb(character)) return null;
    let myBomb = Util.bomb(x, y, character.power, character.name);
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
        affected.expCoords.push(Util.coord(x,y,0));
        // check for boundaries
        foundRight = x + i >= this.gameboard.length;
        foundLeft = x - i < 0;
        foundDown = y + i >= this.gameboard.length;
        foundUp = y - i < 0;
        // find closest impact
        while(!(foundLeft && foundRight && foundUp && foundDown) && i <= curBomb.power){
            let affectedCoord;
            // check every direction
            if(!foundRight && x + i < this.gameboard.length){
                affectedCoord = Util.coord(x+i, y, this.gameboard[x+i][y]);
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
                affectedCoord = Util.coord(x-i, y, this.gameboard[x-i][y]);
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
            if(!foundDown && y + i < this.gameboard.length){
                affectedCoord = Util.coord(x, y+i, this.gameboard[x][y+i]);
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
                affectedCoord = Util.coord(x, y-i, this.gameboard[x][y-i]);
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
    // remove duplicate coordinates
    affected.expCoords = Util.removeDupCoords(affected.expCoords);
    this.checkPlayerHit(affected.expCoords, this.players);
    this.clearItemsHit(affected.expCoords);
    for(let i = 0; i < affected.blocks.length; i++){
        let block = affected.blocks[i];
        if(block.type == SOFTBLOCK){
            this.gameboard[block.xPos][block.yPos] = UNBLOCKED;
        }
    }
    for(let i = 0; i < affected.bombs.length; i++){
        this.destroyBomb(affected.bombs[i]);
    }
    return affected;
};

Gameplay.prototype.clearItemsHit = function(expCoords){
    expCoords.forEach((expCoord) => {
        let isFree = this.gameboard[expCoord.xPos][expCoord.yPos] == 0;
        if(isFree) this.items[expCoord.xPos][expCoord.yPos] = 0;
    });
}

/**
 * Notify gameplay the new player position
 */
Gameplay.prototype.onPlayerMoveChanged = function(player) {
    //Check if there is any item on the current location
    if(this.items[player.xPos][player.yPos] != 0) {
        player.powerup(this.items[player.xPos][player.yPos]);
        this.items[player.xPos][player.yPos] = 0;
    }
};

/**
 * Check if the game is over
 */
Gameplay.prototype.isGameOver = function(){
    if(this.gametype == Constants.PREPARE_ROOM){
        return false;
    }else {
        return this.players.size <= 1;
    }
}

module.exports = Gameplay;