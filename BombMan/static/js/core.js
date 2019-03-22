(function(window) {
	'use strict';

	/**
 	 * The interface by which gameplay can directly interact with the game
 	 * framework.
 	 */

	let vector = {x:0, y:0};

	function Core() {
		this.players = [];
	}

	Core.prototype.addGameGui = function(gui) {
		this.gui = gui;
		this.mainPlayer = null;
	};

	Core.prototype.startNewGame = function(gameplay) {
		this.gameplay = gameplay;
		this.gameplay.register(this);
		this._notifyNewGameStarted(gameplay);
	};

	/**
     * Get the list of players that have been added to the framework.
     */
	Core.prototype.getPlayers = function() {
		return this.players;
	}

    /**
     * Adds a player to the game and notifies the GUI about the
     * change.
     */
	Core.prototype.addPlayer = function(character, isMainPlayer = false) {
		this.gui.createCharacter(character);
		if (isMainPlayer) this.setMainPlayer(character);
		this.players.push(character);
	}

	/**
	 *	set character who is control by the current user
	 */
	Core.prototype.setMainPlayer = function(mainPlayer) {
		this.mainPlayer = mainPlayer;
	}

	/**
	 * get player who is control by the current user
	 */
	Core.prototype.getMainPlayer = function() {
		return this.mainPlayer;
	}

	Core.prototype.increaseMainPlayerSpeed = function() {
		if (vector.x < 0) vector.x --;
		else if (vector.x > 0) vector.x ++;

		if (vector.y < 0) vector.y --;
		else if (vector.y > 0) vector.y ++;

		this.gui.changePlayerMovement(vector);
	}

	/**
	 * Notify gameplay the new player position
	 */
	 Core.prototype.onPlayerMoveChanged = function(player=this.mainPlayer) {
	 	//Check if there is any item on the current location
	 	if(this.gameplay.items[player.xPos][player.yPos] != 0) {

			if(this.gameplay.items[player.xPos][player.yPos] == POWER_ITEM) {
				player.power ++;
			} else if(this.gameplay.items[player.xPos][player.yPos] == SPEED_ITEM){
				player.speed ++;
				if (player == this.getMainPlayer()) this.increaseMainPlayerSpeed();
			} else if(this.gameplay.items[player.xPos][player.yPos] == BOMB_ITEM) {
				player.load ++;
			}

			this.gameplay.items[player.xPos][player.yPos] = 0;
			this.gui.distoryObject(player.xPos, player.yPos);
		}
	 }

	/**
	 * Update character position 
	 */
	Core.prototype.updatePositions = function(player) {
		for(let i = 0; i < this.getPlayers().length; i++){
			if(player.name == this.getPlayers()[i].name){
				this.getPlayers()[i].updatePositionAbs(player.absoluteXPos, player.absoluteYPos, player.rotation);
				this.onPlayerMoveChanged(this.getPlayers()[i]);
				return;
			}
		}
	};

	/**
     * Removes a player from the game and notifies the GUI about the
     * change. return false if player is not in the list
     */
    Core.prototype.removePlayer = function(name) {
    	let index = this.players.findIndex((player) => {
    		return player.name == name;
    	});
    	if (index == -1) return false;
    	if (this.mainPlayer != null && this.mainPlayer.name == name) this.mainPlayer = null;
    	this.gui.removePlayer(this.players[index]);
    	this.players.splice(index, 1);
    	console.log(this.players);
    }

    /**
     * Notify gui after bomb explode
     */
    Core.prototype.explode = function(res) {
    	let areaAffected = res.expCoords;
    	this.gameplay.checkPlayerHit(areaAffected, this.players);
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
	}

	/**
	 * Set the item board of gameplay if it hasn't been set
	 */
	Core.prototype.setItems = function(itemboard){
		if(!this.gameplay.items)
			this.gameplay.items = itemboard;
	}

	/**
	 * Notify gui display the item
	 */
	Core.prototype.showItem = function(x, y) {
		this.gui.createItem(x, y, this.gameplay.items[x][y]);
	}

	Core.prototype._notifyNewGameStarted = function(gameplay) {
		this.gui.onNewGame(gameplay);
	};

	// keyboard handler and notify gui about the change
	Core.prototype.keyDown = function(e) {
		let character = this.getMainPlayer();
		if(e.keyCode == PLACEBOMB && this.gameplay.isValidPosition(character.xPos, character.yPos)) {
			this.gui.createBomb(character);
			this.gameplay.placeBomb(character);
		}

		if(e.keyCode != PLACEBOMB 
			&& movementToVector[e.keyCode].keyDown == false) {

			console.log(character.speed);

			movementToVector[e.keyCode].keyDown = true;
			vector.x += movementToVector[e.keyCode].x * character.speed;
			vector.y += movementToVector[e.keyCode].y * character.speed;
			//A vector represents the player's movement
			this.gui.changePlayerMovement(vector);
		}
	}

	Core.prototype.keyUp = function(e) {
	    let character = this.getMainPlayer();

		if (e.keyCode != PLACEBOMB && this.getMainPlayer()) {
			movementToVector[e.keyCode].keyDown = false;
			vector.x -= movementToVector[e.keyCode].x * character.speed;
			vector.y -= movementToVector[e.keyCode].y * character.speed;
			this.gui.changePlayerMovement(vector);
		}
	}

    // Export to window
    window.app = window.app || {};
    window.app.Core = Core;
})(window);