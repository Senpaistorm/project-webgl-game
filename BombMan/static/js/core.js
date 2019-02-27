(function(window) {
	'use strict'

	/**
	 * The core implementation, connectes gui(view) and gameplay(model) and act as
	 * the controller between them
	 */
	function Core() {
		this.gameListener = [];
	};

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

	window.addEventListener('keydown', (e) => {
		console.log(e.keyCode);
		switch(e.keyCode){
			case 65: // A
				console.log('move left');
				break;
			case 68: // D
				console.log('move right');
				break;
			case 83: // S
				console.log('move down');
				break;
			case 87: // W
				console.log('move up');
				break;
		}
	});
    // Export to window
    window.app = window.app || {};
    window.app.Core = Core;
})(window);