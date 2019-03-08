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
    	var gameplay;
		//game.core.startNewGame(gameplay);

		window.addEventListener('keydown', function(e){
			game.gui.keyboardEvent[e.keyCode] = true;
			if(roomId){
				socket.emit('playerKeydown', {room:roomId, e:e.keyCode});
			}
			if(e.keyCode == 74) game.gui.onBombPlaced();
		});

		window.addEventListener('keyup', function(e) {
			if(roomId){
				socket.emit('playerKeyup', {room:roomId, e:e.keyCode});
			}
			game.gui.keyboardEvent[e.keyCode] = false;
		});

		let socket = io();
		let roomId = null;
		// initial positions for 4 players
		let initPositions = [{xPos: 0, yPos:0}, {xPos:14, yPos:0},
			 {xPos:0, yPos:14}, {xPos:14, yPos:14}];
		socket.on('gamestart', (players, roomname) =>{
			console.log(players);
			let i = 0;
			roomId = roomname;
			Object.keys(players).forEach((player) =>{
				let newChar = new app.Character(player, initPositions[i].xPos,
					 initPositions[i].yPos, 2, 1, 1);
				game.characters.push(newChar);
				i++;
			});
			console.log(game.characters);
			gameplay = new app.Gameplay(game.characters);
			game.core.startNewGame(gameplay);
		});

		
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