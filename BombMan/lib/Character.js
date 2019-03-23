function Character(name, xPos, yPos, speed, power, load) {
    this.name = name;
    this.xPos = xPos;
    this.yPos = yPos;
    this.speed = speed;
    this.power = power;
    this.load = load;
    this.absoluteXPos = -185.5 + xPos * 24.2;	//the aboslute position on the game board in pixel
    this.absoluteYPos = -120 + yPos * 24.2;
    this.rotation = 0;
    this.armAndLegSwitchMovement = -1;
    this.movement = {x:0, y:0};
    this.isMoving = 0;
    this.color = {r: Math.random(), g: Math.random(), b:Math.random()};

    setInterval(() => {
        if(!(this.movement.x == 0 && this.movement.y == 0)){
            this.armAndLegSwitchMovement *= -1;
        }
    }, 200);
}

Character.prototype.resetAnimation = function() {
    this.movementAnimation(CHARACTER_BODY_PART.leftLeg, STATIC);
    this.movementAnimation(CHARACTER_BODY_PART.rightLeg, STATIC);
    this.movementAnimation(CHARACTER_BODY_PART.rightArm, STATIC);
    this.movementAnimation(CHARACTER_BODY_PART.leftArm, STATIC);
};

Character.prototype.updatePosition = function(vector) {
    this.absoluteXPos += vector.x;
    this.absoluteYPos += vector.y;

    this.xPos = Math.floor((this.absoluteXPos + 196)/24.2);
    this.yPos = Math.floor((this.absoluteYPos + 130.5)/24.2);

    if (vector.x <= -1) this.rotation = -Math.PI/2;
    if (vector.x >= 1) this.rotation = Math.PI/2;
    if (vector.y <= -1) this.rotation = Math.PI;
    if (vector.y >= 1) this.rotation = 0;
};

Character.prototype.move = function(vector){
    Object.assign(this.movement, vector);
};

Character.prototype.update = function(checkCollision, onPlayerMoveChanged){
    let xOrig = this.xPos;
    let yOrig = this.yPos;

    if(!checkCollision(this.absoluteXPos, this.absoluteYPos, this)){
        this.updatePosition(this.movement);
    }
    if(Math.abs(this.xPos - xOrig) > 0 || Math.abs(this.yPos - yOrig) > 0){
        onPlayerMoveChanged(this);
    }
};

module.exports = Character;