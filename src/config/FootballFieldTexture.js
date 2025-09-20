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
  
  // Draw yardage lines (every 10 yards) - HORIZONTAL lines across the field
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  
  // Major yardage lines (every 10 yards) - HORIZONTAL lines across the field width
  for (let yard = 10; yard <= 110; yard += 10) {
    const y = (yard - 10) * (height / 100); // Map 10-110 yards to 0-height
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Add yard numbers (every 10 yards) - positioned along horizontal lines
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Left side numbers (10-50) - positioned along horizontal lines
  for (let yard = 10; yard <= 50; yard += 10) {
    const y = (yard - 10) * (height / 100); // Map 10-110 yards to 0-height
    ctx.save();
    ctx.translate(width * 0.15, y);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yard.toString(), 0, 0);
    ctx.restore();
    
    ctx.save();
    ctx.translate(width * 0.85, y);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yard.toString(), 0, 0);
    ctx.restore();
  }
  
  // Right side numbers (40-10, counting down) - positioned along horizontal lines
  for (let yard = 60; yard <= 100; yard += 10) {
    const y = (yard - 10) * (height / 100); // Map 10-110 yards to 0-height
    const displayYard = 100 - yard; // Reverse the numbers
    
    ctx.save();
    ctx.translate(width * 0.15, y);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(displayYard.toString(), 0, 0);
    ctx.restore();
    
    ctx.save();
    ctx.translate(width * 0.85, y);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(displayYard.toString(), 0, 0);
    ctx.restore();
  }
  
  // Add hash marks (small lines) - VERTICAL lines along the field length
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  
  // Hash marks every yard along the field width (VERTICAL lines)
  for (let i = 0; i <= 20; i++) {
    const x = (i * width) / 20; // Distribute evenly across field width
    
    // Left hash marks (shorter lines)
    ctx.beginPath();
    ctx.moveTo(x, height * 0.05);
    ctx.lineTo(x, height * 0.12);
    ctx.stroke();
    
    // Right hash marks (shorter lines)
    ctx.beginPath();
    ctx.moveTo(x, height * 0.88);
    ctx.lineTo(x, height * 0.95);
    ctx.stroke();
  }
  
  // Add end zones with different styling - HORIZONTAL zones
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, 0, width, height * 0.1); // Top end zone
  ctx.fillRect(0, height * 0.9, width, height * 0.1); // Bottom end zone
  
  // Add goal lines (thicker) - HORIZONTAL lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 0); // Top goal line
  ctx.lineTo(width, 0);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(0, height); // Bottom goal line
  ctx.lineTo(width, height);
  ctx.stroke();
  
  // Add sideline markers (thick lines on the sides) - VERTICAL lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(width, 0);
  ctx.lineTo(width, height);
  ctx.stroke();
  
  // Add midfield line (50-yard line) - HORIZONTAL line
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, height / 2); // Middle of field
  ctx.lineTo(width, height / 2);
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
