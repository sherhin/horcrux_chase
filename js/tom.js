export const tom = { x: null, y: null, image: null };

const quotes = [
    "Отдай это, Поттер.",
    "Ты будешь умолять меня о пощаде!",
    "Это МОЁ!",
    "Ты за это поплатишься.",
    "Бережно обращайся с моей душой.",
    "Ты думаешь, это поможет сбежать от меня?",
    "Зачем убегать, Гарри?"
];

let speaking = false;
let speechTimer = null;

export function initTom(img, tileSize) {
    tom.image = img;
    tom.x = 10 * tileSize;
    tom.y = 2 * tileSize;

    // Reset speech state so Tom can move immediately after a restart
    speaking = false;
    if (speechTimer) {
        clearTimeout(speechTimer);
        speechTimer = null;
    }
}

export function moveTom(path, tileSize, steps = 1) {
    if (speaking || path.length === 0) return;
    const step = path[Math.min(steps - 1, path.length - 1)];
    tom.x = step.col * tileSize;
    tom.y = step.row * tileSize;
}

export function drawTom(ctx, tileSize) {
    ctx.drawImage(tom.image, tom.x, tom.y, tileSize * 1.4, tileSize * 1.4);
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
    const sx = rect.left + tom.x + tileSize / 2;
    const sy = rect.top + tom.y - 40; // чуть выше
    const div = document.getElementById('tomSpeech');
    div.style.left = `${sx}px`;
    div.style.top = `${sy}px`;
}
