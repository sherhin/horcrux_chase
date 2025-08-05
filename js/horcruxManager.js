export let horcruxes = [];

function isTooClose(x, y, arr, minDistance) {
  return arr.some(p => Math.abs(p.x - x) + Math.abs(p.y - y) < minDistance);
}

export function generateHorcruxes(templates, map, forbidden = [], minDistance = 1) {
  horcruxes = [];
  templates.forEach(img => {
    let x, y;
    do {
      x = Math.floor(Math.random() * map[0].length);
      y = Math.floor(Math.random() * map.length);
    } while (
      map[y][x] !== 0 ||
      isTooClose(x, y, horcruxes, minDistance) ||
      isTooClose(x, y, forbidden, minDistance)
    );
    horcruxes.push({ image: img, x, y });
  });
}

export function drawHorcruxes(ctx, tileSize) {
  horcruxes.forEach(h => {
    ctx.drawImage(h.image, h.x * tileSize, h.y * tileSize, tileSize, tileSize);
  });
}

export function checkPickup(col, row, onPickup) {
    const idx = horcruxes.findIndex(h => h.x === col && h.y === row);
    if (idx !== -1) {
        horcruxes.splice(idx, 1);
        onPickup();  
        return horcruxes.length === 0;  // если пусто — вернёт true (все собраны)
    }
    return false;
}


