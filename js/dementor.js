let dementors = [];

export function getDementors() {
  return dementors;
}

function isTooClose(col, row, arr, minDistance, tileSize) {
  return arr.some(d => {
    const dc = Math.floor(d.x / tileSize);
    const dr = Math.floor(d.y / tileSize);
    return Math.abs(dc - col) + Math.abs(dr - row) < minDistance;
  });
}

function isTooClosePoints(col, row, points, minDistance) {
  return points.some(p => Math.abs(p.x - col) + Math.abs(p.y - row) < minDistance);
}

function hasFreeNeighbor(col, row, map) {
  const dirs = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 }
  ];
  return dirs.some(dir => map[row + dir.dy]?.[col + dir.dx] === 0);
}

export function generateDementors(image, map, tileSize, forbidden = [], minDistance = 1) {
  dementors = [];
  let count = 0;

  while (count < 3) {
    const col = Math.floor(Math.random() * map[0].length);
    const row = Math.floor(Math.random() * map.length);

    const px = col * tileSize;
    const py = row * tileSize;

    if (
      map[row][col] === 0 &&
      hasFreeNeighbor(col, row, map) &&
      !isTooClose(col, row, dementors, minDistance, tileSize) &&
      !isTooClosePoints(col, row, forbidden, minDistance)
    ) {
      dementors.push({
        image,
        x: px,
        y: py,
        targetX: px,
        targetY: py,
        isMoving: false,
        lastMoveTime: performance.now()
      });
      count++;
    }
  }
}

export function updateDementors(tileSize, map) {
  const now = performance.now();
  dementors.forEach(d => {
    if (d.isMoving || now - d.lastMoveTime < 1000) return;

    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 }
    ];

    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    const col = Math.floor(d.x / tileSize);
    const row = Math.floor(d.y / tileSize);

    for (const dir of directions) {
      const newCol = col + dir.dx;
      const newRow = row + dir.dy;
      if (map[newRow]?.[newCol] !== 0) continue;

      const occupied = dementors.some(other => {
        if (other === d) return false;
        const oCol = Math.floor((other.isMoving ? other.targetX : other.x) / tileSize);
        const oRow = Math.floor((other.isMoving ? other.targetY : other.y) / tileSize);
        return oCol === newCol && oRow === newRow;
      });
      if (occupied) continue;

      d.targetX = newCol * tileSize;
      d.targetY = newRow * tileSize;
      d.isMoving = true;

      const startX = d.x;
      const startY = d.y;
      const startTime = performance.now();
      const duration = 600;

      const animate = (time) => {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);
        d.x = startX + (d.targetX - startX) * t;
        d.y = startY + (d.targetY - startY) * t;
        if (elapsed < duration) {
          requestAnimationFrame(animate);
        } else {
          d.x = d.targetX;
          d.y = d.targetY;
          d.isMoving = false;
          d.lastMoveTime = performance.now();
        }
      };

      requestAnimationFrame(animate);
      break;
    }
  });
}

export function drawDementors(ctx, tileSize) {
  dementors.forEach(d => {
    ctx.drawImage(d.image, d.x, d.y, tileSize, tileSize);
  });
}
