(function(){
	"use strict";

    window.addEventListener('load', function(){
    	/* Main Method */
		function BombMan() {
			this.core = new app.Core();
			this.gui = new app.Gui(this.core);
			this.characters = [new app.Character('myChar', 0, 0, 2, 1, 1), new app.Character('myChar', 0, 0, 2, 1, 1)];
			this.core.addGameListener(this.gui);
		}



		var game = new BombMan();
    	var gameplay = new app.Gameplay(game.characters);
		game.core.startNewGame(gameplay);

		window.addEventListener('keydown', function(e){
			game.gui.keyboardEvent[e.keyCode] = true;
			if(e.keyCode == 74) game.gui.onBombPlaced();
		});

		window,addEventListener('keyup', function(e) {
			game.gui.keyboardEvent[e.keyCode] = false;
		});
    });

})();