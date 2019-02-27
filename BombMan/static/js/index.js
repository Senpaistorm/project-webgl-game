(function(){
	"use strict";

	/* Main Method */
	function BombMan() {
		this.core = new app.Core();
		this.gui = new app.Gui(this.core);
		this.core.addGameListener(this.gui);
	}

    window.addEventListener('load', function(){
    	var game = new BombMan();
		game.core.startNewGame(new app.Gameplay());
		
		window.addEventListener('keydown', function(e){
			game.core.onKeyDown(e);
		});
    });
})();