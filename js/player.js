import { spawnParticles } from './particle.js';
import { getDementors } from './dementor.js';

const MOVE_DURATION = 100;

export const player = {
  x: null,
  y: null,
  targetX: null,
  targetY: null,
  isMoving: false,
  queuedMove: null,
  image: null,
  init(img, tileSize, startCol = 1, startRow = 1) {
    this.image = img;
    this.x = this.targetX = startCol * tileSize;
    this.y = this.targetY = startRow * tileSize;
    this.isMoving = false;
    this.queuedMove = null;
  },
  move(dx, dy, tileSize, map, onComplete) {
    if (this.isMoving) {
      this.queuedMove = { dx, dy };
      return null;
    }
    const currentCol = Math.round(this.x / tileSize);
    const currentRow = Math.round(this.y / tileSize);
    const targetCol = currentCol + Math.sign(dx);
    const targetRow = currentRow + Math.sign(dy);
    if (map[targetRow]?.[targetCol] === 0) {
      const occupied = getDementors().some(d => {
        const currentColD = Math.round(d.x / tileSize);
        const currentRowD = Math.round(d.y / tileSize);
        const targetColD = Math.round((d.isMoving ? d.targetX : d.x) / tileSize);
        const targetRowD = Math.round((d.isMoving ? d.targetY : d.y) / tileSize);
        return (currentColD === targetCol && currentRowD === targetRow) ||
               (targetColD === targetCol && targetRowD === targetRow);
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

      this.targetX = targetCol * tileSize;
      this.targetY = targetRow * tileSize;
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
          if (onComplete) onComplete({ col: targetCol, row: targetRow });
          if (this.queuedMove) {
            const next = this.queuedMove;
            this.queuedMove = null;
            this.move(next.dx, next.dy, tileSize, map, onComplete);
          }
        }
      };
      requestAnimationFrame(animate);

      return { col: targetCol, row: targetRow };
    }
    return null;
  },
  draw(ctx, tileSize) {
    ctx.drawImage(this.image, this.x, this.y, tileSize, tileSize);
  }
};

