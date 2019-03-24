function Constants() {
    throw new Error('Constants should not be instantiated!');
}

Constants.INIT_SPEED = 1.5;
Constants.INIT_POWER = 1;
Constants.INIT_LOAD = 1;

Constants.GAMEBOARD_SIZE = 15;
// types of materials on the gameboard
Constants.UNBLOCKED = 0;
Constants.SOFTBLOCK = 1;
Constants.BOMB = 2;
Constants.HARDBLOCK = 4;

Constants.ITEM_PROC_RATE = 0.4;

Constants.GAME = 1;
Constants.PREPARE_ROOM = 2;
Constants.POWER_ITEM = 1;
Constants.SPEED_ITEM = 2;
Constants.BOMB_ITEM = 3;

Constants.PROOM_CONT = 'homepage';
Constants.GAME_CONT = 'world';

Constants.SPEED_LIMIT = 4.5;
Constants.LOAD_LIMIT = 8;
Constants.POWER_LIMIT = 10;

Constants.initPositions = [{xPos: 0, yPos:0}, {xPos:14, yPos:0},
    {xPos:0, yPos:14}, {xPos:14, yPos:14}];

if (typeof module === 'object') {
    /**
     * If Constants is loaded as a Node module, then this line is called.
     */
    module.exports = Constants;
} else {
    /**
     * If Constants is loaded into the browser, then this line is called.
     */
    window.Constants = Constants;
}