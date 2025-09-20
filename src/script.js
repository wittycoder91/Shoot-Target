import "./styles.css";
import * as THREE from "three";
import * as dat from "dat.gui";
import loadGrassTextures from "./config/GrassTexture";
import { loadCannonTextures } from "./config/CannonTextures";
// import { loadBaseTextures } from "./config/BaseTexures";
import Ball from "./physics/ball";
import { loadModels } from "./config/Models";
import { loadTargetTextues } from "./config/TargetTexure";
import { CylinderBufferGeometry, PlaneBufferGeometry } from "three";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
//import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import gsap from "gsap";
import World from "./physics/world";
import { loadFlagBaseTextures } from "./config/FlagBaseTextures";
import flagVertexShader from "./shaders/FlagSheders/vertex.glsl";
import flagFragmentShader from "./shaders/FlagSheders/fragment.glsl";
import { loadFlagTexture } from "./config/FlagTexture";
import { loadBallTextures } from "./config/BallTextures";
import vector from "./physics/vector";

/*
    Variables
*/
const gui = new dat.GUI();
gui.close();
let argument = window.matchMedia("(max-width: 425px)");
let fun = (argument) => {
  if (argument.matches) {
    gui.width = 150;
  } else {
    gui.width = 250;
  }
};
fun(argument);
argument.addListener(fun);
const worldfolder = gui.addFolder("world");
const ballFolder = gui.addFolder("ball");
const coefficientsFolder = ballFolder.addFolder("coefficients");
coefficientsFolder.open();
coefficientsFolder.hide();
worldfolder.open();
ballFolder.open();
let isClicked = false;
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const mouse = new THREE.Vector2();
const cannonDirection = new THREE.Vector3();
const scene = new THREE.Scene();
const GRAVITY = 9.8;
const HEIGHT = 0,
  TEMPERETURE = 15; // celsius
const WIND_SPEED = 10,
  WIND_ANGLE = Math.PI / 2;
const SHOOT_DELAY = 2000;
let lastShotingTime = 0;
let numberOfBalls = 20;
let numberOfTargets = 7;
let score = 0;
let isObjectLoaded;
let intersectObjects = [];
let axesHelper;
let isFinished = false;
/*
    Paramters
*/
const paramters = {
  windSpeed: 10,
  windAngle: Math.PI / 2,
  angular_speedX: 0,
  angular_speedY: 1,
  angular_speedZ: 0,
  axesHelper: false,
  radius: 0.5,
  gravity: 9.8,
  dragCoeff: 0.47,
  height: 0,
  tempereture: 15,
  resistanseCoeff: 0.8,
  frictionCoeff: 0.8,
  mass: 1000,
  speed: 25,
};

/*
    Loaders
*/
const loadingBar = document.querySelector(".loadingBar");
const loadingManger = new THREE.LoadingManager(
  () => {
    gsap.delayedCall(0.5, () => {
      gsap.to(overlay.material.uniforms.uAlpha, { duration: 3, value: 0 });
      loadingBar.classList.add("ended");
      loadingBar.style.transform = "";
      document.querySelector(".screenInfo").classList.remove("hide");
    });
    isObjectLoaded = true;
  },
  (itemUrl, itemsLoaded, itemsTotal) => {
    loadingBar.style.transform = "scaleX(" + itemsLoaded / itemsTotal + ")";
  }
);
// const gltfLoader = new GLTFLoader(loadingManger);
// const fbxLoader = new FBXLoader(loadingManger);
const textureLoader = new THREE.TextureLoader(loadingManger);
// const audioLoader = new THREE.AudioLoader(loadingManger);
// audioLoader.load("sounds/cannonShootingSound.mp3", (audioBuffer) => {
//   shootingSoundEffect.setBuffer(audioBuffer);
// });

/*
    Game Screen
*/
const numberofBallsWidget = document.querySelector(".cannonBallsNumber");
numberofBallsWidget.innerHTML = numberOfBalls;

const scoreWidget = document.querySelector(".ScoreNumber");
scoreWidget.innerHTML = score;

const targetWidget = document.querySelector(".targetNumbers");
targetWidget.innerHTML = numberOfTargets;

const gameFinshed = document.querySelector(".gameFinshedLayout");

const playAgain = document.querySelector(".playAgain");
/*
    Configure Scene
*/
scene.fog = new THREE.Fog(0xcce0ff, 1300, 1600);
const texture = textureLoader.load("textures/skybox/FS002_Day.png", () => {
  const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
  rt.fromEquirectangularTexture(renderer, texture);
  scene.background = rt.texture;
});

/*
    Configure Pysics World
*/
const world = new World(GRAVITY, HEIGHT, TEMPERETURE, WIND_SPEED, WIND_ANGLE);

worldfolder
  .add(paramters, "gravity", -10, 100, 0.1)
  .name("gravity")
  .onChange(() => {
    world.gravity = paramters.gravity;
  });

