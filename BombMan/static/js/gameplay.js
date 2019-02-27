(function(window) {
	'use strict';

	/**
	 * The game plug-in interface that use to implement and register games
	 * with Core. This class is where all the game logic from
	 */
	const GAMEBOARD_SIZE = 15;
	const UNBLOCKED = 0;
	const SOFTBLOCK = 1;
	const BOMB = 2;
	// const PLAYER1 = 3;
	const HARDBLOCK = 4;

	let character = function(name, xPos, yPos, speed, power, load){
		return{
			name: name,
			xPos: xPos,
			yPos: yPos,
			speed: speed,
			power: power,
			load: load
		};
	};

	function Gameplay() {
		this.gameboard = emptyGameboard();
		this.gameboard[7][8] = 1;
		this.gameboard[10][11] = 1;
		// initialize a character
		this.character = character('myChar', 0, 0, 2, 1, 1);

		this.left = () => {
			let x = this.character.xPos, y = this.character.yPos;
			if (this.character.xPos > 0 && unOccupied(this.gameboard[y][x-1])){
				this.character.xPos--;
			}
		};

		this.right = () =>{
			let x = this.character.xPos, y = this.character.yPos;
			if (this.character.xPos < GAMEBOARD_SIZE && unOccupied(this.gameboard[y][x+1])){
				this.character.xPos++;
			}
		};

		this.up = () =>{
			let x = this.character.xPos, y = this.character.yPos;
			if (this.character.yPos > 0 && unOccupied(this.gameboard[y-1][x])){
				this.character.yPos--;
			}
		};

		this.down = () => {
			let x = this.character.xPos, y = this.character.yPos;
			if (this.character.yPos < GAMEBOARD_SIZE && unOccupied(this.gameboard[y+1][x])){
				this.character.yPos++;
			}
		};

		this.placeBomb = async () => {
			let x = this.character.xPos, y = this.character.yPos;
			this.gameboard[y][x] = BOMB;
			console.log('bomb placed!');
			// asynchronously wait [speed] seconds
			await new Promise((resolve, reject) => setTimeout(resolve, this.character.speed* 1000));
			console.log('bomb exploded!');
			this.gameboard[y][x] = UNBLOCKED;
		};
	}

	let unOccupied = (block) => {
		return !(block == SOFTBLOCK || block == HARDBLOCK || block == BOMB);
	};

	function emptyGameboard(){
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

	

    // Export to window
    window.app = window.app || {};
    window.app.Gameplay = Gameplay;
})(window);