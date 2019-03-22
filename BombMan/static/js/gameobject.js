let gameobject = (function() {
	'use strict';

	let module = {};
	var mtlLoader = new THREE.MTLLoader();

	var cubeGeometry = new THREE.BoxBufferGeometry( 21, 21, 21 );
	var wireMaterial = new THREE.MeshBasicMaterial({color:0xffffff, wireframe:true, opacity:0});

	function loadCharacterTexture() {
		var textureLoader = new THREE.TextureLoader();
		var map = textureLoader.load('./media/textures/skin_man.png');
		return new THREE.MeshPhongMaterial({map: map});
	}

	function loadItemBomb() {
		var spriteMap = new THREE.TextureLoader().load( "./media/models/items/bomb.png" );
		var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.scale.set(26,26,26);
		sprite.position.y = 10;
		return sprite;
	}

	function loadItemPower() {
		var spriteMap = new THREE.TextureLoader().load( "./media/models/items/power.png" );
		var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.scale.set(26,26,26);
		sprite.position.y = 10;
		return sprite;
	}

	function loadItemShoes() {
		var spriteMap = new THREE.TextureLoader().load( "./media/models/items/shoes.png" );
		var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.scale.set(26,26,26);
		sprite.position.y = 10;
		return sprite;
	}

	//2D item cache
	let itemBomb = loadItemBomb();
	let itemPower = loadItemPower();
	let itemShoes = loadItemShoes();

	let textureCache = loadCharacterTexture();

	module.createItem = function(x, y, type) {
		let mesh;
		//Clone the item so we don't have to reload the image
		if (type == POWER_ITEM)	mesh = itemPower.clone();
		else if (type == SPEED_ITEM) mesh = itemShoes.clone();
		else if (type == BOMB_ITEM) mesh = itemBomb.clone();
		
		if(mesh) mesh.position.set(-185.5 + x * 24.2, 10, -120 + y * 24.2);
		return mesh;
	}

	module.createItemPower = function(x, y) {
		let mesh = itemPower.clone();
		mesh.position.set(-185.5 + x * 24.2, 10, -120 + y * 24.2);
		return mesh;
	}

	module.createItemShoes = function(x, y) {
		let mesh = itemShoes.clone();
		mesh.position.set(-185.5 + x * 24.2, 10, -120 + y * 24.2);
		return mesh;
	}

	module.createCharactorModel = function(x, y, callback) {
		var loader = new THREE.OBJLoader();
		loader.load("./media/models/charactor/basicCharacter.obj", function ( object ) {
		    //For any meshes in the model, add our material.
			// object.traverse( function ( node ) {
		 //    	if ( node.isMesh ) {
		 //    		node.material = textureCache;
		 //    	}
			// });
			(object.children).forEach((child) =>{
				let r = Math.random(),g=Math.random(),b=Math.random();
				child.material.color.set(
					new THREE.Color(r,g,b)
					);
			});
			object.position.set(x, 3, y);
			object.scale.set(3,3,3);
		  	// Add the model to the scene.
		  	callback(object);
		});
	}

	module.createStandardBox = function(x, y,  callback) {
		
		mtlLoader.load("./media/models/grass.mtl", function(materials){
			
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials(materials);
			
			objLoader.load("./media/models/grass.obj", function(mesh){
				mesh.position.set(x, 0, y);
				mesh.scale.set(3,3,3);
				mesh.matrixAutoUpdate = false;
				mesh.updateMatrix();
				callback(mesh);
			});
			
		});
	}

	module.createExplosion = function(x, y, callback) {
		var cubeGeometry = new THREE.CubeGeometry(24,24,24,1,1,1);
		var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFF00 } );
		var box = new THREE.Mesh( cubeGeometry, wireMaterial );
		box.position.set(x, 10, y);
		box.matrixAutoUpdate = false;
		box.updateMatrix();
		callback(box);
	}

	module.createNormalBlock = function(x, y, callback) {
		mtlLoader.load("./media/models/block.mtl", function(materials){
			
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials(materials);
			
			objLoader.load("./media/models/block.obj", function(mesh){

    			mesh.position.set(x - 11, 3, y + 12);
    			mesh.scale.set(23,23,23);
    			mesh.matrixAutoUpdate = false;
				mesh.updateMatrix();
    			callback(mesh);
			});
			
		});
	};

	module.createHardBlock = function(x, y, callback) {
		mtlLoader.load("./media/models/towerSquare.mtl", function(materials){
			
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials(materials);
			
			objLoader.load("./media/models/towerSquare.obj", function(mesh){

    			mesh.position.set(x+12, 0, y-11);
    			mesh.scale.set(2.4,2,2.4);
    			mesh.matrixAutoUpdate = false;
				mesh.updateMatrix();
    			callback(mesh);
			});
			
		});
	};

	module.createBomb = function(x,y,callback) {
		mtlLoader.load("./media/models/bomb.mtl", function(materials){
			
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials(materials);
			objLoader.load("./media/models/bomb.obj", function(mesh){
				mesh.children[0].material.color.set(0xffe4b5);
				mesh.position.set(-185.5 + (x+1.65) * 24.2, 10, -120 + y * 24.2);
				mesh.scale.set(18,18,18);

				var smallCubeGeometry = new THREE.BoxBufferGeometry( 10, 10, 10 );

				var collision = new THREE.Mesh( smallCubeGeometry, wireMaterial );
				collision.position.set(-185.5 + x * 24.2, 10, -120 + y * 24.2);
				collision.transparent = true;
				mesh.children.push(collision);
    			mesh.matrixAutoUpdate = false;
    			mesh.name = "bomb";
				mesh.updateMatrix();
    			callback(mesh);
			});
		});
	}

	return module;
})();