worldfolder
  .add(paramters, "windSpeed", 0, 100, 0.01)
  .name("Wind Speed")
  .onChange(() => {
    world.wind_speed = paramters.windSpeed;
  });
worldfolder
  .add(paramters, "windAngle", 0, 6.2831853072, 0.2)
  .name("Wind Angle")
  .onChange(() => {
    world.wind_angle = paramters.windAngle;
    rotateAboutPoint(
      flag,
      flagBase.position,
      new THREE.Vector3(0, 1, 0),
      paramters.windAngle
    );
  });
worldfolder
  .add(paramters, "height", -100, 1000, 10)
  .name("Height")
  .onChange(() => {
    world.height = paramters.height;
  });

worldfolder
  .add(paramters, "tempereture", -100, 100, 1)
  .name("Tempereture")
  .onChange(() => {
    world.tempereture = paramters.tempereture;
  });

/* 
    Tweak gui values
*/
ballFolder.add(paramters, "axesHelper");
ballFolder.add(paramters, "radius", 0, 1, 0.01).name("ball radius");
// let massController = ballFolder
//   .add(paramters, "mass", 1, 5000, 0.5)
//   .name("ball mass");
ballFolder.add(paramters, "speed", 10, 35, 0.1).name("ball speed");
ballFolder
  .add(paramters, "angular_speedX", -10, 10, 0.1)
  .name("Angular speed X");
ballFolder
  .add(paramters, "angular_speedY", -10, 10, 0.1)
  .name("Angular speed Y");
ballFolder
  .add(paramters, "angular_speedZ", -10, 10, 0.1)
  .name("Angular speed Z");

coefficientsFolder.add(paramters, "dragCoeff", 0, 1, 0.001).name("dragCoeff");
coefficientsFolder
  .add(paramters, "resistanseCoeff", 0, 1, 0.001)
  .name("resistanseCoeff");
coefficientsFolder
  .add(paramters, "frictionCoeff", 0, 1, 0.001)
  .name("frictionCoeff");
/*
    Textures
*/
const grassTextures = loadGrassTextures(textureLoader);
const cannonTextures = loadCannonTextures(textureLoader);
// const baseTextures = loadBaseTextures(textureLoader);
const targetTextures = loadTargetTextues(textureLoader);
const flagBaseTexutes = loadFlagBaseTextures(textureLoader);
const flagTextures = loadFlagTexture(textureLoader);
const ballTextures = loadBallTextures(textureLoader);
paramters.ballTextures = ballTextures[0];

/* 
    Models
*/
// loadModels(scene, gltfLoader, intersectObjects);
loadModels(scene, intersectObjects);

/*
    Events
*/
gui.domElement.addEventListener("mousedown", () => (isClicked = true));
gui.domElement.addEventListener("mouseleave", () => (isClicked = false));
window.addEventListener("mouseup", () => checkGame());
window.addEventListener("dblclick", () => {
  const fullScreen =
    document.fullscreenElement || document.webkitFullscreenElement;
  if (!fullScreen) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  }
});


window.addEventListener("mousemove", (event) => {
  mouse.x = event.pageX / size.width;
  mouse.y = event.pageY / size.height;
});
window.addEventListener("touchmove", (event) => {
  event.preventDefault();
  mouse.x = event.touches[0].clientX / size.width;
  mouse.y = event.touches[0].clientY / size.height;
});


// Shooting function to avoid code duplication
const handleShooting = () => {
  if (
    !isClicked &&
    !isFinished &&
    isObjectLoaded &&
    numberOfBalls &&
    numberOfTargets &&
    window.performance.now() - lastShotingTime > SHOOT_DELAY
  ) {
    isClicked = false;
    // shootingSoundEffect.play();
    createCannonBall();
    let zPosition = cannon.position.z;
    gsap.to(cannon.position, {
      duration: 1.5,
      delay: 0.2,
      z: cannon.position.z + 15,
    });
    gsap.delayedCall(0.2, () => {
      gsap.to(cannon.position, { duration: 1.5, delay: 0.2, z: zPosition });
    });
    isCameraChasing = true;
    setTimeout(() => (isCameraChasing = false), 8000);
    lastShotingTime = window.performance.now();
  }
};

// Mouse click event (for desktop)
window.addEventListener("click", handleShooting);

// Touch events for mobile devices (iPhone Safari)
window.addEventListener("touchend", (event) => {
  event.preventDefault(); // Prevent default touch behavior
  handleShooting();
});

// Pointer events for better cross-platform compatibility
window.addEventListener("pointerup", (event) => {
  // Only handle pointer events if it's not a mouse event (to avoid double firing)
  if (event.pointerType !== "mouse") {
    event.preventDefault();
    handleShooting();
  }
});
// Play Again button handler
const handlePlayAgain = () => {
  gameFinshed.classList.add("hide");
  score = 0;
  numberOfBalls = 20;
  numberOfTargets = 7;
  targetWidget.innerHTML = numberOfTargets;
  scoreWidget.innerHTML = score;
  setTimeout(() => (isFinished = false), 1000);
};

