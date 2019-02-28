(function(window) {
	'use strict';

	/**
	 * The core implementation, connectes gui(view) and gameplay(model) and act as
	 * the controller between them
	 */
	function Core() {
		this.gameListener = [];

	}

	Core.prototype.addGameListener = function(listener) {
		this.gameListener.push(listener);
	};

	Core.prototype.startNewGame = function(gameplay) {
		this.gameplay = gameplay;
		this._notifyNewGameStarted(gameplay);
	};

	//private function
	Core.prototype._notifyNewGameStarted = function(gameplay) {
		this.gameListener.forEach((listener) => {
			listener.onNewGame(gameplay);
		});
	};

	// keyboard handler
	Core.prototype.onKeyDown = function(e) {
		console.log(e.keyCode);
		switch(e.keyCode){
			case 65: // A
				this.gameplay.left();
				break;
			case 68: // D
				this.gameplay.right();
				break;
			case 83: // S
				this.gameplay.down();
				break;
			case 87: // W
				this.gameplay.up();
				break;
			case 74: // J
				if(this.gameplay.canPlaceBomb()){
					//this._notifyBombPlaced(myBomb)
					this.gameplay.placeBomb(this._notifyGameChange);
				}
				break;
			default:
				break;
		}
		console.log(this.gameplay.character);
	};

	Core.prototype._notifyGameChange = function(affectedBlocks) {
		console.log(affectedBlocks);
		// this.gameListener.forEach((listener) => {
		// 	listener.onGameChange(gameplay);
		// });
	};

    // Export to window
    window.app = window.app || {};
    window.app.Core = Core;
})(window);