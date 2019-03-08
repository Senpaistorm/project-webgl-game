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

	// Core.prototype._notifyGameChange = function(gameplay) {
	// 	this.gameListener.forEach((listener) => {
	// 		listener.onGameChange(gameplay);
	// 	});
	// };

    // Export to window
    window.app = window.app || {};
    window.app.Core = Core;
})(window);