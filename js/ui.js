
export function initButtonControls(onKey) {
  const controls = document.getElementById('controls');
  if (!controls) return;

  controls.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const key = btn.dataset.key;
      onKey({ key });
    });
  });
}

