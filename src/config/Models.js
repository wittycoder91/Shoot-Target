import * as THREE from "three";

// export const loadModels = (scene, gltfLoader, intersectObjects) => {
  export const loadModels = (scene, gltfLoader) => {
    // Load flag texture for fence material
  const flagTexture = new THREE.TextureLoader().load("textures/flag/flag.jpg");
  flagTexture.wrapS = THREE.RepeatWrapping;
  flagTexture.wrapT = THREE.RepeatWrapping;

  // Create flag material for fences
  const flagMaterial = new THREE.MeshStandardMaterial({
    map: flagTexture,
    side: THREE.DoubleSide,
  });

  gltfLoader.load("models/fens/scene.gltf", (gltfModel) => {
    gltfModel.scene.scale.set(15, 15, 15);
    gltfModel.scene.position.set(-120, 4, 40);
    gltfModel.scene.rotation.y = Math.PI * 0.5;

    gltfModel.scene.traverse(function (node) {
      if (node instanceof THREE.Mesh) {
        node.material = flagMaterial; // Replace material with flag texture
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    for (let i = -22; i < 22; i++) {
      // fens = gltfModel.scene.clone();
      // fens.position.z = fens.position.z * i;
      // scene.add(fens);

      const adBoard = new THREE.Mesh(
        new THREE.BoxGeometry(2, 30, 50),
        flagMaterial
      );
      adBoard.position.set(-150, 4, 500 + (i * 50));
      adBoard.castShadow = true;
      adBoard.receiveShadow = true;
      scene.add(adBoard);
    }
    gltfModel.scene.position.set(270, 4, 40);
    gltfModel.scene.rotation.y = Math.PI * 0.5;

    for (let i = -22; i < 22; i++) {
      // fens2 = gltfModel.scene.clone();
      // fens2.position.z = fens2.position.z * i;
      // scene.add(fens2);

      const adBoard = new THREE.Mesh(
        new THREE.BoxGeometry(2, 30, 50),
        flagMaterial
      );
      adBoard.position.set(270, 4, 500 + (i * 50));
      adBoard.castShadow = true;
      adBoard.receiveShadow = true;
      scene.add(adBoard);
    }
    gltfModel.scene.rotation.y = Math.PI;
    gltfModel.scene.position.set(24.6, 5, -800);
    
    for (let i = -6; i < 2; i++) {
      // fens3 = gltfModel.scene.clone();
      // fens3.position.x += i * 25;
      // scene.add(fens3);
      
      const adBoard = new THREE.Mesh(
        new THREE.BoxGeometry(52.5, 30, 2),
        flagMaterial
      );
      adBoard.position.set(192 + (i * 52.5), 4, -620);
      adBoard.castShadow = true;
      adBoard.receiveShadow = true;
      scene.add(adBoard);
    }
  });
  
  // gltfLoader.load("models/tree/scene.gltf", (gltfModel) => {
  //   gltfModel.scene.traverse(function (node) {
  //     if (node instanceof THREE.Mesh) {
  //       node.castShadow = true;
  //       node.receiveShadow = true;
  //     }
  //   });
  //   gltfModel.scene.children[0].scale.set(5, 7, 7);
  //   let treeRight;
  //   for (let i = 600; i >= -600; i -= 300) {
  //     if (i == 0) {
  //       i = 100;
  //     }
  //     treeRight = gltfModel.scene.children[0].clone();
  //     treeRight.position.z += i;
  //     treeRight.position.x = 90;
  //     scene.add(treeRight);
  //     intersectObjects.push(treeRight);
  //   }

  //   let treeLeft;
  //   for (let i = 600; i >= -600; i -= 300) {
  //     if (i == 0) {
  //       i = 100;
  //     }
  //     treeLeft = gltfModel.scene.children[0].clone();
  //     treeLeft.position.z += i;
  //     treeLeft.position.x += -190;
  //     scene.add(treeLeft);
  //     intersectObjects.push(treeLeft);
  //   }
  // });

  // gltfLoader.load("models/rock/scene.gltf", (gltfModel) => {
  //   gltfModel.scene.scale.set(15, 15, 15);
  //   gltfModel.scene.position.y = 2;
  //   for (let i = 0; i < 50; i++) {
  //     const subTree = gltfModel.scene.clone();
  //     subTree.position.x = (Math.random() - 0.5) * 1200;
  //     subTree.position.z = (Math.random() - 0.5) * 1300;
  //     scene.add(subTree);
  //   }
  // });
  // gltfLoader.load("models/plants/scene.gltf", (gltfModel) => {
  //   gltfModel.scene.scale.set(1.5, 1.5, 1.5);
  //   for (let i = 0; i < 130; i++) {
  //     const plants = gltfModel.scene.clone();
  //     plants.position.x = (Math.random() - 0.5) * 1300;
  //     if (plants.position.x > -220 && plants.position.x < 270) continue;
  //     plants.position.z = (Math.random() - 0.5) * 1300;
  //     plants.rotation.y = Math.random() * Math.PI;
  //     scene.add(plants);
  //   }
  // });

  // gltfLoader.load("models/house/scene.gltf", (gltfModel) => {
  //   gltfModel.scene.traverse(function (node) {
  //     if (node instanceof THREE.Mesh) {
  //       node.castShadow = true;
  //       node.receiveShadow = true;
  //     }
  //   });
  //   gltfModel.scene.children[0].scale.set(10, 10, 10);
  //   gltfModel.scene.children[0].position.set(140, 0, 0);
  //   gltfModel.scene.children[0].rotation.z = -Math.PI / 2;
  //   let hosueOne;
  //   for (let i = 430; i >= -430; i -= 430) {
  //     hosueOne = gltfModel.scene.children[0].clone();
  //     hosueOne.position.z += i;
  //     intersectObjects.push(hosueOne);
  //     scene.add(hosueOne);
  //   }
  //   gltfModel.scene.children[0].position.set(-140, 0, 0);
  //   gltfModel.scene.children[0].rotation.z = Math.PI / 2;
  //   let hosueTwo;
  //   for (let i = 430; i >= -430; i -= 430) {
  //     hosueTwo = gltfModel.scene.children[0].clone();
  //     hosueTwo.position.z += i;
  //     intersectObjects.push(hosueTwo);
  //     scene.add(hosueTwo);
  //   }
  // });

  // gltfLoader.load("models/box/scene.gltf", (gltfModel) => {
  //   gltfModel.scene.traverse(function (node) {
  //     if (node instanceof THREE.Mesh) {
  //       node.castShadow = true;
  //       node.receiveShadow = true;
  //     }
  //   });
  //   gltfModel.scene.children[0].scale.set(10, 10, 10);
  //   gltfModel.scene.children[0].position.set(140, 11, 0);
  //   let boxRight;
  //   for (let i = 520; i > -520; i -= 260) {
  //     if (i === 0) {
  //       i = -100;
  //     }
  //     boxRight = gltfModel.scene.children[0].clone();
  //     boxRight.position.z += i;
  //     scene.add(boxRight);
  //     intersectObjects.push(boxRight);
  //   }
  //   gltfModel.scene.children[0].position.set(-140, 11, 0);

  //   let boxLeft;
  //   for (let i = 520; i > -520; i -= 260) {
  //     if (i === 0) {
  //       i = -100;
  //     }
  //     boxLeft = gltfModel.scene.children[0].clone();
  //     boxLeft.position.z += i;
  //     scene.add(boxLeft);
  //     intersectObjects.push(boxLeft);
  //   }
  // });
};
