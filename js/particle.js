export class Particle {
  constructor(x, y, vx, vy, color, lifetime = 60, radius = 3) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.lifetime = lifetime;
    this.alpha = 1;
    this.initialLife = lifetime;
    this.radius = radius;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.lifetime--;
    this.alpha = this.lifetime / this.initialLife;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export const particles = [];

export function spawnParticles(x, y, character, dx = 0, dy = 0) {
  const colors = character === 'tom' ? ['green', 'silver'] : ['red', 'gold'];
  const mag = Math.sqrt(dx * dx + dy * dy) || 1;
  const dirX = dx / mag;
  const dirY = dy / mag;
  for (let i = 0; i < 4; i++) {
    const speed = Math.random() * 0.5 + 0.1;
    const vx = -dirX * speed + (Math.random() - 0.5) * 0.2;
    const vy = -dirY * speed + (Math.random() - 0.5) * 0.2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    particles.push(new Particle(x, y, vx, vy, color, 40, 2));
  }
}

export function updateAndDrawParticles(ctx) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    if (p.lifetime <= 0) {
      particles.splice(i, 1);
    } else {
      p.draw(ctx);
    }
  }
}

export function clearParticles() {
  particles.length = 0;
}

