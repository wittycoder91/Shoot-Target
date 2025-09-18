import * as THREE from "three";

const createFootballFieldTexture = () => {
  // Create a canvas to draw the football field
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size (higher resolution for better quality)
  const width = 2048;
  const height = 1024; // More realistic aspect ratio for football field
  canvas.width = width;
  canvas.height = height;
  
  // Field dimensions (American football field is 120 yards long, 53.33 yards wide)
  const fieldLength = 120; // yards (100 yards + 2x 10 yard end zones)
  
  // Calculate scaling factors
  const scaleX = width / fieldLength;
  
  // Base grass color (darker green)
  ctx.fillStyle = '#1a4d1a';
  ctx.fillRect(0, 0, width, height);
  
  // Add grass stripes (alternating lighter and darker green)
  const stripeWidth = 1.5; // yards per stripe (more realistic)
  const numStripes = Math.floor(fieldLength / stripeWidth);
  
  for (let i = 0; i < numStripes; i++) {
    if (i % 2 === 0) {
      // Lighter green stripe
      ctx.fillStyle = '#2d5a2d';
      ctx.fillRect(i * stripeWidth * scaleX, 0, stripeWidth * scaleX, height);
    }
  }
  
  // Draw yardage lines (every 10 yards)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  
  // Major yardage lines (every 10 yards) - only on the playing field (10-110 yards)
  for (let yard = 10; yard <= 110; yard += 10) {
    const x = yard * scaleX;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Add yard numbers (every 10 yards)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Left side numbers (10-50)
  for (let yard = 10; yard <= 50; yard += 10) {
    const x = yard * scaleX;
    ctx.save();
    ctx.translate(x, height * 0.15);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yard.toString(), 0, 0);
    ctx.restore();
    
    ctx.save();
    ctx.translate(x, height * 0.85);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yard.toString(), 0, 0);
    ctx.restore();
  }
  
  // Right side numbers (40-10, counting down)
  for (let yard = 60; yard <= 100; yard += 10) {
    const x = yard * scaleX;
    const displayYard = 100 - yard; // Reverse the numbers
    
    ctx.save();
    ctx.translate(x, height * 0.15);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(displayYard.toString(), 0, 0);
    ctx.restore();
    
    ctx.save();
    ctx.translate(x, height * 0.85);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(displayYard.toString(), 0, 0);
    ctx.restore();
  }
  
  // Add hash marks (small lines at the ends of the field)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  
  // Hash marks every yard on the playing field (10-110 yards)
  for (let yard = 10; yard <= 110; yard++) {
    const x = yard * scaleX;
    
    // Top hash marks (shorter lines)
    ctx.beginPath();
    ctx.moveTo(x, height * 0.05);
    ctx.lineTo(x, height * 0.12);
    ctx.stroke();
    
    // Bottom hash marks (shorter lines)
    ctx.beginPath();
    ctx.moveTo(x, height * 0.88);
    ctx.lineTo(x, height * 0.95);
    ctx.stroke();
  }
  
  // Add end zones with different styling
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, 0, 10 * scaleX, height); // Left end zone
  ctx.fillRect(110 * scaleX, 0, 10 * scaleX, height); // Right end zone
  
  // Add goal lines (thicker)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(10 * scaleX, 0);
  ctx.lineTo(10 * scaleX, height);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(110 * scaleX, 0);
  ctx.lineTo(110 * scaleX, height);
  ctx.stroke();
  
  // Add sideline markers (thick lines on the sides)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, 0);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(width, height);
  ctx.stroke();
  
  // Add midfield line (50-yard line)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(60 * scaleX, 0);
  ctx.lineTo(60 * scaleX, height);
  ctx.stroke();
  
  // Convert canvas to texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.flipY = false;
  
  return texture;
};

export default createFootballFieldTexture;
