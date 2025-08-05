import { spawnParticles } from './particle.js';

export const tom = { x: null, y: null, targetX: null, targetY: null, isMoving: false, image: null };

const quotes = [
    "Отдай это, Поттер.",
    "Ты будешь умолять меня о пощаде!",
    "Это МОЁ!",
    "Ты за это поплатишься.",
    "Ты думаешь, это поможет сбежать от меня?",
    "Зачем убегать, Гарри?",
    "Я могу предложить тебе кое-что получше.",
    "Я разорву тебя на кусочки, мальчишка.",
];

let speaking = false;
let speechTimer = null;

export function initTom(img, tileSize, startCol = 10, startRow = 2) {
    tom.image = img;
    tom.x = tom.targetX = startCol * tileSize;
    tom.y = tom.targetY = startRow * tileSize;
    tom.isMoving = false;

    // Reset speech state so Tom can move immediately after a restart
    speaking = false;
    if (speechTimer) {
        clearTimeout(speechTimer);
        speechTimer = null;
    }
}

export function moveTom(path, tileSize, steps = 1) {
    if (speaking || tom.isMoving || path.length === 0) return;
    const prevX = tom.x + tileSize / 2;
    const prevY = tom.y + tileSize / 2;
    const stepIndex = Math.min(
        Math.max(0, Math.floor(steps) - 1),
        path.length - 1
    );
    const step = path[stepIndex];
    tom.targetX = step.col * tileSize;
    tom.targetY = step.row * tileSize;
    tom.isMoving = true;
    const startX = tom.x;
    const startY = tom.y;
    const startTime = performance.now();
    const duration = 200;
    const animate = (time) => {
        const elapsed = time - startTime;
        let t = Math.min(elapsed / duration, 1);
        t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        tom.x = startX + (tom.targetX - startX) * t;
        tom.y = startY + (tom.targetY - startY) * t;
        if (elapsed < duration) {
            requestAnimationFrame(animate);
        } else {
            tom.x = tom.targetX;
            tom.y = tom.targetY;
            tom.isMoving = false;
        }
    };
    requestAnimationFrame(animate);
    const newX = tom.targetX + tileSize / 2;
    const newY = tom.targetY + tileSize / 2;
    spawnParticles(prevX, prevY, 'tom', newX - prevX, newY - prevY);
}

export function drawTom(ctx, tileSize) {
    const size = tileSize * 1.4;
    const offsetX = (size - tileSize) / 2;
    const offsetY = size - tileSize;
    ctx.drawImage(tom.image, tom.x - offsetX, tom.y - offsetY, size, size);
}

export function sayTomQuote() {
    if (speaking) clearTimeout(speechTimer);

    const txt = quotes[Math.floor(Math.random() * quotes.length)];
    const div = document.getElementById('tomSpeech');
    div.innerText = txt;
    div.style.display = 'block';
    speaking = true;

    speechTimer = setTimeout(() => {
        div.style.display = 'none';
        speaking = false;
    }, 2000);
    
}

export function updateSpeechPosition(canvas, tileSize) {
    if (!speaking) return;
    const rect = canvas.getBoundingClientRect();
    const size = tileSize * 1.4;
    const offsetY = size - tileSize;
    let sx = rect.left + tom.x + tileSize / 2;
    let sy = rect.top + tom.y - offsetY - 40; // чуть выше
    const div = document.getElementById('tomSpeech');
    const width = div.offsetWidth;
    const height = div.offsetHeight;

    sx = Math.max(rect.left, Math.min(sx, rect.right - width));
    sy = Math.max(rect.top, Math.min(sy, rect.bottom - height));

    div.style.left = `${sx}px`;
    div.style.top = `${sy}px`;
}

export function stopTomSpeech() {
    const div = document.getElementById('tomSpeech');
    if (div) {
        div.style.display = 'none';
    }
    if (speechTimer) {
        clearTimeout(speechTimer);
        speechTimer = null;
    }
    speaking = false;
}
