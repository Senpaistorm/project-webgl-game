(function(window) {
	'use strict'

	/**
	 * The listener class. This class is responsible for displaying
	 * the GUI to the screen, and for forwarding events to
	 * Core class when Gui-related events are detected.
	 * In addition, Core calls these methods to notify the Gui
 	 * when it should update its display
	 */
	function Gui(core) {
		this.core = core;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 10000);
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.container = document.getElementById('world');
		this.keyboardEvent = {};
		this.collisionBox = null;
		this.collidableMeshList = {};
	}

	Gui.prototype.onNewGame = function(gameplay) {
		this._init();
		this.gameplay = gameplay;
		this._createGameBoard(gameplay.gameboard);
		this._createCharactor(gameplay.character);
	};

	//Get the aboslute location of the player in an 2D array
	Gui.prototype.getLocation = function() {
		var x = this.gameplay.character.model.position.x;
		var y = this.gameplay.character.model.position.z;
		return {x: Math.floor((x + 196)/24.2), y: Math.floor((y + 130.5)/24.2)}
	}

	Gui.prototype.onBombPlaced = function() {
		var location = this.getLocation()

		console.log(this.gameplay.isValidPosition(location.x, location.y));
		if(this.gameplay.isValidPosition(location.x, location.y)) {

			gameobject.createBomb(location.x, location.y, (mesh) => {
				this.gameboardMesh[location.x][location.y] = mesh
				this.scene.add(mesh);
			});

			this.gameplay.placeBomb(location.x, location.y, (res) => {
				this.onExplode(res);
			});
		}
	}

	Gui.prototype.onExplode = function(positions) {
		let startingPoint = -185.5;
		let startingPointy = -120;
		let size = 24.2;

		positions.blocks.forEach((block) => {
			console.log(this.gameboardMesh[block.xPos][block.yPos]);

			this.distoryMesh(this.gameboardMesh[block.xPos][block.yPos]);
		});
		
		positions.bombs.forEach((bomb) => {
			this.distoryMesh(this.gameboardMesh[bomb.xPos][bomb.yPos]);
		});

		let explosion = []

		positions.expCoords.forEach((position) => {
			gameobject.createExplosion(startingPoint + position.xPos * size, startingPointy + position.yPos * size, (mesh) => {
				explosion.push(mesh);
				this.scene.add(mesh);
			});
		});

		setTimeout(() => {
			explosion.forEach((e) => { this.scene.remove(e); });
    	}, 200);
	}

	Gui.prototype.distoryMesh = function(mesh) {
		console.log(mesh);
		this.scene.remove(mesh);
		delete this.collidableMeshList[mesh.uuid];
	}

	Gui.prototype._init = function() {
		this._createScene();
		this._createLights();
		this._animate();
	};

	Gui.prototype._createCharactor = function(character) {
		gameobject.createCharactorModel(character.absoluteXPos, character.absoluteYPos, (mesh) => {
			character.setModel(mesh);
			this.scene.add(mesh);
		});
	}

	Gui.prototype._createGameBoard = function(gameboard) {
		let startingPoint = -185.5;
		let startingPointy = -120;
		let size = 24.2;

		this.gameboardMesh = new Array(gameboard.length);

		for(let i = 0; i < gameboard.length; i ++) {
			this.gameboardMesh[i] = new Array(gameboard[i].length);

			for(let j = 0; j < gameboard[i].length; j ++) {
				gameobject.createStandardBox(startingPoint + i * size, startingPointy + j * size, this.scene);

				if(gameboard[i][j] == 1)
					gameobject.createNormalBlock(startingPoint + i * size, startingPointy + j * size, (mesh) => {
						this.gameboardMesh[i][j] = mesh;
						this.scene.add(mesh);
						this.collidableMeshList[mesh.uuid] = mesh.children[2];
					});
			}
		}
	}

	Gui.prototype._createScene = function() {
		this.scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
		this.camera.position.x = 0;
		this.camera.position.y = 320;
		this.camera.position.z = 200;
		this.camera.lookAt(new THREE.Vector3(0,-200,0));

		var cubeGeometry = new THREE.CubeGeometry(20,20,20,1,1,1);
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

		if(this.keyboardEvent[87]) { //w

			this.collisionBox.position.z = this.gameplay.character.model.position.z - 1;
			this.collisionBox.position.x = this.gameplay.character.model.position.x;
			this.gameplay.character.up();
			this.renderer.render(this.scene, this.camera);

			if(!this._collisionDetection()) {
				this.gameplay.character.model.position.z -= 1;
			}
		}

		if(this.keyboardEvent[83]) { //s
			this.collisionBox.position.z = this.gameplay.character.model.position.z + 1;
			this.collisionBox.position.x = this.gameplay.character.model.position.x;
			this.gameplay.character.down();

			this.renderer.render(this.scene, this.camera);

			if(!this._collisionDetection()) {
				this.gameplay.character.model.position.z += 1;
			}
		}

		if(this.keyboardEvent[65]) { //a
			this.collisionBox.position.x = this.gameplay.character.model.position.x - 1;
			this.collisionBox.position.z = this.gameplay.character.model.position.z;
			this.gameplay.character.left();
			this.renderer.render(this.scene, this.camera);

			if(!this._collisionDetection()) {
				this.gameplay.character.model.position.x -= 1;
			}		
		}

		if(this.keyboardEvent[68]) { //d
			this.collisionBox.position.x = this.gameplay.character.model.position.x + 1;
			this.collisionBox.position.z = this.gameplay.character.model.position.z;
			this.gameplay.character.right();
			this.renderer.render(this.scene, this.camera);

			if(!this._collisionDetection()) {
				this.gameplay.character.model.position.x += 1;
			}
		}

		this.renderer.render(this.scene, this.camera);
		window.requestAnimationFrame(this._animate.bind(this));
	}

	Gui.prototype._collisionDetection = function(x, y) {
		var model = this.collisionBox;
		var originPoint = model.position.clone();
		
		for (var vertexIndex = 0; vertexIndex < model.geometry.vertices.length; vertexIndex++) {
			var localVertex = model.geometry.vertices[vertexIndex].clone();
			var globalVertex = localVertex.applyMatrix4( model.matrix );
			var directionVector = globalVertex.sub( model.position );
			
			var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );

			console.log(ray);
			var collisionResults = ray.intersectObjects( Object.values(this.collidableMeshList));

			console.log(collisionResults);
			if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
				return true;
		}

		console.log("FALSE");
		return false;
	}

	// Export to window
	window.app = window.app || {};
	window.app.Gui = Gui;
})(window); 