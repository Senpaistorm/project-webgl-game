(function(){
	"use strict";

  window.addEventListener('load', function(){
    	/* Main Method */
		function BombMan() {
			this.core = new app.Core();
			this.gui = new app.Gui(this.core);
			this.core.addGameGui(this.gui);
		}

		let showGame = () =>{
			document.getElementById('homepage').style.display = "none";
			document.getElementById('world').style.display = "block";
		}

		let hideGame = () =>{
			document.getElementById('homepage').style.display = "block";
			document.getElementById('world').style.display = "none";
		}

		var game = new BombMan();
		var gameplay;
		hideGame();

		let roomId = null;
		// initial positions for 4 players

		window.addEventListener('keydown', function(e){
			if(isValidKey(e.keyCode) && game.core.getMainPlayer()) game.core.keyDown(e);
			// if(roomId && game.gui._hasMovement()){
			// 	socket.emit('playerKeydown', roomId, e.keyCode);
			// }
		});

		window,addEventListener('keyup', function(e) {
			if(isValidKey(e.keyCode) && game.core.getMainPlayer()) game.core.keyUp(e);
			// if(roomId){
			// 	socket.emit('playerKeyup', roomId, e.keyCode);
			// }
		});

		socket.on('updateCharacters', (character) =>{
			if(character.name != game.core.getMainPlayer().name){
				game.core.updatePositions(character);
			}
		});

		socket.on('gamestart', (players, roomname) =>{
			let i = 0;
			roomId = roomname;
			Object.keys(players).forEach((player) =>{
				let newChar = new app.Character(player, initPositions[i].xPos,
					 initPositions[i].yPos, INIT_SPEED, 1, 1);
				if(socket.id == player){
					game.core.addPlayer(newChar, true);
				}else{
					game.core.addPlayer(newChar);
				}
				i++;
			});

			gameplay = new app.Gameplay();
			game.core.startNewGame(gameplay);
			showGame();
			socket.emit('gamestart', game.core.getPlayers(), roomId);
		});

		setInterval(function updateCharacters(){ 
			if(game.core.getMainPlayer()){
				socket.emit('updateCharacters', roomId, game.core.getMainPlayer());
			}
		},1000/30);
		// socket.on('playerKeyup', (sid, keyCode) => {
		// 	game.core.setStop(socket.id, keyCode);
		// });

		// socket.on('playerKeydown', (sid, keyCode) => {
		// 	game.core.setMovement(socket.id, keyCode);
		// });

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