// Play Again button events for both mouse and touch
playAgain.addEventListener("mousedown", handlePlayAgain);
playAgain.addEventListener("touchend", (event) => {
  event.preventDefault();
  handlePlayAgain();
});
playAgain.addEventListener("pointerup", (event) => {
  if (event.pointerType !== "mouse") {
    event.preventDefault();
    handlePlayAgain();
  }
});

/* 
    Cameras
*/
let isCameraChasing = false;
const camera = new THREE.PerspectiveCamera(
  45,
  size.width / size.height,
  0.1,
  1600
);
camera.position.set(0, 10, 740);
scene.add(camera);
const chasingCamera = new THREE.PerspectiveCamera(
  45,
  size.width / size.height,
  0.1,
  1600
);
chasingCamera.position.set(0, 10, 0);
scene.add(chasingCamera);

/*
    Sounds
*/
// const audioListener = new THREE.AudioListener();
// camera.add(audioListener);
// chasingCamera.add(audioListener);
// const shootingSoundEffect = new THREE.Audio(audioListener);
// scene.add(shootingSoundEffect);

/*
    Lights
*/
const ambientLight = new THREE.AmbientLight("white", 0.75);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("white", 0.35);
directionalLight.position.copy(new THREE.Vector3(-84.5, 169.1, 696));
scene.add(directionalLight);

/*
    Objects
*/
// ------------------ Add the shooting object ----------------------
const cannon = new THREE.Group();
scene.add(cannon);
const metalMaterial = new THREE.MeshStandardMaterial({
  map: cannonTextures.cannonColorTexture,
  aoMap: cannonTextures.cannonAmbientOcclusionTexture,
  roughnessMap: cannonTextures.cannonRoughnessTexture,
  normalMap: cannonTextures.cannonNormalTexture,
  metalnessMap: cannonTextures.cannonMetalnessTexture,
});
const barrel = new THREE.Mesh(
  new THREE.CylinderBufferGeometry(5, 3, 20, 32, 1, true, Math.PI * 2),
  metalMaterial
);
barrel.position.set(0, 10, 660); // Aligned with target center (x=0)
barrel.rotation.x = (-Math.PI / 4) * 1.5;
barrel.material.roughness = 0.5;
barrel.material.side = THREE.DoubleSide;
// cannon.add(barrel);

// Create ball model that matches the cannon ball
let ballModel = null;

// Create the same geometry as the cannon ball
const ballGeometry = new THREE.SphereGeometry(paramters.radius * 5, 32, 32);

// Configure texture settings (same as cannon ball)
paramters.ballTextures.color.wrapS = THREE.RepeatWrapping;
paramters.ballTextures.color.wrapT = THREE.RepeatWrapping;
paramters.ballTextures.color.flipY = false;
paramters.ballTextures.color.repeat.set(1, 1);

// Create the same material as the cannon ball
const ballMaterial = new THREE.MeshStandardMaterial({
  map: paramters.ballTextures.color,
  color: 0x8B4513, // Better brown color for football
  side: THREE.DoubleSide,
  transparent: false,
  roughness: 0.8,
  metalness: 0.0,
  normalMap: paramters.ballTextures.normal,
  roughnessMap: paramters.ballTextures.roughness,
});

// Create the ball model
ballModel = new THREE.Mesh(ballGeometry, ballMaterial);

// Apply the same scale as the cannon ball (football shape)
ballModel.scale.set(1.15, 0.65, 0.65);

// Position the ball model at the same location as the cannon ball
ballModel.position.copy(
  barrel.position.clone().add(new THREE.Vector3(0, -8.5, -1))
);
ballModel.castShadow = true;

cannon.add(ballModel);

// Function to ensure ball model is properly visible and positioned
const ensureBallModelVisible = () => {
  if (ballModel) {
    // Ensure ball model is in the scene
    if (!ballModel.parent) {
      cannon.add(ballModel);
      console.log('Ball model added back to cannon');
    }
    
    // Update position to match cannon and ensure visibility
    const ballPosition = barrel.position.clone().add(new THREE.Vector3(0, -8.5, -1));
    // Ensure ball is always above ground level (field is at y=0)
    ballPosition.y = Math.max(ballPosition.y, 2); // Minimum 2 units above ground
    ballModel.position.copy(ballPosition);
    
    // Make it visible
    ballModel.visible = true;
    console.log('Ball model made visible and positioned correctly');
  }
};

// Ensure ball model is visible initially and properly positioned
ensureBallModelVisible();

// Force initial ball model positioning to ensure proper alignment and visibility
if (ballModel) {
  const initialBallPosition = barrel.position.clone().add(new THREE.Vector3(0, -8.5, -1));
  // Ensure ball is always above ground level (field is at y=0)
  initialBallPosition.y = Math.max(initialBallPosition.y, 2); // Minimum 2 units above ground
  ballModel.position.copy(initialBallPosition);
  console.log('Initial ball model position set to:', ballModel.position);
}

