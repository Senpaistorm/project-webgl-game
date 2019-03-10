(function(){
	"use strict";

  window.addEventListener('load', function(){
    	/* Main Method */
		function BombMan() {
			this.core = new app.Core();
			this.gui = new app.Gui(this.core);
			this.characters = [];
			this.core.addGameListener(this.gui);
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

		window.addEventListener('keydown', function(e){
			game.gui.keyboardEvent[e.keyCode] = true;
			if(roomId){
				socket.emit('playerKeydown', {room:roomId, keyCode:e.keyCode});
			}
			if(e.keyCode == 74) game.gui.onBombPlaced();
		});

		window.addEventListener('keyup', function(e) {
			if(roomId){
				socket.emit('playerKeyup', {room:roomId, keyCode:e.keyCode});
			}
			game.gui.keyboardEvent[e.keyCode] = false;
		});

		let socket = io();
		let roomId = null;
		// initial positions for 4 players

		socket.on('gamestart', (players, roomname) =>{
			console.log(players);
			let i = 0;
			let myChar;
			roomId = roomname;
			Object.keys(players).forEach((player) =>{
				let newChar = new app.Character(player, initPositions[i].xPos,
					 initPositions[i].yPos, 2, 1, 1);
				if(socket.id == player){
					myChar =  newChar;
				}else{
					game.characters.push(newChar);
				}
				i++;
			});
			console.log(myChar);
			console.log(game.characters);
			gameplay = new app.Gameplay(myChar, game.characters);
			game.core.startNewGame(gameplay);
			showGame();
		});

		socket.on('playerKeyup', (keyData) => {
			console.log(keyData);
		});

		socket.on('playerKeydown', (keyData) => {
			console.log(keyData);
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