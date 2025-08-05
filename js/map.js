export function generateMap(cols = 12, rows = 15) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) return 1;
      return Math.random() < 0.3 ? 1 : 0;
    })
  );
}

export function drawMap(ctx, tileSize, wallImage, floorImage, map) {
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      const x = col * tileSize;
      const y = row * tileSize;
      if (map[row][col] === 1) {
        ctx.drawImage(wallImage, x, y, tileSize, tileSize);
      } else {
        ctx.drawImage(floorImage, x, y, tileSize, tileSize);
      }
    }
  }
}
