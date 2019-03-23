(function(window) {
	'use strict'

	/**
	 * The listener class. This class is responsible for displaying
	 * the GUI to the screen, and for forwarding events to
	 * Core class when Gui-related events are detected.
	 * In addition, Core calls these methods to notify the Gui
 	 * when it should update its display
	 */
	const STARTING_X = -185.5;
	const STARTING_Y = -120;
	const BLOCK_SIZE = 24.2;

	function Gui(core) {
		this.core = core;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(72, (window.innerWidth)/(window.innerHeight), 1, 10000);
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.autoClear = false;
		this.renderer.autoClearDepth = false;
		this.container = document.getElementById('world');
		this.keyboardEvent = {};
		this.playerMovement = {x:0, y:0};
		this.animationFrameID = null;
	}

	Gui.prototype.onNewGame = function(gameplay) {
		console.log(gameplay);
		this._init();
		this.gameplay = gameplay;
		this._createGameBoard(gameplay.gameboard);
		this.createCharacters(gameplay.players);
		this._animate();
	};

	// Called this method when player is moving along with the given vector 
	// direction
	Gui.prototype.changePlayerMovement = function(vector) {
		if(vector.x != 0 || vector.y != 0)
			this.playerMovement = vector;
	}

	Gui.prototype.createCharacters = function(characters) {
		console.log(characters._data);
		for(const data in characters._data){
			let character = characters._data[data];
			console.log(character[1]);
			this.createCharacter(character[1]);
		}
	}

	Gui.prototype.createCharacter = function(character) {
		gameobject.createCharactorModel(character.absoluteXPos, character.absoluteYPos, character.color, (mesh) => {
			this.scene.add(mesh);
		});
	}

	Gui.prototype.createBomb = function(character) {
		let x = character.xPos;
		let y = character.yPos;

		if(this.gameplay.isValidPosition(x, y)) {
			gameobject.createBomb(x, y, (mesh) => {
				this.gameboardMesh[x][y] = mesh;
				this.scene.add(mesh);
			});
		}
	}
	
	/**
	 * Destory charactor model of given character
	 */
	Gui.prototype.removePlayer = function(character) {
		this.scene.remove(character.model);
	}

	/**
	 * Destory everything (except ground) on the given position
	 */
	Gui.prototype.distoryObject = function(x, y) {
		let mesh = this.gameboardMesh[x][y];

		if(mesh) {
			this.gameboardMesh[x][y] = null;
			this.scene.remove(mesh);
		}
	}

	Gui.prototype.createExplosion = function(x, y) {
		gameobject.createExplosion(STARTING_X + x * BLOCK_SIZE, STARTING_Y + y * BLOCK_SIZE, (mesh) => {
			this.gameboardMesh[x][y] = mesh;
			this.scene.add(mesh);
		});
	}

	Gui.prototype.createItem = function(x, y, itemType) {
		let mesh = gameobject.createItem(x, y, itemType);
		if(mesh) {
			this.gameboardMesh[x][y] = mesh;
			this.scene.add(mesh);
		}
	}

	Gui.prototype._init = function() {
		this._createScene();
		this._createLights();
	};

	Gui.prototype._createGameBoard = function(gameboard) {
		this.gameboardMesh = new Array(gameboard.length);

		for(let i = 0; i < gameboard.length; i ++) {
			this.gameboardMesh[i] = new Array(gameboard[i].length);

			for(let j = 0; j < gameboard[i].length; j ++) {
				gameobject.createStandardBox(STARTING_X + i * BLOCK_SIZE, STARTING_Y + j * BLOCK_SIZE, (mesh) => {
					this.scene.add(mesh);
				});

				if(gameboard[i][j] == SOFTBLOCK){
					gameobject.createNormalBlock(STARTING_X + i * BLOCK_SIZE, STARTING_Y + j * BLOCK_SIZE, (mesh) => {
						this.gameboardMesh[i][j] = mesh;
						this.scene.add(mesh);
					});
				}else if(gameboard[i][j] == HARDBLOCK){
					gameobject.createHardBlock(STARTING_X + i * BLOCK_SIZE, STARTING_Y + j * BLOCK_SIZE, (mesh) => {
						this.gameboardMesh[i][j] = mesh;
						this.scene.add(mesh);
					});
				}
			}
		}

		for(let i = 0; i < gameboard.length+2; i ++) {
			gameobject.createHardBlock(STARTING_X + (i-1) * BLOCK_SIZE, STARTING_Y - BLOCK_SIZE, (mesh) => {
				this.scene.add(mesh);
			});
			gameobject.createHardBlock(STARTING_X + (i-1) * BLOCK_SIZE, STARTING_Y + gameboard.length * BLOCK_SIZE, (mesh) => {
				this.scene.add(mesh);
			});
		}
		for(let i = 0; i < gameboard.length; i ++) {
			gameobject.createHardBlock(STARTING_X - BLOCK_SIZE, STARTING_Y + i * BLOCK_SIZE, (mesh) => {
				this.scene.add(mesh);
			});
			gameobject.createHardBlock(STARTING_X + gameboard.length * BLOCK_SIZE, STARTING_Y + i * BLOCK_SIZE, (mesh) => {
				this.scene.add(mesh);
			});
		}
	}

	Gui.prototype._createScene = function() {
		this.scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
		this.camera.position.x = 0;
		this.camera.position.y = 320;
		this.camera.position.z = 200;
		this.camera.lookAt(new THREE.Vector3(0,-200,0));

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.container.appendChild(this.renderer.domElement);
	}

	Gui.prototype._createLights = function() {
        let hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, 1.0)

        let shadowLight = new THREE.DirectionalLight(0xffffff, .9);

        shadowLight.position.set(150, 350, 350);

        shadowLight.castShadow = true;
        shadowLight.shadow.camera.left = -400;
        shadowLight.shadow.camera.right = 400;
        shadowLight.shadow.camera.top = 400;
        shadowLight.shadow.camera.bottom = -400;
        shadowLight.shadow.camera.near = 1;
        shadowLight.shadow.camera.far = 1000;

        shadowLight.shadow.mapSize.width = 2048;
        shadowLight.shadow.mapSize.height = 2048;
        this.scene.add(hemisphereLight);  
        this.scene.add(shadowLight);	
    }

	Gui.prototype._animate = function() {
		//this.animationFrameID = window.requestAnimationFrame(this._frame.bind(this));
		//this.renderer.render(this.scene, this.camera);
		//Player movement
		setInterval(this._frame.bind(this), 1000/30);
		//this._frame();
	}

	Gui.prototype._frame = function() {
		this.renderer.render(this.scene, this.camera);
	}

	Gui.prototype.stopAnimate = function() {
		if(this.animationFrameID) window.cancelAnimationFrame(this.animationFrameID);
	}

	/**
	 * If the player currently standing on a bomb, the function checks if the next step of the player after the movement
	 * contains any object or not. it will return false if the player is not standing on a bomb or the player's next step is invalid
	 */
	Gui.prototype._onBombDoesNextStepisValid = function() {
		let character = this.core.getMainPlayer();

		if (this.gameboardMesh[character.xPos][character.yPos] == null || this.gameboardMesh[character.xPos][character.yPos].name != "bomb")
			return false;

		let x = (this.playerMovement.x == 0)? character.xPos: character.xPos + this.playerMovement.x / Math.abs(this.playerMovement.x);
		let y = (this.playerMovement.y == 0)? character.yPos: character.yPos + this.playerMovement.y / Math.abs(this.playerMovement.y);

		return x >= 0 && x <= 14 && y >= 0 && y <= 14 && this.gameboardMesh[x][y] == null;
	}

	Gui.prototype._hasMovement = function() {
		console.log(this.playerMovement.x, this.playerMovement.y);
		return this.playerMovement.x != 0 || this.playerMovement.y != 0;
	}

	/**
	 * Calculate where player might be in the future based on its movement
	 * , return true if this location is blocked
	 */
	Gui.prototype._collisionDetection = function(x, y) {
		let xOrig = Math.floor((x + 196)/24.2);
		let yOrig = Math.floor((y + 130.5)/24.2);
		let dx = this._normalize(this.playerMovement.x);
		let dy = this._normalize(this.playerMovement.y);
		let xPos = Math.floor((x + 196 + (dx * 8))/24.2);
		let yPos = Math.floor((y + 130.5 + (dy * 8))/24.2);
		if(xPos == xOrig && yPos == yOrig) return false;

		if(xPos < 0 || yPos < 0 || xPos >= GAMEBOARD_SIZE || yPos >= GAMEBOARD_SIZE){
			return true;
		}
		let location = this.gameplay.gameboard[xPos][yPos];
		let ret = isCollision(location);
		// in case of diagonal, calculate adjacent collisions
		if(this.isValidPosition(xPos, yPos - dy) && 
				this.isValidPosition(xPos - dx, yPos)){
					
			let collidableX = this.gameplay.gameboard[xPos - dx][yPos];
			let collidableY = this.gameplay.gameboard[xPos][yPos - dy];
			ret = ret || (isCollision(collidableX) && isCollision(collidableY));
		}
		return ret;
	}

	Gui.prototype._normalize = function(num){
		if(num == 0){
			return 0;
		}else if(num < 0){
			return -1;
		}else{
			return 1;
		}
	};

	Gui.prototype.isValidPosition = function(x, y){
		return x >= 0 && x < GAMEBOARD_SIZE && y >= 0 && y < GAMEBOARD_SIZE;
	}

	// Export to window
	window.app = window.app || {};
	window.app.Gui = Gui;
})(window); 