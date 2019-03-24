(function(window) {
	'use strict';

	//child class of gameplay, the game logic of prepare room
	function Prepareroom() {

		app.Gameplay.call(this);

		this.container = 'homepage';

		this.gametype = PREPARE_ROOM;

		this.gameboardsize = 7;

		this.gameboard = [[0,0,0,0,0,0,0],
						  [0,4,0,4,0,4,0],
						  [0,0,0,0,0,0,0],
						  [0,4,0,4,0,4,0],
						  [0,0,0,0,0,0,0],
						  [0,4,0,4,0,4,0],
						  [0,0,0,0,0,0,0]];

		this.items = [[0,0,0,0,0,0,0],
				      [0,4,0,4,0,4,0],
					  [0,0,0,0,0,0,0],
					  [0,4,0,4,0,4,0],
					  [0,0,0,0,0,0,0],
					  [0,4,0,4,0,4,0],
					  [0,0,0,0,0,0,0]];
		this.checkPlayerHit = (areaAffected, players) => {
			//players will not get hit
		}
	}

    // Export to window
    window.app = window.app || {};
    window.app.Prepareroom = Prepareroom;
})(window);