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
		//public variables
		this.core = core;
		this.scene = new  THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(90, 1280/720, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer();
	}

	Gui.prototype.onNewGame = function() {
		this._init();
	}

	Gui.prototype._init = function() {
		let mesh = new THREE.Mesh(
			new THREE.BoxGeometry(1,1,1),
			new THREE.MeshBasicMaterial({color: 0xff9999, wireframe: true})
		);

		this.scene.add(mesh);

		this.camera.position.set(0,0,-5);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));

		this.renderer.setSize(1280, 720);
		document.body.appendChild(this.renderer.domElement);
		this.renderer.render(this.scene, this.camera);
	};
	
	// Export to window
	window.app = window.app || {};
	window.app.Gui = Gui;
})(window);