const cannonCover = new THREE.Mesh(
  new THREE.SphereBufferGeometry(3, 32, 32),
  metalMaterial
);
cannonCover.position.y = -10;
cannonCover.material.roughness = 0.5;
barrel.add(cannonCover);

// ------------------ Add the playground ----------------------
// Create floor that extends forward to fill the gap in front of the camera
// Camera is at z = 740, so field needs to extend much further forward
// Boundaries: x: -150 to 270 (width: 420), z: -225 to 800 (extended length: 1025)
const playgroundWidth = 420;  // From -150 to 270
const playgroundLength = 1025; // Extended from -225 to 800 to fill front gap
const playgroundCenterX = 60; // Center between -150 and 270
const playgroundCenterZ = 287.5; // Center between -225 and 800

const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(playgroundWidth, playgroundLength, 50, 50),
  new THREE.MeshStandardMaterial({
    map: grassTextures.grassColorTexture,
    aoMap: grassTextures.grassAmbientOcclusionTexture,
    displacementMap: grassTextures.grassHeightTexture,
    metalnessMap: grassTextures.grassMetalnessTexture,
    displacementScale: 0.0,
    normalMap: grassTextures.grassNormalTexture,
    roughnessMap: grassTextures.grassRoughnessTexture,
  })
);
floor.material.roughness = 0.5;
floor.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(playgroundCenterX, 0, playgroundCenterZ);
scene.add(floor);

// ------------------ Add field markings and yard lines ----------------------
// Create yard lines across the field
// const yardLineMaterial = new THREE.MeshStandardMaterial({
//   color: 0xffffff,
//   transparent: true,
//   opacity: 0.9,
// });

// // Add yard lines - rotated 90 degrees
// for (let i = 0; i <= 10; i++) {
//   const yardLine = new THREE.Mesh(
//     new THREE.PlaneBufferGeometry(1, playgroundLength, 1, 1), // Lines run vertically along length
//     yardLineMaterial
//   );
//   yardLine.rotation.x = -Math.PI / 2;
//   yardLine.rotation.z = Math.PI / 2; // Rotate 90 degrees
//   yardLine.position.set(
//     playgroundCenterX - (playgroundWidth / 2) + (i * playgroundWidth / 10), // Position along width
//     0.01, // Slightly above the floor
//     playgroundCenterZ // Center along length
//   );
//   scene.add(yardLine);
// }

// // Add HORIZONTAL hash marks across the field width (swapped direction)
// for (let i = 0; i <= 20; i++) {
//   const hashMark = new THREE.Mesh(
//     new THREE.PlaneBufferGeometry(playgroundWidth, 1, 1, 1), // Lines run horizontally across width
//     yardLineMaterial
//   );
//   hashMark.rotation.x = -Math.PI / 2;
//   hashMark.position.set(
//     playgroundCenterX, // Center along width
//     0.01, // Slightly above the floor
//     playgroundCenterZ - (playgroundLength / 2) + (i * playgroundLength / 20) // Position along length
//   );
//   scene.add(hashMark);
// }

// // Add yard numbers
// const numberMaterial = new THREE.MeshStandardMaterial({
//   color: 0xffffff,
//   transparent: true,
//   opacity: 0.8,
// });

// // Create yard numbers positioned along the field length (matching vertical field lines)
// // Updated to match the vertical line layout
// const yardNumbers = [50, 40, 30, 20, 10, 0, 10, 20, 30, 40, 50];
// for (let i = 0; i < yardNumbers.length; i++) {
//   if (yardNumbers[i] !== 0) { // Skip the center line number
//     const numberGeometry = new THREE.PlaneBufferGeometry(8, 12, 1, 1);
//     const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
//     numberMesh.rotation.x = -Math.PI / 2;
//     numberMesh.position.set(
//       playgroundCenterX - 180, // Position on the left side of field
//       0.02, // Above the field lines
//       playgroundCenterZ - (playgroundLength / 2) + (i * playgroundLength / 10) // Position along field length
//     );
//     scene.add(numberMesh);
    
//     // Add number on the right side too
//     const numberMeshRight = numberMesh.clone();
//     numberMeshRight.position.x = playgroundCenterX + 180;
//     scene.add(numberMeshRight);
//   }
// }

const flagBase = new THREE.Mesh(
  new CylinderBufferGeometry(1, 1, 35, 32),
  new THREE.MeshStandardMaterial({
    map: flagBaseTexutes.flagBaseColorTexture,
    aoMap: flagBaseTexutes.flagBaseAmbientOcclusionTexture,
    normalMap: flagBaseTexutes.flagBaseNormalTexture,
    roughnessMap: flagBaseTexutes.flagBaseRoughnessTexture,
  })
);
flagBase.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(flagBase.geometry.attributes.uv.array, 2)
);
flagBase.position.copy(new THREE.Vector3(60, 14, 578.1));
// scene.add(flagBase);

