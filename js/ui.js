
export function initButtonControls(onKey) {
  const controls = document.getElementById('controls');
  if (!controls) return;

  controls.querySelectorAll('button').forEach((btn) => {
    let interval;
    const key = btn.dataset.key;

    const clear = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      clear();
      onKey({ key });
      interval = setInterval(() => onKey({ key }), 100);
    });

    btn.addEventListener('pointerup', clear);
    btn.addEventListener('pointerleave', clear);
  });
}

