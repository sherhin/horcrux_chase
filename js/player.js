import { spawnParticles } from './particle.js';

export const player = {
  x: null,
  y: null,
  image: null,
  init(img, tileSize) {
    this.image = img;
    this.x = tileSize;
    this.y = tileSize;
  },
  move(dx, dy, tileSize, map) {
    const nx = this.x + dx, ny = this.y + dy;
    const col = Math.floor(nx / tileSize), row = Math.floor(ny / tileSize);
    if (map[row]?.[col] === 0) {
      const px = this.x + tileSize / 2;
      const py = this.y + tileSize / 2;
      this.x = nx;
      this.y = ny;
      spawnParticles(px, py, 'harry', dx, dy);
      return { col, row };
    }
    return null;
  },
  draw(ctx, tileSize) {
    ctx.drawImage(this.image, this.x, this.y, tileSize, tileSize);
  }
};

