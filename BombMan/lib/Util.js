const Constants = require('./Constants');

const HARDBLOCK = Constants.HARDBLOCK;
const SOFTBLOCK = Constants.SOFTBLOCK;
const BOMB = Constants.BOMB;

function Util() {
    throw new Error('Util should not be instantiated!');
}

Util.emptyGameboard = function(){
    let gameboard = [];
    for(let i = 0; i < GAMEBOARD_SIZE; i++){
        let arr = [];
        for (var j = 0; j < GAMEBOARD_SIZE; j++){
            arr.push(UNBLOCKED);
        }
        gameboard.push(arr);
    }
    return gameboard;
}

Util.defaultGameboard = function() {
    gameboard = [[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],
                    [0,0,1,1,1,0,0,0,0,0,1,1,1,0,0],
                    [1,1,1,1,1,0,0,0,0,0,1,1,1,1,1],
                    [1,1,1,1,1,0,0,4,0,0,1,1,1,1,1],
                    [1,1,1,1,1,0,0,0,0,0,1,1,1,1,1],
                    [1,1,1,0,0,4,0,4,0,4,0,0,1,1,1],
                    [1,1,1,0,0,0,1,1,1,0,0,0,1,1,1],
                    [1,1,1,4,0,4,1,1,1,4,0,4,1,1,1],
                    [1,1,1,0,0,0,1,1,1,0,0,0,1,1,1],
                    [1,1,1,0,0,4,0,4,0,4,0,0,1,1,1],
                    [1,1,1,1,1,0,0,0,0,0,1,1,1,1,1],
                    [1,1,1,1,1,0,0,4,0,0,1,1,1,1,1],
                    [1,1,1,1,1,0,0,0,0,0,1,1,1,1,1],
                    [0,0,1,1,1,0,0,0,0,0,1,1,1,0,0],
                    [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0]];
    return gameboard;
};

Util.setRandomItems = function(gameboard){
    let res = [];
    for(let i = 0; i < Constants.GAMEBOARD_SIZE; i++){
        let arr = [];
        for (var j = 0; j < Constants.GAMEBOARD_SIZE; j++){
            if(Math.random() > Constants.ITEM_PROC_RATE && gameboard[i][j]){
                arr.push(Math.floor(Math.random() * 3 + 1));
            }else{
                arr.push(0);
            }
        }
        res.push(arr);
    }
    return res;
    
}

Util._normalize = function(num){
    if(num == 0){
        return 0;
    }else if(num < 0){
        return -1;
    }else{
        return 1;
    }
};

Util.isValidPosition = function(x, y){
    return x >= 0 && x < Constants.GAMEBOARD_SIZE && y >= 0 && y < Constants.GAMEBOARD_SIZE;
}

Util.isValidBombPosition = function (x, y, block) {
    return Util.isValidPosition(x,y) && Util.unOccupied(block);
};

Util.isCollision = function(material){
	return material == HARDBLOCK || material == SOFTBLOCK
	  || material == BOMB;
}

Util.unOccupied = (block) => {
    return !(block == SOFTBLOCK || block == HARDBLOCK || block == BOMB);
};

if (typeof module === 'object') {
    /**
     * If Util is loaded as a Node module, then this line is called.
     */
    module.exports = Util;
} else {
    /**
     * If Util is loaded into the browser, then this line is called.
     */
    window.Util = Util;
}