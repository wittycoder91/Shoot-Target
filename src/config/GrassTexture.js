import * as THREE from "three";
import createFootballFieldTexture from "./FootballFieldTexture";

const loadGrassTextures = (textureLoader) => {
  const grassTextures = {};
  
  // Use custom football field texture instead of grass texture
  const grassColorTexture = createFootballFieldTexture();
  
  // Keep other grass textures for normal mapping, roughness, etc.
  const grassMetalnessTexture = textureLoader.load(
    "textures\\grass\\7\\metalness.png"
  );
  const grassAmbientOcclusionTexture = textureLoader.load(
    "textures\\grass\\7\\ambientOcclusion.png"
  );
  const grassNormalTexture = textureLoader.load(
    "textures\\grass\\7\\normal.png"
  );
  const grassRoughnessTexture = textureLoader.load(
    "textures\\grass\\7\\roughness.png"
  );
  const grassHeightTexture = textureLoader.load(
    "textures\\grass\\7\\height.png"
  );

  // Set repeat for other textures (not the color texture as it's custom)
  grassAmbientOcclusionTexture.repeat.set(65, 65);
  grassNormalTexture.repeat.set(65, 65);
  grassRoughnessTexture.repeat.set(65, 65);
  grassHeightTexture.repeat.set(65, 65);
  grassMetalnessTexture.repeat.set(65, 65);

  // Set wrapping for other textures
  grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
  grassNormalTexture.wrapS = THREE.RepeatWrapping;
  grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
  grassHeightTexture.wrapS = THREE.RepeatWrapping;
  grassMetalnessTexture.wrapS = THREE.RepeatWrapping;

  grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
  grassNormalTexture.wrapT = THREE.RepeatWrapping;
  grassRoughnessTexture.wrapT = THREE.RepeatWrapping;
  grassHeightTexture.wrapT = THREE.RepeatWrapping;
  grassMetalnessTexture.wrapT = THREE.RepeatWrapping;

  grassTextures.grassColorTexture = grassColorTexture;
  grassTextures.grassAmbientOcclusionTexture = grassAmbientOcclusionTexture;
  grassTextures.grassNormalTexture = grassNormalTexture;
  grassTextures.grassRoughnessTexture = grassRoughnessTexture;
  grassTextures.grassHeightTexture = grassHeightTexture;
  grassTextures.grassMetalnessTexture = grassMetalnessTexture;

  return grassTextures;
};
export default loadGrassTextures;
