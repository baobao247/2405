/* ================== CONFIGURATION & UTILS ================== */
const CONFIG = {
  birthYear: 2008,
  birthdayMonth: 4, // 0-indexed: 4 = Tháng 5
  birthdayDay: 24,
  name: 'Dương Gia Bảo'
};

const GOOGLE_SHEET_WEBAPP_URL = "";

// 5 bài nhạc chill hằng ngày (offline local + online fallback)
const REGULAR_SONGS = [
  {
    url: "./bai-nay-chill-phet.mp3",
    fallback: "https://github.com/baobao247/2405/raw/refs/heads/main/B%C3%A0i%20N%C3%A0y%20Chill%20Ph%E1%BA%BFt%20-%20%C4%90en.mp3",
    title: "Bài Này Chill Phết — Đen"
  },
  {
    url: "./cu-chill-thoi.mp3",
    fallback: "https://github.com/baobao247/2405/raw/refs/heads/main/C%E1%BB%A9%20Chill%20Th%C3%B4i%20-%20Chillies.mp3",
    title: "Cứ Chill Thôi — Chillies"
  },
  {
    url: "./mua-he-nam-do.mp3",
    fallback: "https://github.com/baobao247/2405/raw/refs/heads/main/M%C3%B9a%20H%C3%A8%20N%C4%83m%20%C4%90%C3%B3%20-%20B%20Ray.mp3",
    title: "Mùa Hè Năm Đó — B Ray"
  },
  {
    url: "./tell-the-kids-i-love-them.mp3",
    fallback: "https://github.com/baobao247/2405/raw/refs/heads/main/Tell%20the%20kids%20i%20love%20them%20-%20Obito.mp3",
    title: "Tell the Kids I Love Them — Obito"
  },
  {
    url: "./xuat-phat-diem.mp3",
    fallback: "https://github.com/baobao247/2405/raw/refs/heads/main/Xu%E1%BA%A5t%20Ph%C3%A1t%20%C4%90i%E1%BB%83m%20-%20Obito.mp3",
    title: "Xuất Phát Điểm — Obito"
  }
];

// 3 bài nhạc đặc biệt ngày sinh nhật
const BIRTHDAY_SONGS = [
  {
    url: "./happy-birthday-to-you.mp3",
    fallback: "https://github.com/baobao247/2405/raw/refs/heads/main/Happy%20Birthday%20To%20You%20-%20AMEE.mp3",
    title: "Happy Birthday To You — AMEE"
  },
  {
    url: "./khuc-hat-mung-sinh-nhat.mp3",
    fallback: "https://github.com/baobao247/2405/raw/refs/heads/main/Kh%C3%BAc%20H%C3%A1t%20M%E1%BB%ABng%20Sinh%20Nh%E1%BA%ADt%20-%20Phan%20%C4%90inh%20T%C3%B9ng.mp3",
    title: "Khúc Hát Mừng Sinh Nhật — Phan Đinh Tùng"
  },
  {
    url: "./sinh-nhat.mp3",
    fallback: "https://github.com/baobao247/2405/raw/refs/heads/main/SINH%20NHAT%20-%20HIEUTHUHAI.mp3",
    title: "SINH NHẬT — HIEUTHUHAI"
  }
];

const $ = id => document.getElementById(id);
const rand = (min, max) => Math.random() * (max - min) + min;
const pad = n => String(n).padStart(2, '0');
const fmtTime = s => {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ':' + pad(sec);
};

function toast(msg){
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2600);
}

