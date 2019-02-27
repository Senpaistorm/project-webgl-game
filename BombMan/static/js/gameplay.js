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
	const COUNTDOWN = 0;
	const EXPLODING = 1;

	// representation of a player's character
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

	// representation of a bomb
	let bomb = function(x, y, power){
		return{
			xPos: x,
			yPos: y,
			power: power,
			status: COUNTDOWN,
		};
	};

	let item = function(x, y, itemType){
		return{
			xPos: x,
			yPos: y,
			type: itemType,
		};
	};


	function Gameplay() {
		this.gameboard = emptyGameboard();
		this.gameboard[7][8] = 1;
		this.gameboard[10][11] = 1;
		// initialize a character
		this.character = character('myChar', 0, 0, 2, 1, 1);
		// all the bombs this character currently is placing
		this.bombs = [];
		// power up items
		this.items = [];

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

		this.canPlaceBomb = () => {
			return this.bombs.length < this.character.load;
		};

		this.placeBomb = async () => {
			let x = this.character.xPos, y = this.character.yPos;
			let myBomb = bomb(x, y, this.character.power);
			this.gameboard[y][x] = BOMB;
			this.bombs.push(myBomb);
			console.log('bomb placed!');
			//asynchronously wait [speed] seconds
			let promise = new Promise((resolve, reject) =>{
				setTimeout(() => resolve(this.explodeBomb(myBomb)), this.character.speed * 1000);
			});
			//let bombExploding = await promise;
			let bombs = await promise;
			return bombs;
		}

		this.explodeBomb = (bombExplode) => {

			
			console.log('bomb exploding!');
			this.bombs.forEach(function(bomb){
				if( bomb.xPos == bombExplode.xPos && bomb.yPos == bombExplode.yPos){
					bomb.status = EXPLODING;
				}
			});
			let x = bombExplode.xPos, y = bombExplode.yPos, i = 1;
			let foundLeft = false, foundRight = false, foundUp = false, foundDown = false;
			// find closest impact
			while(!(foundLeft && foundRight && foundUp && foundDown) && i <= bombExplode.power){
				// check for boundaries
				// check every direction
				if(!unOccupied(this.gameboard[y][x+i])){
					foundRight = true;
				}
				else if(!unOccupied(this.gameboard[y][x-i])){
					foundLeft = true;
				}
				else if(!unOccupied(this.gameboard[y+1][x])){
					foundDown = true;
				}
				else if(!unOccupied(this.gameboard[y-1][x])){
					foundUp = true;
				}
				i++;
			}


			return bombs;
		}
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