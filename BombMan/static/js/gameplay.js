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


	function Gameplay(character) {
		this.gameboard = emptyGameboard();
		this.gameboard = defaultGameboard(this.gameboard);
		// initialize a character
		this.character = character;
		// all the bombs this character currently is placing
		this.bombs = [];
		// power up items
		this.items = [];

		this.isValidPosition = (x, y) => {
			return x > 0 && x < GAMEBOARD_SIZE && y > 0 && y < GAMEBOARD_SIZE && unOccupied(this.gameboard[x][y]);
		}

		this.left = () => {
			let x = this.character.xPos, y = this.character.yPos;
			if (this.character.xPos > 0 && unOccupied(this.gameboard[x-1][y])){
				this.character.xPos--;
			}
		};

		this.right = () =>{
			let x = this.character.xPos, y = this.character.yPos;
			this.character.isMoveingRight = true;

			if (this.character.xPos < GAMEBOARD_SIZE && unOccupied(this.gameboard[y][x+1])){
				this.character.xPos++;
			}
		};

		this.up = () =>{
			let x = this.character.xPos, y = this.character.yPos;
			this.character.isMoveingUp = true;

			if (this.character.yPos > 0 && unOccupied(this.gameboard[y-1][x])){
				this.character.yPos--;
			}
		};

		this.down = () => {
			let x = this.character.xPos, y = this.character.yPos;
			this.character.isMovingDown = true;

			if (this.character.yPos < GAMEBOARD_SIZE && unOccupied(this.gameboard[y+1][x])){
				this.character.yPos++;
			}
		};


		this.canPlaceBomb = () => {
			return this.bombs.length < this.character.load;
		};

		this.placeBomb = async (x, y, callback) => {
			let myBomb = bomb(x, y, this.character.power);
			this.gameboard[x][y] = BOMB;
			this.bombs.push(myBomb);
			let res;
			console.log('bomb placed!');
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
			if(res) callback(res);
			//this.destroyBomb(myBomb);
		}

		this.explodeBomb = (bombExplode) => {
			let affected = {blocks: [], bombs: [], expCoords: []};
			let bombQueue = [bombExplode];
			let foundLeft , foundRight, foundUp, foundDown;
			let x , y , i;
			console.log('bomb exploding!');
			
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
			console.log("destroying bombs");
			for(let i = 0; i < affected.bombs.length; i++){
				this.destroyBomb(affected.bombs[i]);
			}
			console.log(affected.expCoords);
			// remove duplicate coordinates
			affected.expCoords = removeDupCoords(affected.expCoords);
			return affected;
		}

		this.getBomb = (x, y) => {
			for(let i = 0; i < this.bombs.length; i++){
				if (this.bombs[i].xPos == x && this.bombs[i].yPos == y){
					return this.bombs[i];
				}
			}
			return null;
		};

		this.destroyBomb = (bomb) =>{
			for(let i = 0; i < this.bombs.length; i++){
				if (this.bombs[i] === bomb){
					return this.bombs.splice(i,1);
				}
			}
		};

		this.bombExists = (myBomb) => {
			for (let i = 0; i < this.bombs.length; i++) {
				if (this.bombs[i] === myBomb) {
					return true;
				}
			}
			return false;
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

	function defaultGameboard(gameboard){
		gameboard[7][8] = 1;
		gameboard[10][11] = 1;
		gameboard[1][2] = HARDBLOCK;
		gameboard[3][3] = 1;
		gameboard[2][2] = 1;
		gameboard[2][3] = 1;
		gameboard[4][4] = 1;
		return gameboard;
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

    // Export to window
    window.app = window.app || {};
    window.app.Gameplay = Gameplay;
})(window);