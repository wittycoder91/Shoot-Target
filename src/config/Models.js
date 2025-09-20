import * as THREE from "three";

// export const loadModels = (scene, gltfLoader, intersectObjects) => {
  export const loadModels = (scene, intersectObjects = []) => {
    // Load flag texture for fence material
  const flagTexture = new THREE.TextureLoader().load("textures/flag/flag.jpg");
  flagTexture.wrapS = THREE.RepeatWrapping;
  flagTexture.wrapT = THREE.RepeatWrapping;

  // Create flag material for fences
  const flagMaterial = new THREE.MeshStandardMaterial({
    map: flagTexture,
    side: THREE.DoubleSide,
  });

  // Create fence/ad board geometry directly without loading GLTF model
  // First row of ad boards (left side)
  for (let i = -14; i < 10; i++) {
    const adBoard = new THREE.Mesh(
      new THREE.BoxGeometry(2, 20, 50),
      flagMaterial
    );
    adBoard.position.set(-150, 5, 500 + (i * 50));
    adBoard.castShadow = true;
    adBoard.receiveShadow = true;
    adBoard.userData = { type: 'wall', side: 'left' }; // Mark as wall for collision detection
    scene.add(adBoard);
    intersectObjects.push(adBoard); // Add to collision detection
  }

  // Second row of ad boards (right side)
  for (let i = -14; i < 10; i++) {
    const adBoard = new THREE.Mesh(
      new THREE.BoxGeometry(2, 20, 50),
      flagMaterial
    );
    adBoard.position.set(270, 5, 500 + (i * 50));
    adBoard.castShadow = true;
    adBoard.receiveShadow = true;
    adBoard.userData = { type: 'wall', side: 'right' }; // Mark as wall for collision detection
    scene.add(adBoard);
    intersectObjects.push(adBoard); // Add to collision detection
  }

  // Third row of ad boards (back side)
  for (let i = -6; i < 2; i++) {
    const adBoard = new THREE.Mesh(
      new THREE.BoxGeometry(52.5, 20, 2),
      flagMaterial
    );
    adBoard.position.set(192 + (i * 52.5), 5, -225);
    adBoard.castShadow = true;
    adBoard.receiveShadow = true;
    adBoard.userData = { type: 'wall', side: 'back' }; // Mark as wall for collision detection
    scene.add(adBoard);
    intersectObjects.push(adBoard); // Add to collision detection
  }
};
