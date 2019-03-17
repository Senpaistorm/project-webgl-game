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
		this.rotation = 0;
		this.armAndLegSwitchMovement = -1;

		this.movementAnimation = function(bodyPart, movementDirection) {

			if(!this.model) return;
			this.model.children[bodyPart].rotation.x = -Math.PI/8 * movementDirection;

			if(bodyPart == CHARACTER_BODY_PART.leftLeg || bodyPart == CHARACTER_BODY_PART.rightLeg) {
				this.model.children[bodyPart].position.z = 2 * movementDirection;
			} else this.model.children[bodyPart].position.z = 4 * movementDirection;
		}

		this.updateModelRotation = (rotationRate=this.rotation) => {
			if(this.model != null) {
				this.model.rotation.y = this.rotation;
				
				//arm and leg will switch movement every frame while moving
				this.armAndLegSwitchMovement = this.armAndLegSwitchMovement * -1;
				this.movementAnimation(CHARACTER_BODY_PART.leftLeg, FORWARD * this.armAndLegSwitchMovement);
				this.movementAnimation(CHARACTER_BODY_PART.rightLeg, BACKWARD * this.armAndLegSwitchMovement);
				this.movementAnimation(CHARACTER_BODY_PART.rightArm, FORWARD * this.armAndLegSwitchMovement);
				this.movementAnimation(CHARACTER_BODY_PART.leftArm, BACKWARD * this.armAndLegSwitchMovement);
			}
		}
	}

	Character.prototype.resetAnimation = function() {
		this.movementAnimation(CHARACTER_BODY_PART.leftLeg, STATIC);
		this.movementAnimation(CHARACTER_BODY_PART.rightLeg, STATIC);
		this.movementAnimation(CHARACTER_BODY_PART.rightArm, STATIC);
		this.movementAnimation(CHARACTER_BODY_PART.leftArm, STATIC);
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

		if (vector.x <= -1) this.rotation = -Math.PI/2;
		if (vector.x >= 1) this.rotation = Math.PI/2;
		if (vector.y <= -1) this.rotation = Math.PI;
		if (vector.y >= 1) this.rotation = 0;
		this.updateModelRotation();
	}

	Character.prototype.updatePositionAbs = function(x, y, rotation) {
		this.absoluteXPos = x;
		this.absoluteYPos = y;

		this.model.position.x = x;
		this.model.position.z = y;

		this.xPos = Math.floor((this.absoluteXPos + 196)/24.2);
		this.yPos = Math.floor((this.absoluteYPos + 130.5)/24.2);
		this.updateModelRotation(rotation);
	}

    // Export to window
    window.app = window.app || {};
    window.app.Character = Character;
})(window);