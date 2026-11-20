/* ================== SOUND EFFECTS (Web Audio API) ================== */
let sfxOn = true, audioCtx = null;
function unlockAudio(){
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function beep(freq, dur, type = 'sine'){
  if (!sfxOn) return;
  try {
    unlockAudio();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.06, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (dur || 0.08));
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + (dur || 0.08));
  } catch(e){}
}

const sfx = {
  pop: () => beep(520, 0.08, 'triangle'),
  chime: () => { beep(587, 0.25); setTimeout(() => beep(880, 0.4), 80); },
  success: () => { beep(440, 0.12); setTimeout(() => beep(660, 0.15), 90); setTimeout(() => beep(880, 0.28), 180); }
};

document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
document.addEventListener('click', unlockAudio, { once: true });

if ($('soundToggle')) {
  $('soundToggle').addEventListener('click', () => {
    sfxOn = !sfxOn;
    $('soundToggle').innerHTML = sfxOn ? '<i class="fas fa-volume-high"></i>' : '<i class="fas fa-volume-xmark"></i>';
    $('soundToggle').classList.toggle('off', !sfxOn);
    toast(sfxOn ? 'Bật âm thanh tương tác' : 'Tắt âm thanh tương tác');
  });
}

/* ================== BALLOONS & CONFETTI ================== */
(function initBalloons(){
  const wrap = $('balloons');
  if (!wrap) return;
  const colors = ['#f472b6','#a855f7','#fbbf24','#60a5fa','#34d399','#ec4899'];
  for (let i = 0; i < 7; i++){
    const b = document.createElement('div');
    b.className = 'balloon';
    b.style.setProperty('--x', rand(2, 94) + '%');
    b.style.setProperty('--dur', rand(13, 22) + 's');
    b.style.setProperty('--delay', (-rand(0, 20)) + 's');
    const c = colors[i % colors.length];
    b.style.background = `radial-gradient(circle at 35% 30%, #fff 0%, ${c} 55%, ${c} 100%)`;
    wrap.appendChild(b);
  }
})();

var canvas = $('confetti-canvas'), ctx = canvas ? canvas.getContext('2d') : null;
var W = 0, H = 0, particles = [], rafId = null;

if (typeof globalThis !== 'undefined') {
  globalThis.canvas = canvas;
  globalThis.ctx = ctx;
  globalThis.particles = particles;
  globalThis.rafId = rafId;
}

function resizeCanvas(){
  if (!canvas) return;
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function makeParticle(x, y, burst = false){
  const shapes = ['rect','circle','heart','star'];
  return {
    x: x !== undefined ? x : Math.random() * (W || 800),
    y: y !== undefined ? y : (burst ? (H || 600) + 10 : Math.random() * (H || 600) - (H || 600)),
    vx: rand(-2, 2) + (burst ? rand(-7, 7) : 0),
    vy: burst ? rand(-16, -7) : rand(2, 5),
    size: rand(5, 12),
    color: `hsl(${rand(0, 360)}, 85%, 62%)`,
    rot: rand(0, Math.PI * 2),
    rotSpd: rand(-0.08, 0.08),
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    life: burst ? rand(70, 130) : Infinity
  };
}

function drawHeart(p){
  const s = p.size;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(0, 0, -s/2, 0, -s/2, s * 0.3);
  ctx.bezierCurveTo(-s/2, s * 0.75, 0, s, 0, s * 1.2);
  ctx.bezierCurveTo(0, s, s/2, s * 0.75, s/2, s * 0.3);
  ctx.bezierCurveTo(s/2, 0, 0, 0, 0, s * 0.3);
  ctx.fill();
}

function stepConfetti(){
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);
  for (let i = particles.length - 1; i >= 0; i--){
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.rotSpd;
    if (p.life !== Infinity){
      p.vy += 0.35;
      p.life--;
      if (p.life <= 0 || p.y > H + 40){ particles.splice(i, 1); continue; }
    } else if (p.y > H + 20){
      p.y = -20;
      p.x = Math.random() * W;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.shape === 'rect') ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
    else if (p.shape === 'circle'){ ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill(); }
    else if (p.shape === 'heart') drawHeart(p);
    ctx.restore();
  }
  rafId = requestAnimationFrame(stepConfetti);
}

function burstAt(x, y, n = 40){
  for (let i = 0; i < n; i++) particles.push(makeParticle(x, y, true));
  if (!rafId) rafId = requestAnimationFrame(stepConfetti);
}

/* ================== CANDLE BLOWING (MICROPHONE ANALYSER) ================== */
let micStream = null, micAnalyser = null, micInterval = null;
const candleModal = $('candleModal');
const flame = $('candleFlame'), smoke = $('candleSmoke');

function openCandleModal(){
  if (!candleModal) return;
  candleModal.classList.add('show');
  if (flame) flame.classList.remove('extinguished');
}

function closeCandleModal(){
  if (!candleModal) return;
  candleModal.classList.remove('show');
  stopMic();
}

function extinguishCandle(){
  if (!flame || flame.classList.contains('extinguished')) return;
  flame.classList.add('extinguished');
  if (smoke) {
    smoke.classList.add('puff');
    setTimeout(() => smoke.classList.remove('puff'), 1800);
  }
  if ($('micStatus')) $('micStatus').textContent = '🎉 BẠN ĐÃ THỔI NẾN THÀNH CÔNG! ƯỚC ĐIỀU ƯỚC NHÉ! 🎂';
  beep(1046, 0.15, 'triangle');
  setTimeout(() => beep(1318, 0.2, 'triangle'), 120);

  const r = flame.getBoundingClientRect();
  burstAt(r.left + r.width / 2, r.top, 80);
  stopMic();
  toast('Chúc mừng! Điều ước của bạn sẽ thành hiện thực ✨');
}

function stopMic(){
  if (micInterval) clearInterval(micInterval);
  if (micStream){
    micStream.getTracks().forEach(t => t.stop());
    micStream = null;
  }
  if ($('micMeterFill')) $('micMeterFill').style.width = '0%';
  if ($('startMicBtn')) $('startMicBtn').style.display = 'inline-block';
}

if ($('openCandleBtn')) $('openCandleBtn').addEventListener('click', openCandleModal);
if ($('closeCandleBtn')) $('closeCandleBtn').addEventListener('click', closeCandleModal);
if (flame) flame.addEventListener('click', extinguishCandle);

if ($('startMicBtn')) {
  $('startMicBtn').addEventListener('click', async () => {
    try {
      unlockAudio();
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const src = audioCtx.createMediaStreamSource(micStream);
      micAnalyser = audioCtx.createAnalyser();
      micAnalyser.fftSize = 256;
      src.connect(micAnalyser);

      if ($('micStatus')) $('micStatus').textContent = 'Đang lắng nghe... Thổi thật mạnh vào micro nào! 💨';
      $('startMicBtn').style.display = 'none';

      const data = new Uint8Array(micAnalyser.frequencyBinCount);
      micInterval = setInterval(() => {
        if (!micAnalyser) return;
        micAnalyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        let avg = sum / data.length;
        let pct = Math.min(100, (avg / 70) * 100);
        if ($('micMeterFill')) $('micMeterFill').style.width = pct + '%';

        if (avg > 55){
          extinguishCandle();
        }
      }, 60);
    } catch(err){
      if ($('micStatus')) $('micStatus').textContent = 'Không có quyền truy cập Mic. Bạn hãy bấm thẳng vào ngọn nến nhé!';
      toast('Không mở được Mic — hãy chạm vào ngọn nến 👆');
    }
  });
}
