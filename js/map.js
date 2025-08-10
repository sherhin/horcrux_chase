export function generateMap(cols = 12, rows = 15, wallChance = 0.2) {
  const map = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) return 1;
      return Math.random() < wallChance ? 1 : 0;
    })
  );

  const isBorder = (r, c) => r === 0 || c === 0 || r === rows - 1 || c === cols - 1;

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      if (
        map[r][c] === 1 &&
        map[r + 1][c + 1] === 1 &&
        map[r][c + 1] === 0 &&
        map[r + 1][c] === 0
      ) {
        if (isBorder(r, c)) {
          map[r + 1][c + 1] = 0;
        } else if (isBorder(r + 1, c + 1)) {
          map[r][c] = 0;
        } else if (Math.random() < 0.5) {
          map[r][c] = 0;
        } else {
          map[r + 1][c + 1] = 0;
        }
      }

      if (
        map[r][c + 1] === 1 &&
        map[r + 1][c] === 1 &&
        map[r][c] === 0 &&
        map[r + 1][c + 1] === 0
      ) {
        if (isBorder(r, c + 1)) {
          map[r + 1][c] = 0;
        } else if (isBorder(r + 1, c)) {
          map[r][c + 1] = 0;
        } else if (Math.random() < 0.5) {
          map[r][c + 1] = 0;
        } else {
          map[r + 1][c] = 0;
        }
      }
    }
  }

  return map;
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
