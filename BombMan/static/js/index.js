(function(){
	"use strict";

  	window.addEventListener('load', function(){
    	/* Main Method */
		function BombMan() {
			this.core = new app.Core();
			this.gui = new app.Gui(this.core);
			this.core.addGameGui(this.gui);
		}

		let game;
		var updateInterval = null;
		let roomId = null;
		let intent = {
			'up': 0,
			'down': 0,
			'left': 0,
			'right': 0,
		};

		hideGame();
		socket.emit('load');

		socket.on('newGame', function(message=''){
			showRoomMainMenu();
			socket.emit('load');
			showErrorMessage(message);
		});

		if(localStorage.getItem('username')){
			usernameChanged();
		}else{
			document.getElementById('username_prompt').style.display = "block";
			document.getElementById('username_prompt_form').addEventListener('submit', (e) => {
				e.preventDefault();
				let username = document.getElementById('username_prompt_input').value;
				socket.emit('isRegsistered', username, (success) => {
					if(success) {
						localStorage.setItem('username', username);
						usernameChanged();
					} else {
						showErrorMessage('username is already taken');
					}
				});
			});
		}

		function usernameChanged(){
			let username = localStorage.getItem('username');
			document.getElementById('username_prompt').style.display = "none";
			socket.emit('socketChange', username, (newusername) => {
				document.getElementById('player_info').innerHTML = `
					<p>Name: ${newusername}</p>
					<p>ID: ${socket.id}</p>
				`;
			});
		}
		
		window.addEventListener('resize', onWindowResize, false );

		function onWindowResize(){	
			game.gui.resize();
		}

		/**
		 * Keyboard listener for pressing a valid key
		 */
		window.addEventListener('keydown', function(e){
			switch(e.keyCode){
				case UP: intent.up = 1; break;
				case DOWN: intent.down = 1; break;
				case LEFT: intent.left = 1; break;
				case RIGHT: intent.right = 1; break;
				case PLACEBOMB: socket.emit('placeBomb', {room: roomId}); break;
				case 80: // P : Debug key USED FOR DEVELOPMENT
					console.log('DEBUG');
					console.log(game.core.state);
					toggleGameOver();
					localStorage.clear();
				break;
			}
		});

		/**
		 * Keyboard listener for releasing a valid key
		 */
		window,addEventListener('keyup', function(e) {
			switch(e.keyCode){
				case UP: intent.up = 0; break;
				case DOWN: intent.down = 0; break;
				case LEFT: intent.left = 0; break;
				case RIGHT: intent.right = 0; break;
			}
		});

		/**
		 *  receive game state
		 * 'players': player information
		 * 'bombs': bomb information
		 * 'gameboard': gameboard information
		 * */ 
		socket.on('gamestate', function(state){
			if(game) game.core.updateGameState(state);
		}); 

		// socket handler for starting a game
		socket.on('gamestart', (gameplay, room) =>{
      
			if(game) game.gui.stopAnimate();
			game = new BombMan();

			roomId = room;
			game.core.startNewGame(gameplay);
			
			if(gameplay.gametype == GAME){
				showGame();
			}
			if(!updateInterval){
				updateInterval = setInterval(updateGameState, 1000/30);
			}
		});

		socket.on('bombPlaced', (bomb) => {
			game.core.placeBomb(bomb);
		});

		socket.on('explode', (res) => {
			game.core.explode(res);
		});

		socket.on('onInvite', (username) => {
			document.querySelector('.complex_form').innerHTML = `
				<div class="form_title">${username} invites you to his/her game</div>
      			<button type="submit" class="form_btn" id = "positive_btn">Join</button>
      			<button class="form_btn" id = "negative_btn">Cancel</button>
			`;
			//accept btn
			document.getElementById('positive_btn').addEventListener('click', () => {
				document.querySelector('.complex_form').innerHTML = ``;
				joinRoom(username);
			});
			//cancel btn
			document.getElementById('negative_btn').addEventListener('click', () => {
				document.querySelector('.complex_form').innerHTML = ``;
			});
		});

		// socket handler for starting a game
		socket.on('gameover', (result) =>{
			socket.emit('leaveRoom', roomId);
			toggleGameOver(result);
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
			promise = new Promise((resolve, reject) =>{
				resolve(socket.emit('resolveQueue', socket.id));
			});
			await promise;
			if(roomId == socket.id) setNoGameFoundMsg();
		});

		//Invite player btn
		document.getElementById('invite_player_btn').addEventListener('click',  () => {
			document.querySelector('.complex_form').innerHTML = `
				<div class="form_title">Invite player</div>
      			<input type="text" class="form_element" placeholder="username" name="user_name">
      			<button type="submit" class="form_btn" id = "positive_btn">Invite</button>
      			<button class="form_btn" id = "negative_btn">Cancel</button>
			`;

			document.querySelector('.complex_form').addEventListener('submit', function(e){        
	        	e.preventDefault();
            	let id = document.querySelector(".form_element").value;
            	document.querySelector('.complex_form').innerHTML = ``;
            	invitePlayer(id);
        	}); 

			//cancel btn
			document.getElementById('negative_btn').addEventListener('click', () => {
				document.querySelector('.complex_form').innerHTML = ``;
			});
		});

		//join room btn
		document.getElementById('join_room_btn').addEventListener('click', () => {
			document.querySelector('.complex_form').innerHTML = `
				<div class="form_title">Join Room</div>
      			<input type="text" id="join_room_form" class="form_element" placeholder="room number" name="user_name">
      			<button type="submit" class="form_btn" id = "positive_btn">Join</button>
      			<button class="form_btn" id = "negative_btn">Cancel</button>
			`;

			document.querySelector('.complex_form').addEventListener('submit', function(e){        
	        	e.preventDefault();
            	let id = document.querySelector("#join_room_form").value;
            	document.querySelector('.complex_form').innerHTML = ``;
            	joinRoom(id);
        	});  

			//cancel btn
			document.getElementById('negative_btn').addEventListener('click', async () => {
				document.querySelector('.complex_form').innerHTML = ``;
			});
		});

		document.getElementById('exit_room_btn').addEventListener('click', () => {
			socket.emit('exitRoom', roomId);
		});

		function updateGameState(){ 
			socket.emit('player_action', {'room': roomId, 'intent':intent});
		}
	});

	let joinRoom = (userId) => {
		socket.emit('joinRoom', userId, (success) => {
			if(success) {
				showRoomParticipantMenu();
			}
			else showErrorMessage('Cannot join room');
		});
	}

	let invitePlayer = (userId) => {
		socket.emit('invitePlayer', userId);
	}

	let showRoomParticipantMenu = () => {
		document.getElementById('play_game_btn').style.visibility = 'hidden';
		document.getElementById('invite_player_btn').style.visibility = 'hidden';
		document.getElementById('join_room_btn').style.visibility = 'hidden';
		document.getElementById('exit_room_btn').style.visibility = 'visible';
	}

	let showRoomMainMenu = () => {
		document.getElementById('play_game_btn').style.visibility = 'visible';
		document.getElementById('invite_player_btn').style.visibility = 'visible';
		document.getElementById('join_room_btn').style.visibility = 'visible';
		document.getElementById('exit_room_btn').style.visibility = 'hidden';
	}

	let showGame = () =>{
		let msg = document.getElementById('queue_msg');
		msg.innerHTML = ``;
		document.querySelector('#gameover_modal').style.display = "none";
		document.getElementById('homepage').style.display = "none";
		document.getElementById('world').style.display = "block";
	}

	let hideGame = () =>{
		document.getElementById('homepage').style.display = "block";
		document.getElementById('world').style.display = "none";
	}

	let setQueueMsg = () => {
		let msg = document.getElementById('queue_msg');
		msg.innerHTML = `Looking for players <div class="loader"></div>`;
	}

	let showErrorMessage = (message) => {
		document.getElementById('error_msg').innerHTML = message;
	}

	let setNoGameFoundMsg = () => {
		let msg = document.getElementById('queue_msg');
		msg.innerHTML = `
		<div id="game_not_found">No games were found. Please try again later</div>
		`;
	}

	let toggleGameOver = (result=null) => {
		if(document.querySelector('#gameover_modal').style.display == "none"){
			document.querySelector('#gameover_modal').style.display = "block";
		}else{
			document.querySelector('#gameover_modal').style.display = "none";
		}
		if(document.querySelector('#gameover_modal').style.display == "block"){
			let button = document.createElement("button");
			button.id = "back_btn";
			button.innerHTML = "Back to menu";
			let cont = document.getElementById('gameover_modal_content');
			cont.innerHTML = `<div>
			${makeResultTable(result)}
			</div>`;
			button.addEventListener("click", function(){
				hideGame();
				showRoomMainMenu();
				socket.emit('backToMenu');
			});
			cont.appendChild(button);
		}
	}

	let makeResultTable = (result) => {
		let res = `<div class="Table">
								<div class="Title">
										<p>Game Results</p>
								</div>
								<div class="Heading">
								<div class="Cell">
										<p>Name</p>
								</div>
								<div class="Cell">
										<p>Status</p>
								</div>
								</div>`;
		for(const id in result){
			res += `<div class="Row">
									<div class="Cell">
											<p>${id}</p>
									</div>
									<div class="Cell">
											<p>${result[id].alive ? "Alive" : "Dead"}</p>
									</div>
							</div>`;
		}						
		res += `</div>`;
		return res;
	}

})();