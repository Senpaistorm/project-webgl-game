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

	/**
	 * Update character position 
	 */
	Core.prototype.updatePositions = function(player) {
		for(let i = 0; i < this.getPlayers().length; i++){
			if(player.name == this.getPlayers()[i].name){
				this.getPlayers()[i].updatePositionAbs(player.absoluteXPos, player.absoluteYPos, player.rotation);
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
		if(e.keyCode == PLACEBOMB && this.gameplay.isValidPosition(character.xPos, character.yPos)) {
			this.gui.createBomb(character);
			this.gameplay.placeBomb(character);
		}

		if(e.keyCode != PLACEBOMB 
			&& movementToVector[e.keyCode].keyDown == false) {
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