const flagGeometry = new PlaneBufferGeometry(13, 13, 32, 32);
const flagMaterial = new THREE.ShaderMaterial({
  vertexShader: flagVertexShader,
  fragmentShader: flagFragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uFrequency: { value: new THREE.Vector2(1.04, 2.56) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("orange") },
    uTexture: { value: flagTextures.flagColorTexture },
  },
});
const flag = new THREE.Mesh(flagGeometry, flagMaterial);
flag.position.copy(flagBase.position.clone().add(new THREE.Vector3(-4, 12, 0)));
flag.position.x = 52.889;
flag.position.y = 25.928;
flag.scale.y = 2 / 3;
// scene.add(flag);

// Create the visual target (red back of goal)
let target = new THREE.Mesh(
  new THREE.PlaneGeometry(35, 60),
  new THREE.MeshStandardMaterial({
    map: targetTextures.targetColorTexture,
    alphaTest: 0.1,
  })
);
target.position.set(0, 30, 0);
scene.add(target);
intersectObjects.push(target);

// No separate collision objects needed - we'll use only the target for collision detection
// The target itself will determine success/failure based on hit position

// Target is already added to intersectObjects, no additional collision setup needed
/*
    Overlay
*/
const overlay = new THREE.Mesh(
  new PlaneBufferGeometry(2, 2, 1, 1),
  new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uAlpha: { value: 1 },
    },
    vertexShader: `
        void main()
        {
            gl_Position =  vec4(position ,1.0);
        }
        `,
    fragmentShader: `
        uniform float uAlpha;
        void main() 
        {
            gl_FragColor = vec4(0.0 , 0.0 , 0.0 , uAlpha);
        }
        `,
  })
);
scene.add(overlay);

/*
    Reycaster
*/
const raycaster = new THREE.Raycaster();
raycaster.far = 20;
raycaster.near = 2;
let rayOrigin;
let rayDirection = new THREE.Vector3(0, 0, -10);
rayDirection.normalize();

/*
    Renderer
*/
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;

// Prevent touch scrolling on the canvas to avoid interference with game input
canvas.addEventListener("touchstart", (event) => {
  event.preventDefault();
}, { passive: false });

canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", (event) => {
  event.preventDefault();
}, { passive: false });

/*
    Shadows
*/
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 450;
directionalLight.shadow.camera.right = 200;
directionalLight.shadow.camera.left = -200;
directionalLight.shadow.camera.top = 200;
directionalLight.shadow.camera.bottom = -200;
directionalLight.shadow.mapSize.x = 1024;
directionalLight.shadow.mapSize.y = 1024;

directionalLight.castShadow = true;
floor.receiveShadow = true;
barrel.castShadow = true;
// base.receiveShadow = true;

/*
    Utils
*/
const lerp = (a, b, t) => a + (b - a) * t;

let angleXY, angleXZ;

const updateCannon = () => {
  barrel.rotation.z = -lerp(-Math.PI / 4, Math.PI / 4, mouse.x);
  barrel.rotation.x = -lerp(Math.PI / 8, Math.PI / 2, mouse.y);
  cannonDirection.set(0, 1, 0);
  cannonDirection.applyQuaternion(barrel.quaternion);
  let offset = cannonDirection.clone().multiplyScalar(-60); // Increased from -40 to -60 for better field view
  camera.position.copy(barrel.position.clone().add(offset));
  camera.position.y = barrel.position.y + 15; // Increased from 10 to 15 for better overview
  camera.lookAt(
    barrel.position.clone().add(cannonDirection.clone().multiplyScalar(30))
  );
  let vector = new THREE.Vector3();
  camera.getWorldDirection(vector);
  angleXY = Math.asin(cannonDirection.clone().y);
  angleXZ = Math.acos(cannonDirection.clone().x);
};

// Draw the Shooting ball-------------------
let objectsToUpdate = [];

// Add event listeners that reference objectsToUpdate, camera, and renderer
window.addEventListener("keydown", (event) => {
  if (!objectsToUpdate.length) {
    return;
  }
  if (event.code === "Digit2") {
    isCameraChasing = true;
  } else if (event.code === "Digit1") {
    isCameraChasing = false;
  }
});

window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;
  camera.aspect = size.width / size.height;
  chasingCamera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  chasingCamera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
