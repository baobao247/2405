/* ================== APP LOGIC & INTERACTION ================== */
let isPreviewMode = false;

// Birthday Preview Mode Toggle
if ($('bdayPreviewBtn')) {
  $('bdayPreviewBtn').addEventListener('click', () => {
    isPreviewMode = !isPreviewMode;
    document.body.classList.toggle('birthday-mode', isPreviewMode || isBirthdayToday());
    songs = (isPreviewMode || isBirthdayToday() ? BIRTHDAY_SONGS : REGULAR_SONGS).slice();
    renderPlaylist();
    if (isPreviewMode) {
      toast('🎉 Đã kích hoạt Chế độ Sinh Nhật thử nghiệm!');
      burstAt(W / 2, H / 3, 80);
      setSong(0, true);
    } else {
      toast('Đã quay về chế độ đếm ngược bình thường.');
      setSong(0, true);
    }
  });
}

/* ================== GIFT BOX ================== */
const GIFTS = [
  "🎉 Bảo là một người kiên trì, đam mê và luôn tỏa ra nguồn năng lượng tích cực!",
  "💖 Chúc Bảo tuổi mới luôn giữ vững ngọn lửa đam mê với công nghệ & học tập!",
  "🌟 Bước sang tuổi mới với nhiều thành công rực rỡ và những người bạn tri kỷ!",
  "🍰 Hãy luôn mỉm cười vì nụ cười của Bảo mang lại niềm vui cho rất nhiều người xung quanh!",
  "🎁 Món quà lớn nhất chính là luôn tin tưởng vào con đường mình đang đi!"
];
let giftIdx = 0;
const box = $('giftBox');
if (box){
  box.addEventListener('click', () => {
    box.classList.add('opened');
    setTimeout(() => box.classList.remove('opened'), 600);
    if ($('giftMessage')) {
      $('giftMessage').textContent = GIFTS[giftIdx % GIFTS.length];
      $('giftMessage').classList.add('show');
    }
    giftIdx++;
    beep(880, 0.1, 'triangle');
    const r = box.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height / 2, 50);
    if ($('giftHint')) $('giftHint').textContent = 'Chạm tiếp để mở thêm điều ước ✨';
  });
}

/* ================== WISHES & GOOGLE SHEETS ================== */
const WISH_KEY = 'dgb_wishes_v2';
let localWishes = [];
try { localWishes = JSON.parse(localStorage.getItem(WISH_KEY)) || []; } catch(e){ localWishes = []; }

function renderWishes(){
  const list = $('wishList');
  if (!list) return;
  if (!localWishes.length){
    list.innerHTML = '<div class="wish-empty" style="text-align:center; color:var(--text-muted); font-size:0.88rem; padding:18px;">Chưa có lời chúc nào — hãy là người đầu tiên gửi nhé! 💌</div>';
    return;
  }
  list.innerHTML = localWishes.slice(-20).reverse().map(w =>
    `<div class="wish-item" style="padding:10px 14px; background:rgba(255,255,255,0.7); border-radius:12px; margin-bottom:8px; border:1px solid rgba(255,255,255,0.8); font-size:0.9rem;">
      <b>${escapeHtml(w.name)}:</b> ${escapeHtml(w.text)}
      <span class="wish-time" style="display:block; font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${escapeHtml(w.time || '')}</span>
    </div>`
  ).join('');
}

if ($('wishSend')) {
  $('wishSend').addEventListener('click', async () => {
    const nameEl = $('wishName'), textEl = $('wishText');
    const name = nameEl.value.trim() || 'Người bạn giấu tên';
    const text = textEl.value.trim();
    if (!text){ toast('Bạn chưa viết lời chúc 🙏'); textEl.focus(); return; }

    const nowStr = new Date().toLocaleString('vi-VN');
    const wishData = {
      name: name,
      wish: text,
      timestamp: nowStr,
      device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
    };

    localWishes.push({ name, text, time: nowStr });
    try { localStorage.setItem(WISH_KEY, JSON.stringify(localWishes)); } catch(e){}
    renderWishes();
    textEl.value = '';

    toast('Đang gửi lời chúc...');
    $('wishSend').disabled = true;

    if (GOOGLE_SHEET_WEBAPP_URL){
      try {
        await fetch(GOOGLE_SHEET_WEBAPP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wishData)
        });
        toast('Lời chúc đã được lưu vào Google Sheet của Bảo! 💖');
      } catch(err){
        toast('Đã lưu lời chúc của bạn! 💖');
      }
    } else {
      toast('Đã lưu lời chúc thành công! 💖');
    }

    $('wishSend').disabled = false;
    beep(1046, 0.08, 'sine');
    const r = $('wishSend').getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top, 30);
  });
}

/* ================== FIREWORKS & SHARE ================== */
if ($('burstFireworksBtn')) {
  $('burstFireworksBtn').addEventListener('click', () => {
    const cx = W / 2, cy = H / 2;
    for (let i = 0; i < 4; i++){
      setTimeout(() => {
        burstAt(cx + rand(-180, 180), cy + rand(-100, 60), 50);
        beep(700 + i * 180, 0.08, 'triangle');
      }, i * 140);
    }
    toast('Bắn pháo hoa rực rỡ! 🎆');
  });
}

if ($('shareBtn')) {
  $('shareBtn').addEventListener('click', async () => {
    const data = {
      title: `🎂 Sinh nhật Dương Gia Bảo — 24/05`,
      text: `Đón chờ ngày sinh nhật của Dương Gia Bảo — 24/05/2008! 🎉`,
      url: location.href
    };
    try {
      if (navigator.share && /mobile/i.test(navigator.userAgent)){
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(location.href);
        toast('Đã sao chép link chia sẻ vào bộ nhớ tạm 🔗');
      }
    } catch(e){
      prompt('Sao chép liên kết:', location.href);
    }
  });
}

// Click anywhere on body (except controls) to burst confetti
document.addEventListener('click', e => {
  if (e.target.closest('button,input,a,.floating-player,.wish-box,.gift-wrap,.candle-modal,.playlist-modal')) return;
  burstAt(e.clientX, e.clientY, 25);
});

/* ================== INIT ENGINE ================== */
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
for (let i = 0; i < (isBirthdayToday() ? 150 : 80); i++) particles.push(makeParticle());
rafId = requestAnimationFrame(stepConfetti);

updateTimer();
setInterval(updateTimer, 1000);
renderWishes();
setSong(0, false);

document.addEventListener('visibilitychange', () => {
  if (document.hidden && rafId){ cancelAnimationFrame(rafId); rafId = null; }
  else if (!document.hidden && !rafId){ rafId = requestAnimationFrame(stepConfetti); }
});