function escapeHtml(s){
  return String(s || '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

/* ================== BIRTHDAY STATUS & AGE CALCULATION ================== */
const isBirthdayToday = () => {
  const t = new Date();
  return t.getMonth() === CONFIG.birthdayMonth && t.getDate() === CONFIG.birthdayDay;
};

function getNextBirthday(now){
  const y = now.getFullYear();
  let t = new Date(y, CONFIG.birthdayMonth, CONFIG.birthdayDay, 0, 0, 0, 0);
  if (now > t && !isBirthdayToday()) {
    t = new Date(y + 1, CONFIG.birthdayMonth, CONFIG.birthdayDay, 0, 0, 0, 0);
  }
  return t;
}

function getPrevBirthday(now){
  const y = now.getFullYear();
  let t = new Date(y, CONFIG.birthdayMonth, CONFIG.birthdayDay, 0, 0, 0, 0);
  if (now < t) {
    t = new Date(y - 1, CONFIG.birthdayMonth, CONFIG.birthdayDay, 0, 0, 0, 0);
  }
  return t;
}

const nowInit = new Date();
const nextBdayInit = getNextBirthday(nowInit);
const targetAge = nextBdayInit.getFullYear() - CONFIG.birthYear;
if ($('ageBadge')) {
  $('ageBadge').textContent = isBirthdayToday() ? `Tròn ${targetAge} tuổi 🎉` : `Đón tuổi ${targetAge}`;
}

if (isBirthdayToday()) {
  document.body.classList.add('birthday-mode');
}

/* ================== TIME ENGINE (COUNTDOWN VS LIFE METRICS) ================== */
let currentMode = 'countdown';
const birthDate = new Date(CONFIG.birthYear, CONFIG.birthdayMonth, CONFIG.birthdayDay, 0, 0, 0);

function setDigit(el, v){
  if (!el) return;
  const s = String(v);
  if (el.textContent !== s){
    el.textContent = s;
  }
}

function updateTimer(){
  const now = new Date();

  if (currentMode === 'countdown'){
    const target = getNextBirthday(now);
    const diff = target - now;

    if (diff <= 0 || isBirthdayToday()){
      setDigit($('dVal'), 0);
      setDigit($('hVal'), '00');
      setDigit($('mVal'), '00');
      setDigit($('sVal'), '00');
      if ($('progressFill')) $('progressFill').style.width = '100%';
      if ($('progressLabelRight')) $('progressLabelRight').textContent = '100%';
      if ($('progressLabelLeft')) $('progressLabelLeft').textContent = '🎉 Đến ngày rồi!';
      if ($('greeting') && !$('greeting').hasAttribute('data-bday-set')) {
        $('greeting').textContent = '🎉 Chúc mừng sinh nhật Dương Gia Bảo! 🎂';
        $('greeting').setAttribute('data-bday-set', 'true');
      }
      return;
    }

    const secs = Math.floor(diff / 1000);
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    setDigit($('dVal'), d);
    setDigit($('hVal'), pad(h));
    setDigit($('mVal'), pad(m));
    setDigit($('sVal'), pad(s));

    const prev = getPrevBirthday(now);
    const pct = Math.min(100, Math.max(0, ((now - prev) / (target - prev)) * 100));
    if ($('progressFill')) $('progressFill').style.width = pct.toFixed(2) + '%';
    if ($('progressLabelRight')) $('progressLabelRight').textContent = pct.toFixed(1) + '%';
    if ($('progressLabelLeft')) $('progressLabelLeft').textContent = `⏳ Còn ${d} ngày ${h} giờ đến sinh nhật`;
  } else {
    // Life Metrics: Đã sống bao nhiêu ngày, giờ, phút, giây
    const diff = now - birthDate;
    const secs = Math.floor(diff / 1000);
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    setDigit($('dVal'), d);
    setDigit($('hVal'), pad(h));
    setDigit($('mVal'), pad(m));
    setDigit($('sVal'), pad(s));
  }
}

// Mode toggle tabs
if ($('tabCountdown')) {
  $('tabCountdown').addEventListener('click', () => {
    currentMode = 'countdown';
    $('tabCountdown').classList.add('active');
    if ($('tabLifeMetrics')) $('tabLifeMetrics').classList.remove('active');
    if ($('progressArea')) $('progressArea').style.display = 'block';
    if ($('dLbl')) $('dLbl').textContent = 'Ngày';
    if ($('hLbl')) $('hLbl').textContent = 'Giờ';
    if ($('mLbl')) $('mLbl').textContent = 'Phút';
    if ($('sLbl')) $('sLbl').textContent = 'Giây';
    updateTimer();
  });
}

if ($('tabLifeMetrics')) {
  $('tabLifeMetrics').addEventListener('click', () => {
    currentMode = 'lifemetrics';
    $('tabLifeMetrics').classList.add('active');
    if ($('tabCountdown')) $('tabCountdown').classList.remove('active');
    if ($('progressArea')) $('progressArea').style.display = 'none';
    if ($('dLbl')) $('dLbl').textContent = 'Ngày sống';
    if ($('hLbl')) $('hLbl').textContent = 'Giờ';
    if ($('mLbl')) $('mLbl').textContent = 'Phút';
    if ($('sLbl')) $('sLbl').textContent = 'Giây';
    toast('Hành trình tuyệt vời mà Bảo đã đi qua ✨');
    updateTimer();
  });
}

// Typewriter greeting
(function typeGreeting(){
  const text = "Chào mừng bạn ghé thăm trang kỷ niệm sinh nhật của Bảo — 24/05! ✨";
  const el = $('greeting');
  if (!el) return;
  let idx = 0;
  const cur = document.createElement('span'); cur.className = 'cursor';
  el.appendChild(cur);
  function tick(){
    if (idx < text.length){
      el.insertBefore(document.createTextNode(text[idx++]), cur);
      setTimeout(tick, 45);
    } else {
      setTimeout(() => cur.remove(), 1200);
    }
  }
  tick();
})();
