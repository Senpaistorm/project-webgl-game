let gameobject = (function() {
	'use strict';

	let module = {};

	module.createCharactorModel = function(x, y, callback) {
		var mtlLoader = new THREE.MTLLoader();
		mtlLoader.load("./media/models/charactor/basicCharacter.obj.mtl", function(materials){		
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials(materials);
			
			objLoader.load("./media/models/charactor/basicCharacter.obj", function(mesh){
				mesh.traverse(function(node){
					if( node instanceof THREE.Mesh ){
						node.castShadow = true;
						node.receiveShadow = true;
					}
				});

				var cubeGeometry = new THREE.CubeGeometry(23,23,23,1,1,1);
				var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );
				var collision = new THREE.Mesh( cubeGeometry, wireMaterial );
				collision.position.set(-185.5, 15, -120);

				mesh.children.push(collision);

				mesh.position.set(x, 3, y);
				mesh.scale.set(3,3,3);

				callback(mesh);
				//mesh.rotation.y = -Math.PI/4;
			});
			
		});
	}

	//TODO: Change the scene to callback
	module.createStandardBox = function(x, y, scene) {
		var mtlLoader = new THREE.MTLLoader();
		mtlLoader.load("./media/models/grass.mtl", function(materials){
			
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials(materials);
			
			objLoader.load("./media/models/grass.obj", function(mesh){
				scene.add(mesh);
				mesh.position.set(x, 0, y);
				mesh.scale.set(3,3,3);
			});
			
		});
	}

	module.createExplosion = function(x, y, callback) {
		var cubeGeometry = new THREE.CubeGeometry(23,23,23,1,1,1);
		var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );
		var box = new THREE.Mesh( cubeGeometry, wireMaterial );
		box.position.set(x, 10, y);
		callback(box);
	}

	module.createNormalBlock = function(x, y, callback) {
		var mtlLoader = new THREE.MTLLoader();
		mtlLoader.load("./media/models/block.mtl", function(materials){
			
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials(materials);
			
			objLoader.load("./media/models/block.obj", function(mesh){
			
				mesh.traverse(function(node){
					if( node instanceof THREE.Mesh ){
						node.castShadow = true;
						node.receiveShadow = true;
					}
				});
    			mesh.position.set(x - 11, 3, y + 12);

    			var cubeGeometry = new THREE.CubeGeometry(23,23,23,1,1,1);
				var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );
				var collision = new THREE.Mesh( cubeGeometry, wireMaterial );
				collision.position.set(x, 15, y);

				mesh.children.push(collision);

    			mesh.scale.set(23,23,23);
    			callback(mesh);
			});
			
		});
	};

	module.createBomb = function(x,y,callback) {
		var sphere = new THREE.SphereGeometry(12, 20, 20);
		var sphereMaterial = new THREE.MeshBasicMaterial({color:0xff0000});
		var bomb = new THREE.Mesh(sphere, sphereMaterial);

		bomb.position.set(-185.5 + x * 24.2, 5, -120 + y * 24.2);
		callback(bomb);
	}

	module.createCloud = function(scene){
        let mesh = new THREE.Object3D();
        
        var geom = new THREE.BoxGeometry(20,20,20);
        
        var mat = new THREE.MeshPhongMaterial({
        	color: 0xd8d0d1,  
        });
        
        var nBlocs = 3+Math.floor(Math.random()*3);
        for (var i=0; i<nBlocs; i++ ){
                
                var m = new THREE.Mesh(geom, mat); 
                
                m.position.x = i*15;
                m.position.y = Math.random()*10;
                m.position.z = Math.random()*10;
                m.rotation.z = Math.random()*Math.PI*2;
                m.rotation.y = Math.random()*Math.PI*2;
                
                var s = .1 + Math.random()*.9;
                m.scale.set(s,s,s);
                
                m.castShadow = true;
                m.receiveShadow = true;
                
                mesh.add(m);
        } 
        scene.add(mesh);
	}

	return module;
})();