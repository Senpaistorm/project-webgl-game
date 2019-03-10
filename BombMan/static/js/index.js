(function(){
	"use strict";

    window.addEventListener('load', function(){
    	/* Main Method */
		function BombMan() {
			this.core = new app.Core();
			this.gui = new app.Gui(this.core);
			this.core.addGameGui(this.gui);
		}

		var game = new BombMan();
    	var gameplay = new app.Gameplay();
		game.core.startNewGame(gameplay);
		game.core.addPlayer(new app.Character('mainPlayer', 0, 0, 2, 1, 1), true);
		game.core.addPlayer(new app.Character('otherPlayer', 0, 0, 2, 1, 1));

		window.addEventListener('keydown', function(e){
			if(game.core.isValidKey(e.keyCode) && game.core.getMainPlayer()) game.core.keyDown(e);
		});

		window,addEventListener('keyup', function(e) {
			if(game.core.isValidKey(e.keyCode) && game.core.getMainPlayer()) game.core.keyUp(e);
		});
    });

})();