const createCannonBall = () => {
  removeBallsGreaterThanOne();
  numberOfBalls--;
  numberofBallsWidget.innerHTML = numberOfBalls;
  
  // Reset target model to default state when starting new shot
  if (target) {
    target.material.color.set("#ffffff"); // Reset to white
    // Ensure target is in intersectObjects for collision detection
    if (!intersectObjects.includes(target)) {
      intersectObjects.push(target);
    }
  }
  
  // Reset shot tracking for new shot
  shotedTaregt = [];
  
  // Reset shot state for new shot
  currentShotState = 'none';
  
  // Reset goal prediction flag for new shot
  goalPredictionActive = false;
  
  // Hide the ball model when shooting
  if (ballModel) {
    ballModel.visible = false;
    console.log('Ball model hidden when shooting');
  }
  // Create a regular sphere and scale it to football shape
  const footballGeometry = new THREE.SphereGeometry(paramters.radius * 5, 32, 32);
  
  // Configure texture settings
  paramters.ballTextures.color.wrapS = THREE.RepeatWrapping;
  paramters.ballTextures.color.wrapT = THREE.RepeatWrapping;
  paramters.ballTextures.color.flipY = false;
  paramters.ballTextures.color.repeat.set(1, 1);
  
  let cannonBall = new THREE.Mesh(
    footballGeometry,
    new THREE.MeshStandardMaterial({
      map: paramters.ballTextures.color,
      color: 0x8B4513, // Better brown color for football
      side: THREE.DoubleSide,
      transparent: false,
      roughness: 0.8,
      metalness: 0.0,
      normalMap: paramters.ballTextures.normal,
      roughnessMap: paramters.ballTextures.roughness,
    })
  );
  
  // Scale to make it football-shaped (this preserves UV mapping)
  cannonBall.scale.set(1.15, 0.65, 0.65);
  cannonBall.castShadow = true;
  cannonBall.position.copy(
    barrel.position.clone().add(new THREE.Vector3(0, 2, -1))
  );
  scene.add(cannonBall);

  if (axesHelper) {
    scene.remove(axesHelper);
  }
  axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
  
  const angular_speed = vector.create(
    paramters.angular_speedX,
    paramters.angular_speedY,
    paramters.angular_speedZ
  );
  let physicsBall = new Ball(
    barrel.position.clone().add(new THREE.Vector3(0, 1.5, -1)),
    paramters.speed,
    angleXY,
    angleXZ,
    paramters.radius,
    0,
    paramters.mass,
    paramters.dragCoeff,
    angular_speed,
    paramters.resistanseCoeff,
    paramters.frictionCoeff
  );
  world.add(physicsBall);
  objectsToUpdate.push({
    cannonBall,
    physicsBall,
  });
  intersectObjects.push(cannonBall);
};

const removeBallsGreaterThanOne = () => {
  if (objectsToUpdate.length >= 1) {
    objectsToUpdate.forEach((e) => {
      scene.remove(e.cannonBall);
      e.cannonBall.material.dispose();
      e.cannonBall.geometry.dispose();
      intersectObjects = intersectObjects.filter((i) => i !== e.cannonBall);
    });
    objectsToUpdate = [];
    
    // Show the ball model again when removing previous balls
    ensureBallModelVisible();
  }
};
const updateTarget = () => {
  setTimeout(() => {
    // Keep target in fixed position - no need to move it
    // Target stays at (0, 30, 0)
    
    // Update cannon position but keep it aligned with target center
    // Only add small random variations to maintain alignment
    const newCannonPosition = new THREE.Vector3(0, 10, 660).add(
      new THREE.Vector3(
        (Math.random() - 0.5) * 20,   // Small random X position (-10 to +10) to maintain alignment
        (Math.random() - 0.5) * 10,   // Small random Y position (-5 to +5)
        (Math.random() - 0.5) * 40    // Small random Z position (-20 to +20)
      )
    );
    
    // Update cannon barrel position
    barrel.position.copy(newCannonPosition);
    
    // Update ball model position to match the new cannon position
    ensureBallModelVisible();
    
    // Force update ball model position to ensure proper alignment and visibility
    if (ballModel) {
      const ballPosition = barrel.position.clone().add(new THREE.Vector3(0, -8.5, -1));
      // Ensure ball is always above ground level (field is at y=0)
      ballPosition.y = Math.max(ballPosition.y, 2); // Minimum 2 units above ground
      ballModel.position.copy(ballPosition);
      console.log('Ball model position updated to:', ballModel.position);
    }
    
    // Ensure target is in collision detection (it should always be)
    if (!intersectObjects.includes(target)) {
      intersectObjects.push(target);
      console.log('Target added back to collision detection');
    }
    
    console.log('Cannon moved to new position (aligned with target):', newCannonPosition);
  }, 1000);
};

const updateWidgets = () => {
  score++;
  scoreWidget.innerHTML = score;
  numberOfTargets--;
  targetWidget.innerHTML = numberOfTargets;
  if (numberOfTargets == 0) {
    gameFinshed.classList.remove("hide");
    document.querySelector(".status").innerHTML = "You Won";
    isFinished = true;
  }
};

const checkGame = () => {
  if (numberOfTargets === 0) {
    gameFinshed.classList.remove("hide");
    let status = document.querySelector(".status");
    status.innerHTML = "You Won";
    status.style.color = "#346751";
    isFinished = true;
  } else if (numberOfBalls <= numberOfTargets && numberOfTargets != 1) {
    gameFinshed.classList.remove("hide");
    let status = document.querySelector(".status");
    status.innerHTML = "You Lose";
    status.style.color = "#CE1212";
    isFinished = true;
  }
};

