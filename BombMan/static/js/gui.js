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
	}

	Gui.prototype.onNewGame = function(gameplay) {
		this._init();
		this.gameplay = gameplay;
		this._createGameBoard(gameplay.gameboard);
		console.log(gameplay.character + " get game charactor");
		this._createCharactor(gameplay.character);
	};

	Gui.prototype._init = function() {
		this._createScene();
		this._createLights();
		this._animate();
	};

	Gui.prototype._createCharactor = function(character) {
		gameobject.createCharactorModel(character.absoluteXPos, character.absoluteYPos, (mesh) => {
			console.log(character.model + " set model");
			character.setModel(mesh);
			this.scene.add(mesh);
		});
	}

	Gui.prototype._createGameBoard = function(gameboard) {
		let startingPoint = -185.5;
		let startingPointy = -120;
		let size = 24.2;

		for(let i = 0; i < 15; i ++) {
			for(let j = 0; j < 15; j ++) {
				gameobject.createStandardBox(startingPoint + i * size, startingPointy + j * size, this.scene);
			}
		}

		for(let i = 0; i < gameboard.length; i ++) {
			for(let j = 0; j < gameboard[i].length; j ++) {
				if(gameboard[i][j] == 1)
					gameobject.createNormalBlock(startingPoint + i * size, startingPointy + j * size, this.scene);
			}
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
		this.renderer.render(this.scene, this.camera);
		window.requestAnimationFrame(this._animate.bind(this));

		if(this.keyboardEvent[87]) { //w
			this.gameplay.character.model.position.z -= 1;
			this.gameplay.character.up();
		}

		if(this.keyboardEvent[83]) { //s
			this.gameplay.character.model.position.z += 1;
			this.gameplay.character.down();
		}

		if(this.keyboardEvent[65]) { //a
			this.gameplay.character.model.position.x -= 1;
			this.gameplay.character.left();
		}

		if(this.keyboardEvent[68]) { //d
			this.gameplay.character.model.position.x += 1;
			this.gameplay.character.right();
		}
	}

	// Export to window
	window.app = window.app || {};
	window.app.Gui = Gui;
})(window); 