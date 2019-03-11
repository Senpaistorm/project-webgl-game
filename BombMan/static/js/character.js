(function(window) {
	'use strict';
	
	function Character(name, xPos, yPos, speed, power, load) {
		this.name = name;
		this.xPos = xPos;
		this.yPos = yPos;
		this.speed = speed;
		this.power = power;
		this.load = load;
		this.absoluteXPos = -185.5 + xPos * 24.2;	//the aboslute position on the game board in pixel
		this.absoluteYPos = -120 + yPos * 24.2;
		this.model = null;
	}

	Character.prototype.setModel = function(mesh) {
		this.model = mesh;
	}

	Character.prototype.updatePosition = function(vector) {
		this.absoluteXPos += vector.x;
		this.absoluteYPos += vector.y;

		this.model.position.x += vector.x;
		this.model.position.z += vector.y;

		this.xPos = Math.floor((this.absoluteXPos + 196)/24.2);
		this.yPos = Math.floor((this.absoluteYPos + 130.5)/24.2);
	}

	Character.prototype.updatePositionAbs = function(x, y) {
		this.absoluteXPos = x;
		this.absoluteYPos = y;

		this.model.position.x = x;
		this.model.position.z = y;

		this.xPos = Math.floor((this.absoluteXPos + 196)/24.2);
		this.yPos = Math.floor((this.absoluteYPos + 130.5)/24.2);
	}

	Character.prototype.left = function() {
		if(this.model != null)
			this.model.rotation.y = -Math.PI/2;
	}

	Character.prototype.right = function() {
		if(this.model != null)
			this.model.rotation.y = Math.PI/2;
	}

	Character.prototype.up = function() {
		if(this.model != null)
			this.model.rotation.y = Math.PI;
	}

	Character.prototype.down = function() {
		if(this.model != null)
			this.model.rotation.y = 0;
	}

    // Export to window
    window.app = window.app || {};
    window.app.Character = Character;
})(window);