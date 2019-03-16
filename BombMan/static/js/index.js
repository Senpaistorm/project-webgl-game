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
		var gameplay;
		hideGame();
		let roomId = null;

		window.addEventListener('keydown', function(e){
			if(isValidKey(e.keyCode) && game.core.getMainPlayer()){
				game.core.keyDown(e);
				if(e.keyCode == PLACEBOMB){
					socket.emit('placeBomb', roomId, game.core.getMainPlayer());
				}
			}
		});

		window,addEventListener('keyup', function(e) {
			if(isValidKey(e.keyCode) && game.core.getMainPlayer()) game.core.keyUp(e);
		});

		// socket handler for updating character position
		socket.on('updateCharacters', (character) =>{
			if(!game.core.getMainPlayer() || game.core.getMainPlayer().name != character.name){
				game.core.updatePositions(character);
			}
		});

		// socket handler for starting a game
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
	
			// send to the server information about main player on this client
			setInterval(function updateCharacters(){ 
				if(game.core.getMainPlayer()){
					socket.emit('updateCharacters', roomId, game.core.getMainPlayer());
				}
			},1000/30);
		});

		// socket handler for bombs being placed
		socket.on('placeBomb', (character) => {
			if(!game.core.getMainPlayer() || game.core.getMainPlayer().name != character.name){
				game.core.gui.createBomb(character);
				game.core.gameplay.placeBomb(character);
			}
		});

		document.getElementById('play_game_btn').addEventListener('click', async ()=>{
			// notify server to enqueue player
			socket.emit('enqueuePlayer');
			setQueueMsg();
			let promise = new Promise((resolve, reject) =>{
				setTimeout(() => {resolve("done");},6000);
			});
			await promise;
			// stay in queue for some seconds, then resolve
			if(!roomId)	socket.emit('resolveQueue', socket.id);
			if(!roomId) setNoGameFoundMsg();
		});



	});


	let showGame = () =>{
		document.getElementById('homepage').style.display = "none";
		document.getElementById('world').style.display = "block";
	}

	let hideGame = () =>{
		document.getElementById('homepage').style.display = "block";
		document.getElementById('world').style.display = "none";
	}

	let setQueueMsg = () => {
		let msg = document.getElementById('queue_msg');
		msg.innerHTML = `
		Looking for players <div class="loader"></div>
		`;
	}

	let setNoGameFoundMsg = () => {
		let msg = document.getElementById('queue_msg');
		msg.innerHTML = `
		<div id="game_not_found">No games were found. Please try again later</div>
		`;
	}


})();