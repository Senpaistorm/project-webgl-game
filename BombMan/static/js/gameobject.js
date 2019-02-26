let gameobject = (function() {
	'use strict';

	let module = {};
	module.createStandardBox = function(x, y, scene) {
		// Model/material loading!
		var mtlLoader = new THREE.MTLLoader();
		mtlLoader.load("./media/models/grass.mtl", function(materials){
			
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials(materials);
			
			objLoader.load("./media/models/grass.obj", function(mesh){
				mesh.traverse(function(node){
					if( node instanceof THREE.Mesh ){
						node.castShadow = true;
						node.receiveShadow = true;
					}
				});
				
				scene.add(mesh);
				mesh.position.set(x, 0, y);
				mesh.scale.set(3,3,3);
				//mesh.rotation.y = -Math.PI/4;
			});
			
		});
	}

	module.createNormalBlock = function(x, y, scene) {
		// Model/material loading!
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
				scene.add(mesh);
    			mesh.position.set(x - 11, 3, y + 12);
    			mesh.scale.set(23,23,23);
				//mesh.rotation.y = -Math.PI/4;
			});
			
		});
	};

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