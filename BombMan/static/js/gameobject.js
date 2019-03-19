let gameobject = (function() {
	'use strict';

	let module = {};
	var mtlLoader = new THREE.MTLLoader();

	var cubeGeometry = new THREE.BoxBufferGeometry( 21, 21, 21 );
	var wireMaterial = new THREE.MeshBasicMaterial({color:0xffffff, wireframe:true, opacity:0});

	console.log(wireMaterial);
	module.createCharactorModel = function(x, y, callback) {
		//var textureLoader = new THREE.TextureLoader();
		// var map = textureLoader.load('./media/textures/skin_man.png');
		// var material = new THREE.MeshPhongMaterial({map: map});

		var loader = new THREE.OBJLoader();
		loader.load("./media/models/charactor/basicCharacter.obj", function ( object ) {

		  // For any meshes in the model, add our material.
			// object.traverse( function ( node ) {
		    // 	if ( node.isMesh ) {
		    // 		node.material = material;
		    // 		node.castShadow = true;
		 	// 		node.receiveShadow = true;
		    // 	}
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
		var cubeGeometry = new THREE.CubeGeometry(23,23,23,1,1,1);
		var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );
		var box = new THREE.Mesh( cubeGeometry, wireMaterial );
		box.position.set(x, 10, y);
		box.matrixAutoUpdate = false;
		box.updateMatrix();
		callback(box);
	}

	module.createNormalBlock = function(x, y, callback) {
		//var mtlLoader = new THREE.MTLLoader();
		mtlLoader.load("./media/models/block.mtl", function(materials){
			
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials(materials);
			
			objLoader.load("./media/models/block.obj", function(mesh){

    			mesh.position.set(x - 11, 3, y + 12);
				var collision = new THREE.Mesh( cubeGeometry, wireMaterial );
				collision.position.set(x, 10, y);

				mesh.children.push(collision);
    			mesh.scale.set(23,23,23);
    			mesh.matrixAutoUpdate = false;
				mesh.updateMatrix();
    			callback(mesh);
			});
			
		});
	};

	module.createHardBlock = function(x, y, callback) {
		//var mtlLoader = new THREE.MTLLoader();
		mtlLoader.load("./media/models/towerSquare.mtl", function(materials){
			
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials(materials);
			
			objLoader.load("./media/models/towerSquare.obj", function(mesh){
			
				mesh.traverse(function(node){
					if( node instanceof THREE.Mesh ){
						node.castShadow = true;
						node.receiveShadow = true;
					}
				});
    			mesh.position.set(x+12, 0, y-11);
				var collision = new THREE.Mesh( cubeGeometry, wireMaterial );
				collision.position.set(x, 10, y);

				mesh.children.push(collision);
    			mesh.scale.set(2.4,2,2.4);
    			mesh.matrixAutoUpdate = false;
				mesh.updateMatrix();
    			callback(mesh);
			});
			
		});
	};

	module.createBomb = function(x,y,callback) {
		//var mtlLoader = new THREE.MTLLoader();
		mtlLoader.load("./media/models/bomb.mtl", function(materials){
			
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials(materials);
			
			objLoader.load("./media/models/bomb.obj", function(mesh){
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