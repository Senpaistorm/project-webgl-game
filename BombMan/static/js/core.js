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

	Core.prototype.getPlayer = function(name){
		return this.players.find(x => x.name === name);
	}

	/**
	 * Update character position with a vector
	 */
	Core.prototype.updatePositions = function(players) {
		let i = 0;
		
		for(i; i<players.length;i++){
			this.getPlayer(players[i].name).updatePositionAbs(players[0].absoluteXPos, players[0].absoluteYPos);
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
    Core.prototype.explode = function(areaAffected) {
    	this.gameplay.checkPlayerHit(areaAffected, this.players);
		areaAffected.forEach((position) => {
			this.gui.distoryObject(position.xPos, position.yPos);
			this.gui.createExplosion(position.xPos, position.yPos);
		});

		// Distory the explosive effect
		setTimeout(() => {
			areaAffected.forEach((position) => {
				this.gui.distoryObject(position.xPos, position.yPos);
			});
	   	}, 200);
	}

	Core.prototype._notifyNewGameStarted = function(gameplay) {
		this.gui.onNewGame(gameplay);
	};

	// keyboard handler and notify gui about the change
	Core.prototype.keyDown = function(e) {
		let character = this.getMainPlayer();
		console.log(character);
		if(e.keyCode == PLACEBOMB && this.gameplay.isValidPosition(character.xPos, character.yPos)) {
			this.gui.createBomb(character);
			this.gameplay.placeBomb(character);
		}

		if(e.keyCode != PLACEBOMB 
			&& movementToVector[e.keyCode].keyDown == false) {
			console.log("move");

			movementToVector[e.keyCode].keyDown = true;
			vector.x += movementToVector[e.keyCode].x;
			vector.y += movementToVector[e.keyCode].y;
			//A vector represents the player's movement
			this.gui.changePlayerMovement(vector);
		}
	}

	Core.prototype.keyUp = function(e) {
		if (e.keyCode != PLACEBOMB && this.getMainPlayer()) {
			movementToVector[e.keyCode].keyDown = false;
			vector.x -= movementToVector[e.keyCode].x;
			vector.y -= movementToVector[e.keyCode].y;
			this.gui.changePlayerMovement(vector);
		}
	}

    // Export to window
    window.app = window.app || {};
    window.app.Core = Core;
})(window);