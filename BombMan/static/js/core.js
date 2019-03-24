(function(window) {
	'use strict';

	/**
 	 * The interface by which gameplay can directly interact with the game
 	 * framework.
 	 */

	function Core() {
		this.players = [];
		this.state = null;
	}

	Core.prototype.addGameGui = function(gui) {
		this.gui = gui;
		this.mainPlayer = null;
	};

	Core.prototype.startNewGame = function(gameplay) {
		this.gameplay = gameplay;
		this._notifyNewGameStarted(gameplay);
	};

	Core.prototype.updateGameState = function(state){
		this.state = state;
		let players = state.players;
		players.forEach((cur) =>{
			let absX = cur.absoluteXPos;
			let absY = cur.absoluteYPos;
			this.gui.updatePlayerPosition(cur, absX, absY);
			this.gui.updateModelRotation(cur);
			this.onPlayerMoveChanged(cur);
		});
		this.gui.checkPlayerDeath(players);
	};

	/**
     * Get the list of players that have been added to the framework.
     */
	Core.prototype.getPlayers = function() {
		return this.players;
	};

	/**
	 * Notify gameplay the new player position
	 */
	 Core.prototype.onPlayerMoveChanged = function(player) {
	 	//Check if there is any item on the current location
	 	if(this.gameplay.items[player.xPos][player.yPos] != 0) {
			this.gameplay.items[player.xPos][player.yPos] = 0;
			this.gui.distoryObject(player.xPos, player.yPos);
		}
	 };

    /**
     * Notify gui after bomb explode
     */
    Core.prototype.explode = function(res) {
    	let areaAffected = res.expCoords;
		areaAffected.forEach((position) => {
			this.gui.distoryObject(position.xPos, position.yPos);
			this.gui.createExplosion(position.xPos, position.yPos);
		});

		//clear the items that effected by the bomb
		res.expCoords.forEach((expCoord) => {
			let isBlock = false;

			res.blocks.forEach((block) => {
				if(block.xPos == expCoord.xPos && block.yPos == expCoord.yPos) 
					isBlock = true;
			});
				//Distory item
			if(!isBlock) this.gameplay.items[expCoord.xPos][expCoord.yPos] = 0;
		});

		// Distory the explosive effect
		setTimeout(() => {
			areaAffected.forEach((position) => {
				this.gui.distoryObject(position.xPos, position.yPos);
				if(this.gameplay.items[position.xPos][position.yPos] != 0)
					this.showItem(position.xPos, position.yPos);
			});
	   	}, 200);
	};

	/**
	 * Check if there is an item in location (x,y)
	 */
	Core.prototype.checkItem = function(x, y){
		return this.state.items[x][y] > 0 && this.state.gameboard[x][y] == 0;
	};

	/**
	 * Send to gui the intent of placing a bomb
	 */
	Core.prototype.placeBomb = function(character){
		this.gui.createBomb(character);
	};

	/**
	 * Notify gui display the item
	 */
	Core.prototype.showItem = function(x, y) {
		this.gui.createItem(x, y, this.state.items[x][y]);
	};

	Core.prototype._notifyNewGameStarted = function(gameplay) {
		this.gui.onNewGame(gameplay);
	};

    // Export to window
    window.app = window.app || {};
    window.app.Core = Core;
})(window);