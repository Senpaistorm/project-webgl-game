(function(window) {
	'use strict';

	/**
	 * The core implementation, connectes gui(view) and gameplay(model) and act as
	 * the controller between them
	 */
	function Core() {
		this.gameListener = [];
		this.gameplay = null;
	}

	Core.prototype.addGameListener = function(listener) {
		this.gameListener.push(listener);
	};

	Core.prototype.startNewGame = function(gameplay) {
		this.gameplay = gameplay;
		this._notifyNewGameStarted(gameplay);
	};

	Core.prototype._notifyNewGameStarted = function(gameplay) {
		this.gameListener.forEach((listener) => {
			listener.onNewGame(gameplay);
		});
	};
	// // keyboard handler
	// Core.prototype.onKeyDown = function(e) {
	// 	console.log(e.keyCode);
	// 	if(this.gameplay != null) {
	// 		switch(e.keyCode){
	// 			case 65: // A
	// 				this.gameplay.left();
	// 				break;
	// 			case 68: // D
	// 				this.gameplay.right();
	// 				break;
	// 			case 83: // S
	// 				this.gameplay.down();
	// 				break;
	// 			case 87: // W
	// 				this.gameplay.up();
	// 				break;
	// 			case 74: // J
	// 				this.gameplay.placeBomb();
	// 				break;
	// 			default:
	// 				break;
	// 		}
	// 	}
	// };

	// Core.prototype.onKeyUp = function(e) {
	// }

	// Core.prototype._notifyGameChange = function(gameplay) {
	// 	this.gameListener.forEach((listener) => {
	// 		listener.onGameChange(gameplay);
	// 	});
	// };

    // Export to window
    window.app = window.app || {};
    window.app.Core = Core;
})(window);