import { spawnParticles } from './particle.js';

export const player = {
  x: null,
  y: null,
  targetX: null,
  targetY: null,
  isMoving: false,
  image: null,
  init(img, tileSize) {
    this.image = img;
    this.x = this.targetX = tileSize;
    this.y = this.targetY = tileSize;
    this.isMoving = false;
  },
  move(dx, dy, tileSize, map) {
    if (this.isMoving) return null;
    const nx = this.x + dx, ny = this.y + dy;
    const col = Math.floor(nx / tileSize), row = Math.floor(ny / tileSize);
    if (map[row]?.[col] === 0) {
      const px = this.x + tileSize / 2;
      const py = this.y + tileSize / 2;
      this.x = nx;
      this.y = ny;
      spawnParticles(px, py, 'harry', dx, dy);
      this.targetX = nx;
      this.targetY = ny;
      this.isMoving = true;
      const startX = this.x;
      const startY = this.y;
      const startTime = performance.now();
      const duration = 200;
      const animate = (time) => {
        const elapsed = time - startTime;
        let t = Math.min(elapsed / duration, 1);
        t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        this.x = startX + (this.targetX - startX) * t;
        this.y = startY + (this.targetY - startY) * t;
        if (elapsed < duration) {
          requestAnimationFrame(animate);
        } else {
          this.x = this.targetX;
          this.y = this.targetY;
          this.isMoving = false;
        }
      };
      requestAnimationFrame(animate);

      return { col, row };
    }
    return null;
  },
  draw(ctx, tileSize) {
    ctx.drawImage(this.image, this.x, this.y, tileSize, tileSize);
  }
};

