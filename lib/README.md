# Bomb Man

## Server Modules

The lib folder contains all the game modules used on the server side. Every time a game starts, a Gameplay instance is created and sent to the client as raw data. The core game modules uses javascript prototype as an object-oriented way of representing every game instance. I have included detail descriptions of more sophisticated functions below.

### Character

Representation of an actual player's character. A started Gameplay instance can contain 1-4 Character instances.

``Character.prototype.updatePosition = function(vector)``
Given a vector that has {x,y}, add x,y to a character's absolute position. Update character's actual position and rotation as needed.

### Constants

Some useful initialization constants for all game modules.

### Gameplay

Representation of an actual Bomb Man game on the server side. Most method names do what as specified in the header. 

``Gameplay.prototype.placeBomb = async function(character, createCallback, explodeCallback)``
This function takes a character, and two callbacks create and explode respectively. It first checks if a valid bomb can be placed at character's actual position. It then pushes the bomb to the queue of current bombs and call createCallback on the bomb created. Using await, promise, and setTimeOut, call explodeCallback on the bomb after 3 seconds if the bomb still exists(has not been triggered by other bombs). Finally it calls explodeBomb in Gameplay on the bomb itself.

``Gameplay.prototype.explodeBomb = function(bombExplode)``
This function is called when a bomb actually explodes. It takes a bomb with {x,y,power} as its parameter. Using an algorithm similar to BFS, the function tries to find the first obstacle in all four directions that extends to as far as its power. If a bomb is found, push the bomb onto the exploding bomb queue. The algorithm terminates when the exploding bomb queue is empty and returns all affected coordinates and exploded coordinates.

``Gameplay.prototype._collisionDetection = function(x, y, player)``
Every update interval, this function gets called if player is actually moving. The function predicts player's location by using player's current movement and speed. The function accounts for a buffer length that accounts for the character's hitbox approximately equal to the center of the character to its edge. If the character is moving diagonally, it cannot move to the next diagonal block if its adjacent horizontal and vertical blocks are occupied in that direction. Return true if a collision is detected, false otherwise.