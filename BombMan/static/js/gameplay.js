(function(window) {
	'use strict'

	/**
	 * The game plug-in interface that use to implement and register games
	 * with Core. This class is where all the game logic from
	 */
	function Gameplay() {
	}

    // Export to window
    window.app = window.app || {};
    window.app.Gameplay = Gameplay;
})(window);