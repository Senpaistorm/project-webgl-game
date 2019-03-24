const Constants = require('./Constants');

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
    }, 150);
}

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

Character.prototype.update = function(checkCollision){
    if(!checkCollision(this.absoluteXPos, this.absoluteYPos, this)){
        this.updatePosition(this.movement);
    }
};

Character.prototype.powerup = function(power){
    if(power == Constants.POWER_ITEM && this.power < Constants.POWER_LIMIT){
        this.power ++;
    }else if(power == Constants.BOMB_ITEM && this.load < Constants.LOAD_LIMIT){
        this.load ++;
    }else if(this.speed < Constants.SPEED_LIMIT){
        this.speed += 0.4;
    }
};

module.exports = Character;