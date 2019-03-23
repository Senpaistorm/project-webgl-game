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
		this.camera = new THREE.PerspectiveCamera(72, window.innerWidth/window.innerHeight, 1, 10000);
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.autoClear = false;
		this.renderer.autoClearDepth = false;
		this.container = document.getElementById('world');
		this.playersmesh = {};
		this.animationFrameID = null;
	}

	Gui.prototype.onNewGame = function(gameplay) {
		this.gameplay = gameplay;
		this.createCharacters(gameplay.players);
		this._animate();
		this._init();
		this._createGameBoard(gameplay.gameboard, gameplay.gametype);
		this.container = document.getElementById(gameplay.container);
	};

	/**
	 * Update the position of gui representation of a player
	 */
	Gui.prototype.updatePlayerPosition = function(player, x, y) {
		let id = player.name;
		if(this.playersmesh[id]){
			this.playersmesh[id].position.x = x;
			this.playersmesh[id].position.z = y;
		}
	};

	Gui.prototype.createCharacters = function(characters) {
		for(const data in characters._data){
			let character = characters._data[data];
			this.createCharacter(character[1]);
		}
	}

	Gui.prototype.createCharacter = function(character) {
		gameobject.createCharactorModel(character.absoluteXPos, character.absoluteYPos, character.color, (mesh) => {
			this.playersmesh[character.name] = mesh;
			this.scene.add(mesh);
		});
	};

	Gui.prototype.movementAnimation = function(model, bodyPart, movementDirection) {

        if(!model) return;
        model.children[bodyPart].rotation.x = -Math.PI/8 * movementDirection;

        if(bodyPart == CHARACTER_BODY_PART.leftLeg || bodyPart == CHARACTER_BODY_PART.rightLeg) {
            this.model.children[bodyPart].position.z = 2 * movementDirection;
        } else this.model.children[bodyPart].position.z = 4 * movementDirection;
    };

    Gui.prototype.updateModelRotation = function (id, rotation) {
		let model = this.playersmesh[id];
        if(model != null) {
            model.rotation.y = rotation;
            
            //arm and leg will switch movement every frame while moving
            // this.armAndLegSwitchMovement = this.armAndLegSwitchMovement * -1;
            // this.movementAnimation(CHARACTER_BODY_PART.leftLeg, FORWARD * this.armAndLegSwitchMovement);
            // this.movementAnimation(CHARACTER_BODY_PART.rightLeg, BACKWARD * this.armAndLegSwitchMovement);
            // this.movementAnimation(CHARACTER_BODY_PART.rightArm, FORWARD * this.armAndLegSwitchMovement);
            // this.movementAnimation(CHARACTER_BODY_PART.leftArm, BACKWARD * this.armAndLegSwitchMovement);
        }
	};
	
	Gui.prototype.resetAnimation = function() {
		this.movementAnimation(CHARACTER_BODY_PART.leftLeg, STATIC);
		this.movementAnimation(CHARACTER_BODY_PART.rightLeg, STATIC);
		this.movementAnimation(CHARACTER_BODY_PART.rightArm, STATIC);
		this.movementAnimation(CHARACTER_BODY_PART.leftArm, STATIC);
	};

	Gui.prototype.createBomb = function(bomb) {
		let x = bomb.xPos;
		let y = bomb.yPos;
		gameobject.createBomb(x, y, (mesh) => {
			this.gameboardMesh[x][y] = mesh;
			this.scene.add(mesh);
		});
	
	}
	
	Gui.prototype.checkPlayerDeath = function(players){
		let playerIds = Object.keys(this.playersmesh);
		if(players.length != playerIds.length){
			playerIds.forEach((id) =>{
				let index = players.findIndex((player) => {
					return player.name == id;
				});
				if (index == -1) this.removePlayer(id);
			});
		}
	}

	/**
	 * Destory charactor model of given character
	 */
	Gui.prototype.removePlayer = function(id) {
		this.scene.remove(this.playersmesh[id]);
		delete this.playersmesh[id];
	}

	/*
	 * Resize the render
	 */
	Gui.prototype.resize = function(){
	 	this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
	    this.renderer.setSize( window.innerWidth, window.innerHeight );
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

	Gui.prototype._createGameBoard = function(gameboard, gametype) {
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

		if (gametype == GAME) {
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
	}	

	Gui.prototype._createScene = function() {
		this.scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.container.appendChild(this.renderer.domElement);

		if (this.gameplay.gametype == GAME) {
			this.camera.position.x = 0;
			this.camera.position.y = 320;
			this.camera.position.z = 200;
			this.camera.lookAt(new THREE.Vector3(0,-200,0));
		}  else {
			this.camera.position.x = -10;
			this.camera.position.y = 225;
			this.camera.position.z = 90;
			this.camera.lookAt(new THREE.Vector3(0,0,0));
			this.camera.rotation.x = -1;
			this.camera.rotation.y = 0;
			this.camera.rotation.z = 0;
		}

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

	// Export to window
	window.app = window.app || {};
	window.app.Gui = Gui;
})(window); 