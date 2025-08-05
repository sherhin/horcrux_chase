import { spawnParticles } from './particle.js';
import { getDementors } from './dementor.js';

const MOVE_DURATION = 100;

export const player = {
  x: null,
  y: null,
  targetX: null,
  targetY: null,
  isMoving: false,
  image: null,
  init(img, tileSize, startCol = 1, startRow = 1) {
    this.image = img;
    this.x = this.targetX = startCol * tileSize;
    this.y = this.targetY = startRow * tileSize;
    this.isMoving = false;
  },
  move(dx, dy, tileSize, map) {
    if (this.isMoving) return null;
    const tentativeX = this.x + dx;
    const tentativeY = this.y + dy;
    const col = Math.round(tentativeX / tileSize);
    const row = Math.round(tentativeY / tileSize);
    const nx = col * tileSize;
    const ny = row * tileSize;
    if (map[row]?.[col] === 0) {
      const occupied = getDementors().some(d => {
        const currentCol = Math.floor(d.x / tileSize);
        const currentRow = Math.floor(d.y / tileSize);
        const targetCol = Math.floor((d.isMoving ? d.targetX : d.x) / tileSize);
        const targetRow = Math.floor((d.isMoving ? d.targetY : d.y) / tileSize);
        return (currentCol === col && currentRow === row) ||
               (targetCol === col && targetRow === row);
      });
      if (occupied) {
        const px = this.x + tileSize / 2;
        const py = this.y + tileSize / 2;
        spawnParticles(px, py, 'harry', dx, dy);
        return null;
      }

      const startX = this.x;
      const startY = this.y;
      const px = startX + tileSize / 2;
      const py = startY + tileSize / 2;
      spawnParticles(px, py, 'harry', dx, dy);

      this.targetX = nx;
      this.targetY = ny;
      this.isMoving = true;
      const startTime = performance.now();
      const animate = (time) => {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / MOVE_DURATION, 1);
        const eased = t * t * (3 - 2 * t); // smoothstep easing for smoother motion
        this.x = startX + (this.targetX - startX) * eased;
        this.y = startY + (this.targetY - startY) * eased;
        if (elapsed < MOVE_DURATION) {
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

