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
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 10000);
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.autoClear = false;
		this.renderer.autoClearDepth = false;
		this.container = document.getElementById('world');
		this.keyboardEvent = {};
		this.collisionBox = null;
		this.collidableMeshList = {};
		this.playerMovement = {x:0, y:0};
	}

	Gui.prototype.onNewGame = function(gameplay) {
		this._init();
		this.gameplay = gameplay;
		this._createGameBoard(gameplay.gameboard);
	};

	// Called this method when player is moving along with the given vector 
	// direction
	Gui.prototype.changePlayerMovement = function(vector) {
		if(vector.x != 0 || vector.y != 0)
			this.playerMovement = vector;
	}

	Gui.prototype.createCharacter = function(character) {
		gameobject.createCharactorModel(character.absoluteXPos, character.absoluteYPos, (mesh) => {
			character.setModel(mesh);
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
			delete this.collidableMeshList[mesh.uuid];
		}
	}

	Gui.prototype.createExplosion = function(x, y) {
		gameobject.createExplosion(STARTING_X + x * BLOCK_SIZE, STARTING_Y + y * BLOCK_SIZE, (mesh) => {
			this.gameboardMesh[x][y] = mesh
			this.scene.add(mesh);
		});
	}

	Gui.prototype._init = function() {
		this._createScene();
		this._createLights();
		this._animate();
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
						this.collidableMeshList[mesh.uuid] = mesh.children[2];
					});
				}else if(gameboard[i][j] == HARDBLOCK){
					gameobject.createHardBlock(STARTING_X + i * BLOCK_SIZE, STARTING_Y + j * BLOCK_SIZE, (mesh) => {
						this.gameboardMesh[i][j] = mesh;
						this.scene.add(mesh);
						this.collidableMeshList[mesh.uuid] = mesh.children[1];
					});
				}
			}
		}
	}

	Gui.prototype._createScene = function() {
		this.scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
		this.camera.position.x = 0;
		this.camera.position.y = 320;
		this.camera.position.z = 200;
		this.camera.lookAt(new THREE.Vector3(0,-200,0));

		var cubeGeometry = new THREE.CubeGeometry(15,15,15,1,1,1);
		var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );
		this.collisionBox = new THREE.Mesh( cubeGeometry, wireMaterial );
		this.collisionBox.position.y = 15;
		this.collisionBox.visible = false;
		this.scene.add(this.collisionBox);

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

		//Player movement
		if(this._hasMovement() && this.core.getMainPlayer()) {
			this.collisionBox.position.z = this.core.getMainPlayer().model.position.z + this.playerMovement.y;
			this.collisionBox.position.x = this.core.getMainPlayer().model.position.x + this.playerMovement.x;
			this.renderer.render(this.scene, this.camera);
			
			if(!this._collisionDetection()){
				this.core.getMainPlayer().updatePosition(this.playerMovement);
				
			}
		}

		this.renderer.render(this.scene, this.camera);

		//var that = this;
		//Fix FPS to 30
	   // setTimeout( function() {
		window.requestAnimationFrame(that._animate.bind(that));
	    //}, 1000 / 30 );
	}

	Gui.prototype._hasMovement = function() {
		return this.playerMovement.x != 0 || this.playerMovement.y != 0;
	}

	Gui.prototype._collisionDetection = function(x, y) {
		var model = this.collisionBox;
		var originPoint = model.position.clone();
		
		for (var vertexIndex = 0; vertexIndex < model.geometry.vertices.length; vertexIndex++) {
			var localVertex = model.geometry.vertices[vertexIndex].clone();
			var globalVertex = localVertex.applyMatrix4( model.matrix );
			var directionVector = globalVertex.sub( model.position );
			var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
			var collisionResults = ray.intersectObjects( Object.values(this.collidableMeshList));

			if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
				return true;
		}

		return false;
	}

	// Export to window
	window.app = window.app || {};
	window.app.Gui = Gui;
})(window); 