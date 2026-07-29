// Enhanced barcode generator
class BarcodeGenerator {
  generate(parcelId) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 80;
    
    // Clear
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Generate barcode pattern
    const pattern = this.encodeToPattern(parcelId);
    const barWidth = 3;
    const totalWidth = pattern.length * barWidth;
    const startX = (canvas.width - totalWidth) / 2;
    
    ctx.fillStyle = 'black';
    pattern.forEach((bar, index) => {
      if (bar) {
        ctx.fillRect(startX + index * barWidth, 10, barWidth, canvas.height - 30);
      }
    });
    
    // Text
    ctx.fillStyle = 'black';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(parcelId, canvas.width / 2, canvas.height - 5);
    
    return canvas.toDataURL('image/png');
  }

  encodeToPattern(text) {
    // Simple pattern encoding
    const pattern = [];
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i) % 10 + 1;
      for (let j = 0; j < code; j++) {
        pattern.push(true);
        pattern.push(false);
      }
      pattern.push(false);
      pattern.push(false);
    }
    return pattern;
  }
}

const barcodeGenerator = new BarcodeGenerator();