function Constants() {
    throw new Error('Constants should not be instantiated!');
}

Constants.INIT_SPEED = 3;
Constants.INIT_POWER = 2;
Constants.INIT_LOAD = 3;

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