const checkWallCollisions = (object) => {
  const ball = object.cannonBall;
  const physicsBall = object.physicsBall;
  
  // Define wall boundaries (same as ad board positions)
  const leftWall = -150;   // Left ad board position
  const rightWall = 270;   // Right ad board position
  const backWall = -225;   // Back ad board position
  const frontWall = 800;   // Front boundary
  
  // Check if ball is hitting walls and bounce it back
  if (ball.position.x <= leftWall) {
    // Ball hit left wall - bounce back
    ball.position.x = leftWall + 1; // Move ball slightly away from wall
    physicsBall.position.x = leftWall + 1;
    physicsBall.velocity.x = Math.abs(physicsBall.velocity.x) * 0.8; // Bounce with energy loss
    console.log('Ball bounced off left wall');
  }
  
  if (ball.position.x >= rightWall) {
    // Ball hit right wall - bounce back
    ball.position.x = rightWall - 1; // Move ball slightly away from wall
    physicsBall.position.x = rightWall - 1;
    physicsBall.velocity.x = -Math.abs(physicsBall.velocity.x) * 0.8; // Bounce with energy loss
    console.log('Ball bounced off right wall');
  }
  
  if (ball.position.z <= backWall) {
    // Ball hit back wall - bounce back
    ball.position.z = backWall + 1; // Move ball slightly away from wall
    physicsBall.position.z = backWall + 1;
    physicsBall.velocity.z = Math.abs(physicsBall.velocity.z) * 0.8; // Bounce with energy loss
    console.log('Ball bounced off back wall');
  }
  
  if (ball.position.z >= frontWall) {
    // Ball hit front wall - bounce back
    ball.position.z = frontWall - 1; // Move ball slightly away from wall
    physicsBall.position.z = frontWall - 1;
    physicsBall.velocity.z = -Math.abs(physicsBall.velocity.z) * 0.8; // Bounce with energy loss
    console.log('Ball bounced off front wall');
  }
};

const checkBallPosition = (ball) => {
  // Define exact playground boundaries based on ad board positions
  const playgroundLeft = -150;   // Left ad board position
  const playgroundRight = 270;   // Right ad board position  
  const playgroundBack = -225;   // Back ad board position
  const playgroundFront = 800;   // Front boundary (extended for camera)
  
  // Add small buffer to prevent premature boundary detection
  const buffer = 5; // 5 unit buffer
  
  // Check if ball is within playground boundaries (with buffer)
  if (
    ball.position.x >= (playgroundLeft + buffer) &&
    ball.position.x <= (playgroundRight - buffer) &&
    ball.position.z >= (playgroundBack + buffer) &&
    ball.position.z <= (playgroundFront - buffer)
  ) {
    return; // Ball is still within playground, continue
  } else {
    // Ball is outside playground boundaries - restart shot
    console.log('Ball went outside playground boundaries - restarting shot');
    
    setTimeout(() => {
      // Remove the current ball
      scene.remove(ball);
      ball.geometry.dispose();
      ball.material.dispose();
      objectsToUpdate = objectsToUpdate.filter((e) => e.cannonBall !== ball);
      intersectObjects = intersectObjects.filter((obj) => obj !== ball);
      isCameraChasing = false;
      
      // Show the ball model again
      ensureBallModelVisible();
      
      // Reset shot state for automatic restart
      shotedTaregt = [];
      currentShotState = 'none';
      goalPredictionActive = false;
      
      // Reset target to default state
      if (target) {
        target.material.color.set("#ffffff");
        if (!intersectObjects.includes(target)) {
          intersectObjects.push(target);
        }
      }
      
      console.log('Shot restarted - ball is ready for new shot');
    }, 1000);
  }
};

let previousAngle = 1.5707963268 * 2;
function rotateAboutPoint(obj, point, axis, theta) {
  obj.rotateOnAxis(axis, -previousAngle);
  obj.position.sub(point);
  obj.position.applyAxisAngle(axis, -previousAngle);
  obj.position.add(point);

  obj.position.sub(point);
  obj.position.applyAxisAngle(axis, theta);
  obj.position.add(point);

  obj.rotateOnAxis(axis, theta);
  previousAngle = theta;
}
rotateAboutPoint(
  flag,
  flagBase.position,
  new THREE.Vector3(0, 1, 0),
  paramters.windAngle
);

let shotedTaregt = [];
const clock = new THREE.Clock();
let oldElapsedTime = 0;
let goalPredictionActive = false;

// Shot state tracking to prevent multiple success/failure detections per shot
let currentShotState = 'none'; // 'none', 'missed', 'success', 'failure'

