// QR Code generator
class QRGenerator {
  generate(data) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 150;
    canvas.width = size;
    canvas.height = size;
    
    // Simple QR-like pattern
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    
    // Position markers
    const markers = [
      { x: 10, y: 10 },
      { x: size - 40, y: 10 },
      { x: 10, y: size - 40 }
    ];
    
    markers.forEach(marker => {
      // Outer square
      ctx.fillStyle = 'black';
      ctx.fillRect(marker.x, marker.y, 30, 30);
      // Inner square
      ctx.fillStyle = 'white';
      ctx.fillRect(marker.x + 5, marker.y + 5, 20, 20);
      // Center dot
      ctx.fillStyle = 'black';
      ctx.fillRect(marker.x + 12, marker.y + 12, 6, 6);
    });
    
    // Data pattern
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    const pattern = this.generatePattern(dataStr);
    const cellSize = 4;
    const startX = 50;
    const startY = 50;
    
    pattern.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          ctx.fillStyle = 'black';
          ctx.fillRect(startX + j * cellSize, startY + i * cellSize, cellSize, cellSize);
        }
      });
    });
    
    return canvas.toDataURL('image/png');
  }

  generatePattern(data) {
    // Create a 25x25 pattern based on the data
    const size = 25;
    const pattern = Array(size).fill(null).map(() => Array(size).fill(false));
    
    // Fill pattern based on data hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash = hash & hash;
    }
    
    const random = (seed) => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    
    let seed = Math.abs(hash);
    for (let i = 1; i < size - 1; i++) {
      for (let j = 1; j < size - 1; j++) {
        seed = (seed * 9301 + 49297) % 233280;
        if (seed % 3 === 0) {
          pattern[i][j] = true;
        }
      }
    }
    
    return pattern;
  }
}

const qrGenerator = new QRGenerator();