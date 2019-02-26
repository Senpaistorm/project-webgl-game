(function(window) {
	'use strict'

	/**
	 * The game plug-in interface that use to implement and register games
	 * with Core. This class is where all the game logic from
	 */
	function Gameplay() {
		this.gameboard = [];
		for(var i = 0; i < 15; i++){
			this.gameboard.push([1,1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
		}
	}

    // Export to window
    window.app = window.app || {};
    window.app.Gameplay = Gameplay;
})(window);