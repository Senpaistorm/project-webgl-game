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

Util.defaultGameboard = () => {
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