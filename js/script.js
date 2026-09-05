window.addEventListener("DOMContentLoaded", () => {
  drawGlobe();
  document.fonts.ready.then(runSplashSequence);
});

function runSplashSequence() {
  const heroO = document.getElementById("hero-o");
  const realO = document.getElementById("letter-o");

  setTimeout(() => { heroO.style.opacity = "1"; }, 900);

  setTimeout(() => {
    const heroRect = heroO.getBoundingClientRect();
    const targetRect = realO.getBoundingClientRect();

    const dx = (targetRect.left + targetRect.width / 2) - (heroRect.left + heroRect.width / 2);
    const dy = (targetRect.top + targetRect.height / 2) - (heroRect.top + heroRect.height / 2);
    const scale = targetRect.height / heroRect.height;

    heroO.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
  }, 1700);

  setTimeout(() => {
    heroO.style.opacity = "0";
    realO.style.visibility = "visible";
    document.getElementById("letter-s").classList.add("reveal");
    document.getElementById("letter-n").classList.add("reveal");
    document.getElementById("letter-r").classList.add("reveal");
  }, 2700);

  setTimeout(() => {
    document.getElementById("dots").style.opacity = "1";
  }, 3500);
}

function drawGlobe() {
  const canvas = document.getElementById("globeCanvas");
  const size = 520;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const R = size / 2;
  const cx = R, cy = R;

  function dot(x, y, r, alpha) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R - 2, 0, Math.PI * 2);
  ctx.clip();

  for (let lat = -80; lat <= 80; lat += 20) {
    const rad = (lat * Math.PI) / 180;
    const ringR = R * Math.cos(rad);
    const y = cy - R * Math.sin(rad);
    const steps = Math.max(24, Math.floor(ringR / 3));
    for (let i = 0; i < steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      const x = cx + ringR * Math.cos(theta);
      dot(x, y, 0.8, 0.3);
    }
  }

  const meridianCount = 8;
  for (let m = 0; m < meridianCount; m++) {
    const phase = (m / meridianCount) * Math.PI;
    for (let lat = -90; lat <= 90; lat += 3) {
      const rad = (lat * Math.PI) / 180;
      const x = cx + R * Math.cos(rad) * Math.sin(phase);
      const y = cy - R * Math.sin(rad);
      dot(x, y, 0.8, 0.25);
    }
  }

  const continents = [
    { x: cx - 60, y: cy - 40, w: 90, h: 60 },
    { x: cx + 30, y: cy - 70, w: 70, h: 100 },
    { x: cx + 10, y: cy + 40, w: 60, h: 50 }
  ];
  continents.forEach(c => {
    for (let i = 0; i < 250; i++) {
      const x = c.x + (Math.random() - 0.5) * c.w;
      const y = c.y + (Math.random() - 0.5) * c.h;
      if (Math.hypot(x - cx, y - cy) < R - 4) {
        dot(x, y, 0.9, Math.random() * 0.5 + 0.3);
      }
    }
  });

  ctx.restore();
}