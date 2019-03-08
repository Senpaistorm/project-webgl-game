(function(){
	"use strict";

  window.addEventListener('load', function(){
    	/* Main Method */
		function BombMan() {
			this.core = new app.Core();
			this.gui = new app.Gui(this.core);
			this.characters = [];
			//this.character = new app.Character('myChar', 0, 0, 2, 1, 1);
			this.core.addGameListener(this.gui);
		}

		var game = new BombMan();
    	var gameplay = new app.Gameplay(game.characters);
		//game.core.startNewGame(gameplay);

		window.addEventListener('keydown', function(e){
			game.gui.keyboardEvent[e.keyCode] = true;

			if(e.keyCode == 74) game.gui.onBombPlaced();
		});

		window.addEventListener('keyup', function(e) {
			game.gui.keyboardEvent[e.keyCode] = false;
		});

		let socket = io();

		socket.on('gamestart', (players) =>{
			console.log(players);
			Object.keys(players).forEach((player) =>{
				let newChar = new app.Character(player, Math.floor(Math.random()*15), Math.floor(Math.random()*15), 2, 1, 1);
				game.characters.push(newChar);
			});
			console.log(game.characters);
			game.core.startNewGame(gameplay);
		});

		let roomId = null;
		document.getElementById('play_game_btn').addEventListener('click', async ()=>{
			// notify server to enqueue player
			socket.emit('enqueuePlayer');
			let promise = new Promise((resolve, reject) =>{
				setTimeout(() => {resolve("done");},3000);
			});
			await promise;
			// stay in queue for some seconds, then resolve
			socket.emit('resolveQueue', socket.id);
		});


	});
})();