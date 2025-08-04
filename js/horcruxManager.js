export let horcruxes = [];

export function generateHorcruxes(templates, map, forbidden = []) {
  horcruxes = [];
  templates.forEach(img => {
    let x, y;
    do {
      x = Math.floor(Math.random() * map[0].length);
      y = Math.floor(Math.random() * map.length);
    } while (
      map[y][x] !== 0 ||
      horcruxes.some(h => h.x === x && h.y === y) ||
      forbidden.some(p => p.x === x && p.y === y)
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


