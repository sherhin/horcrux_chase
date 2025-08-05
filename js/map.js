export let map = [];

export function generateMap(width, height) {
  // Initialize map filled with walls
  map = Array.from({ length: height }, () => Array(width).fill(1));

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  function inBounds(x, y) {
    return x > 0 && y > 0 && x < width - 1 && y < height - 1;
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function carve(x, y) {
    map[y][x] = 0;
    const order = dirs.slice();
    shuffle(order);
    for (const [dx, dy] of order) {
      const nx = x + dx * 2;
      const ny = y + dy * 2;
      if (inBounds(nx, ny) && map[ny][nx] === 1) {
        map[y + dy][x + dx] = 0;
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);

  // Ensure starting cells for Harry and Tom are open and connected
  if (height > 2 && width > 10) {
    map[1][1] = 0; // Harry
    map[2][9] = 0; // path to Tom
    map[2][10] = 0; // Tom
  }
export function generateMap(rows = 14, cols = 12) {
  const grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) return 1;
      return Math.random() < 0.3 ? 1 : 0;
    })
  );
  return grid;

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
