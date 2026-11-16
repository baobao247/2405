/* ================== FLOATING MUSIC PLAYER ================== */
const audio = $('bgAudio');
let songs = (isBirthdayToday() ? BIRTHDAY_SONGS : REGULAR_SONGS).slice();
let currentIdx = 0, isShuffle = false;

function updatePlayBtn(){
  if (!$('playBtn') || !audio) return;
  $('playBtn').innerHTML = audio.paused
    ? '<i class="fas fa-play"></i>'
    : '<i class="fas fa-pause"></i>';
}

function renderPlaylist(){
  const list = $('playlistItems');
  if (!list) return;
  list.innerHTML = songs.map((s, idx) => `
    <div class="playlist-item ${idx === currentIdx ? 'active' : ''}" data-idx="${idx}">
      <i class="fas ${idx === currentIdx && !audio.paused ? 'fa-volume-high' : 'fa-music'}"></i>
      <span class="p-title">${escapeHtml(s.title)}</span>
    </div>
  `).join('');

  list.querySelectorAll('.playlist-item').forEach(el => {
    el.onclick = () => {
      const i = parseInt(el.dataset.idx, 10);
      setSong(i, true);
      renderPlaylist();
    };
  });
}

function setSong(idx, playImmediately = false){
  if (!songs.length || !audio) return;
  currentIdx = ((idx % songs.length) + songs.length) % songs.length;
  const s = songs[currentIdx];
  if ($('songTitle')) $('songTitle').textContent = s.title;
  if ($('seekFill')) $('seekFill').style.width = '0%';
  if ($('playerTime')) $('playerTime').textContent = '0:00 / 0:00';

  let triedFallback = false;
  audio.src = s.url;

  audio.onerror = () => {
    if (!triedFallback && s.fallback) {
      triedFallback = true;
      audio.src = s.fallback;
      if (playImmediately) {
        audio.play().then(updatePlayBtn).catch(() => updatePlayBtn());
      }
    }
  };

  if (playImmediately){
    unlockAudio();
    audio.play().then(updatePlayBtn).catch(() => updatePlayBtn());
  } else {
    updatePlayBtn();
  }
  renderPlaylist();
}

if (audio) {
  audio.addEventListener('play', updatePlayBtn);
  audio.addEventListener('pause', updatePlayBtn);

  audio.addEventListener('timeupdate', () => {
    if (audio.duration){
      const pct = (audio.currentTime / audio.duration) * 100;
      if ($('seekFill')) $('seekFill').style.width = pct + '%';
      if ($('playerTime')) {
        $('playerTime').textContent = `${fmtTime(audio.currentTime)} / ${fmtTime(audio.duration)}`;
      }
    }
  });

  audio.addEventListener('ended', () => {
    setSong(isShuffle ? Math.floor(Math.random() * songs.length) : currentIdx + 1, true);
  });
}

if ($('playBtn')) {
  $('playBtn').addEventListener('click', () => {
    if (!audio) return;
    unlockAudio();
    if (audio.paused){
      if (!audio.src) setSong(currentIdx, true);
      else audio.play().then(updatePlayBtn).catch(() => updatePlayBtn());
    } else {
      audio.pause();
    }
  });
}

if ($('nextBtn')) {
  $('nextBtn').addEventListener('click', () => {
    setSong(isShuffle ? Math.floor(Math.random() * songs.length) : currentIdx + 1, true);
  });
}

if ($('prevBtn')) {
  $('prevBtn').addEventListener('click', () => {
    if (audio && audio.currentTime > 3){
      audio.currentTime = 0;
      return;
    }
    setSong(currentIdx - 1, true);
  });
}

if ($('shuffleBtn')) {
  $('shuffleBtn').addEventListener('click', () => {
    isShuffle = !isShuffle;
    $('shuffleBtn').style.background = isShuffle ? 'linear-gradient(135deg,var(--pink),var(--purple))' : '';
    $('shuffleBtn').style.color = isShuffle ? '#fff' : '';
    toast(isShuffle ? 'Phát ngẫu nhiên: BẬT 🔀' : 'Phát ngẫu nhiên: TẮT');
  });
}

// Volume Controls
const volRange = $('volRange'), volBtn = $('volBtn');
let lastVol = 0.8;
if (volRange && audio){
  audio.volume = parseFloat(volRange.value);
  volRange.addEventListener('input', e => {
    audio.volume = parseFloat(e.target.value);
    audio.muted = (audio.volume === 0);
    updateVolIcon();
  });
}

function updateVolIcon(){
  if (!volBtn || !audio) return;
  if (audio.muted || audio.volume === 0){
    volBtn.innerHTML = '<i class="fas fa-volume-xmark"></i>';
  } else if (audio.volume < 0.5){
    volBtn.innerHTML = '<i class="fas fa-volume-low"></i>';
  } else {
    volBtn.innerHTML = '<i class="fas fa-volume-high"></i>';
  }
}

if (volBtn && audio){
  volBtn.onclick = () => {
    if (audio.muted || audio.volume === 0){
      audio.muted = false;
      audio.volume = lastVol || 0.8;
      if (volRange) volRange.value = audio.volume;
    } else {
      lastVol = audio.volume;
      audio.muted = true;
      audio.volume = 0;
      if (volRange) volRange.value = 0;
    }
    updateVolIcon();
  };
}

// Playlist Modal Controls
if ($('playlistBtn')) {
  $('playlistBtn').addEventListener('click', () => {
    if ($('playlistModal')) $('playlistModal').classList.toggle('show');
    renderPlaylist();
  });
}

if ($('closePlaylistBtn')) {
  $('closePlaylistBtn').addEventListener('click', () => {
    if ($('playlistModal')) $('playlistModal').classList.remove('show');
  });
}

if ($('playlistModal')) {
  $('playlistModal').addEventListener('click', e => {
    if (e.target === $('playlistModal')) $('playlistModal').classList.remove('show');
  });
}

// Seekbar Click
if ($('seekBar') && audio){
  $('seekBar').addEventListener('click', e => {
    const rect = $('seekBar').getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audio.duration) audio.currentTime = pct * audio.duration;
  });
}
