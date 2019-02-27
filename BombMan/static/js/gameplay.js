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
	const HARDBLOCK = 4;

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
		};
	};

	let item = function(x, y, itemType){
		return{
			xPos: x,
			yPos: y,
			type: itemType,
		};
	};

	let coord = function(x, y, type){
		return{
			xPos: x,
			yPos: y,
			type: type,
		};
	};


	function Gameplay() {
		this.gameboard = emptyGameboard();
		this.gameboard = defaultGameboard(this.gameboard);
		// initialize a character
		this.character = character('myChar', 0, 0, 2, 2,2);
		// all the bombs this character currently is placing
		this.bombs = [];
		// power up items
		this.items = [];

		this.left = () => {
			let x = this.character.xPos, y = this.character.yPos;
			if (this.character.xPos > 0 && unOccupied(this.gameboard[x-1][y])){
				this.character.xPos--;
			}
		};

		this.right = () =>{
			let x = this.character.xPos, y = this.character.yPos;
			if (this.character.xPos < GAMEBOARD_SIZE && unOccupied(this.gameboard[x+1][y])){
				this.character.xPos++;
			}
		};

		this.up = () =>{
			let x = this.character.xPos, y = this.character.yPos;
			if (this.character.yPos > 0 && unOccupied(this.gameboard[x][y-1])){
				this.character.yPos--;
			}
		};

		this.down = () => {
			let x = this.character.xPos, y = this.character.yPos;
			if (this.character.yPos < GAMEBOARD_SIZE && unOccupied(this.gameboard[x][y+1])){
				this.character.yPos++;
			}
		};

		this.canPlaceBomb = () => {
			return this.bombs.length < this.character.load;
		};

		this.placeBomb = async (callback) => {
			let x = this.character.xPos, y = this.character.yPos;
			let myBomb = bomb(x, y, this.character.power);
			this.gameboard[x][y] = BOMB;
			this.bombs.push(myBomb);
			let res;
			console.log('bomb placed!');
			//asynchronously wait [speed] seconds
			let promise = new Promise((resolve, reject) =>{
				setTimeout(() => {
					resolve(this.bombExists(myBomb) ? this.explodeBomb(myBomb) : null);
					//res = this.bombExists(myBomb) ? this.explodeBomb(myBomb) : null;
				}, 
				3000);
			});
			//let bombExploding = await promise;
			let result = await promise;
			if(result) callback(result);
		}

		this.explodeBomb = (bombExplode) => {
			let affected = {blocks: [], bombs: [bombExplode]};
			let bombQueue = [bombExplode];
			
			console.log('bomb exploding!');
			let x = bombExplode.xPos, y = bombExplode.yPos, i = 1;
			let foundLeft = false, foundRight = false, foundUp = false, foundDown = false;
			// bfs on queue of exploding bombs
			while(bombQueue.length > 0){
				// find closest impact
				while(!(foundLeft && foundRight && foundUp && foundDown) && i <= bombExplode.power){
					// check for boundaries
					foundRight = x + i >= GAMEBOARD_SIZE;
					foundLeft = x - i < 0;
					foundDown = y + i >= GAMEBOARD_SIZE;
					foundUp = y - i < 0;
					let affectedCoord;

					// check every direction
					if(!foundRight && !unOccupied(this.gameboard[x+i][y])){
						affectedCoord = coord(x+i, y, this.gameboard[x+i][y]);
						if(affectedCoord.type == BOMB){ 
							let impactBomb = this.getBomb(x+i, y);
							bombQueue.push(impactBomb);
							affected.bombs.push(impactBomb);
						}else{
							affected.blocks.push(affectedCoord);
						}
						foundRight = true;
					}
					if(!foundLeft && !unOccupied(this.gameboard[x-i][y])){
						affectedCoord = coord(x-i, y, this.gameboard[x-i][y]);
						if(affectedCoord.type == BOMB){ 
							let impactBomb = this.getBomb(x-i, y);
							bombQueue.push(impactBomb);
							affected.bombs.push(impactBomb);
						}else{
							affected.blocks.push(affectedCoord);
						}
						foundLeft = true;
					}
					if(!foundDown && !unOccupied(this.gameboard[x][y+i])){
						affectedCoord = coord(x, y+i, this.gameboard[x][y+i]);
						if(affectedCoord.type == BOMB){ 
							let impactBomb = this.getBomb(x, y+i);
							bombQueue.push(impactBomb);
							affected.bombs.push(impactBomb);
						}else{
							affected.blocks.push(affectedCoord);
						}
						foundDown = true;
					}
					if(!foundUp && !unOccupied(this.gameboard[x][y-i])){
						affectedCoord = coord(x, y-i, this.gameboard[x][y-i]);
						if(affectedCoord.type == BOMB){ 
							let impactBomb = this.getBomb(x, y-i);
							bombQueue.push(impactBomb);
							affected.bombs.push(impactBomb);
						}else{
							affected.blocks.push(affectedCoord);
						}
						foundUp = true;
					}
					i++;
				}
				this.destroyBomb(bombQueue.shift());
			}
			for(let i = 0; i < affected.bombs.length; i++){
				console.log(this.gameboard);
				let bomb = affected.bombs[i];
				this.gameboard[bomb.xPos][bomb.yPos] = UNBLOCKED;
			}
			for(let i = 0; i < affected.blocks.length; i++){
				let block = affected.blocks[i];
				if(block.type == SOFTBLOCK){
					console.log(this.gameboard);
					this.gameboard[block.xPos][block.yPos] = UNBLOCKED;
				}
			}
			console.log(affected);
			console.log(this.bombs);
			return affected;
		}

		this.getBomb = (x, y) => {
			for(let i = 0; i < this.bombs.length; i++){
				if (this.bombs[i].xPos === x && this.bombs.yPos === y){
					return this.bombs[i];
				}
			}
			return null;
		}

		this.destroyBomb = (bomb) =>{
			for(let i = 0; i < this.bombs.length; i++){
				if (this.bombs[i] === bomb){
					return this.bombs.splice(i,1);
				}
			}
			return null;
		}

		this.bombExists = (myBomb) => {
			for (let i = 0; i < this.bombs.length; i++) {
				if (this.bombs[i] === myBomb) {
					return true;
				}
			}
			return false;
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

	function defaultGameboard(gameboard){
		
		gameboard[7][8] = 1;
		gameboard[10][11] = 1;
		gameboard[3][3] = 1;
		gameboard[2][2] = 1;
		gameboard[2][3] = 1;
		gameboard[4][4] = 1;
		return gameboard;
	}
	

    // Export to window
    window.app = window.app || {};
    window.app.Gameplay = Gameplay;
})(window);