export class Particle {
  constructor(x, y, vx, vy, color, lifetime = 60) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.lifetime = lifetime;
    this.alpha = 1;
    this.initialLife = lifetime;
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
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export const particles = [];

export function spawnParticles(x, y, character) {
  const colors = character === 'tom' ? ['green', 'silver'] : ['red', 'gold'];
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 0.5;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const color = colors[Math.floor(Math.random() * colors.length)];
    particles.push(new Particle(x, y, vx, vy, color));
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