//const control = new OrbitControls(camera, canvas)

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  flagMaterial.uniforms.uTime.value = elapsedTime * paramters.windSpeed;
  const delteTime = elapsedTime - oldElapsedTime;
  world.update(delteTime);
  oldElapsedTime = elapsedTime;

  for (const object of objectsToUpdate) {
    object.cannonBall.position.copy(object.physicsBall.position);
    object.cannonBall.quaternion.copy(object.physicsBall.quaternion);
    
    // Check for wall collisions and bounce before other collision detection
    checkWallCollisions(object);
    
    checkBallPosition(object.cannonBall);
    rayOrigin = object.cannonBall.position;
    raycaster.set(rayOrigin, rayDirection);
    axesHelper?.position?.copy(object.cannonBall.position);
    axesHelper?.quaternion?.copy(object.cannonBall.quaternion);
    axesHelper.visible = paramters.axesHelper;
    
    // PREDICT if ball will be successful BEFORE collision detection
    if (!goalPredictionActive && target) {
      const ballPosition = object.cannonBall.position;
      const targetPosition = target.position;
      const distanceToTarget = ballPosition.distanceTo(targetPosition);
      
      // If ball is getting close to target
      if (distanceToTarget < 80) { // Within 80 units of target
        const ballVelocity = object.physicsBall.velocity;
        const directionToTarget = targetPosition.clone().sub(ballPosition).normalize();
        const velocityDirection = ballVelocity.clone().normalize();
        
        // Check if ball is moving towards the target
        const dotProduct = directionToTarget.dot(velocityDirection);
        if (dotProduct > 0.8) { // Ball is moving towards target (80% alignment)
          console.log('PREDICTING SUCCESS! Ball will likely hit target - preparing smooth transition...');
          goalPredictionActive = true;
          
          // PREPARE SETTINGS IN ADVANCE for smooth transition
          // No need to remove separate collision objects since we only use the target
          
          // Make the ball non-collidable with everything except target
          object.physicsBall.collisionFilterGroup = 0;
          object.physicsBall.collisionFilterMask = 0;
          
          // Show subtle hint that goal is coming
          target.material.color.set("#eeeeff"); // Very light blue hint
        }
      }
    }
    
    const intersects = raycaster.intersectObjects(intersectObjects, true);
    for (let intersect of intersects) {
      if (!shotedTaregt.includes(intersect.object)) {
        // Wall collisions are now handled in checkWallCollisions function
        
        // Check if it's the visual target - need to determine if hit open area or goal post structure
        if (intersect.object === target && currentShotState === 'none') {
          // Calculate the hit position relative to the target's center
          const targetPosition = target.position;
          const hitPoint = intersect.point;
          
          // Convert hit point to local target coordinates
          const localHitPoint = hitPoint.clone().sub(targetPosition);
          
          // Target dimensions: 35 width x 60 height
          // Goal post opening dimensions (the success area - blue region)
          const goalOpeningWidth = 24;
          const goalOpeningHeight = 28;
          const goalOpeningOffsetY = 8;
          
          // Check if hit is within the goal post opening (success area)
          const isInGoalOpening = 
            Math.abs(localHitPoint.x) <= goalOpeningWidth / 2 && // Within opening width
            localHitPoint.y >= goalOpeningOffsetY - goalOpeningHeight / 2 && // Above bottom of opening
            localHitPoint.y <= goalOpeningOffsetY + goalOpeningHeight / 2;   // Below top of opening
          
          if (isInGoalOpening) {
            // SUCCESS - Hit the open area (blue region)
            console.log('GOAL! Ball went through the goal post opening');
            currentShotState = 'success';
            shotedTaregt.push(intersect.object);
            
            // Show green color effect on target for success
            target.material.color.set("#00ff00");
            setTimeout(() => {
              target.material.color.set("#ffffff"); // Reset to white
            }, 500);
            
            // Remove target from collision detection temporarily so ball can pass through
            intersectObjects = intersectObjects.filter(obj => obj !== target);
            // Note: Target will be added back to collision detection in updateTarget() after 1 second
            
            // Reset prediction flag
            goalPredictionActive = false;
            
            updateTarget();
            updateWidgets();
            checkGame();
          } else {
            // FAILURE - Hit the goal post structure (red regions)
            console.log('MISS! Ball hit the goal post structure');
            currentShotState = 'failure';
            
            // Show red color effect on target for failure
            target.material.color.set("#ff0000");
            setTimeout(() => {
              target.material.color.set("#ffffff"); // Reset to white
            }, 500);
            
            ensureBallModelVisible();
            object.physicsBall.fraction(intersect);
          }
        }
        // Other objects (ground, etc.) - mark as missed if not already determined
        else if (intersect.object.geometry.type !== "PlaneGeometry" && currentShotState === 'none') {
          console.log('MISS! Ball hit ground or other object');
          currentShotState = 'missed';
          ensureBallModelVisible();
          object.physicsBall.fraction(intersect);
        }
      }
    }
  }
  if (isObjectLoaded) {
    updateCannon();
  }
  if (objectsToUpdate.slice(-1)[0]?.cannonBall) {
    chasingCamera.position.copy(
      objectsToUpdate
        .slice(-1)[0]
        ?.cannonBall.position.clone()
        .add(new THREE.Vector3(0, 0, 50))
    );
    chasingCamera.lookAt(objectsToUpdate.slice(-1)[0].cannonBall.position);
  }
  if (isCameraChasing) {
    renderer.render(scene, chasingCamera);
  } else {
    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);
};

tick();
