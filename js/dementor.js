let dementors = [];

export function generateDementors(image, map) {
  dementors = [];
  let count = 0;

  while (count < 3) {
    let x = Math.floor(Math.random() * map[0].length);
    let y = Math.floor(Math.random() * map.length);

    if (map[y][x] === 0 && !dementors.some(d => d.x === x && d.y === y)) {
      dementors.push({ image, x, y });
      count++;
    }
  }
}

export function drawDementors(ctx, tileSize) {
  dementors.forEach(d => {
    ctx.drawImage(d.image, d.x * tileSize, d.y * tileSize, tileSize, tileSize);
  });
}
