let startTime = 0;
let elapsedTime = 0;
let timerInterval;
const display = document.getElementById('display');
const progress = document.getElementById('progress');
const laps = document.getElementById('laps');
const splits = document.getElementById('splits');
const beep = document.getElementById('beep');

function formatTime(ms) {
  const date = new Date(ms);
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  const sec = String(date.getUTCSeconds()).padStart(2, '0');
  const msPart = String(date.getUTCMilliseconds()).padStart(3, '0');
  return `${min}:${sec}.${msPart}`;
}

function updateDisplay() {
  display.textContent = formatTime(elapsedTime);
  const maxOffset = 440;
  const fraction = (elapsedTime % 60000) / 60000;
  progress.style.strokeDashoffset = maxOffset - (maxOffset * fraction);
}

function saveTheme() {
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

function loadTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('modeToggle').textContent = '☀️';
  }
}

document.getElementById('startBtn').addEventListener('click', () => {
  startTime = Date.now() - elapsedTime;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedTime = Date.now() - startTime;
    updateDisplay();
  }, 10);
});

document.getElementById('pauseBtn').addEventListener('click', () => {
  clearInterval(timerInterval);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  clearInterval(timerInterval);
  elapsedTime = 0;
  updateDisplay();
  laps.innerHTML = '';
  splits.innerHTML = '';
  beep.play();
});


document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 's') document.getElementById('startBtn').click();
  else if (e.key.toLowerCase() === 'p') document.getElementById('pauseBtn').click();
  else if (e.key.toLowerCase() === 'l') document.getElementById('lapBtn').click();
});

function vibrateFeedback() {
  if (navigator.vibrate) navigator.vibrate(100);
}

document.getElementById('lapBtn').addEventListener('click', () => {
  const li = document.createElement('li');
  li.textContent = formatTime(elapsedTime);
  laps.appendChild(li);
  laps.scrollTop = laps.scrollHeight;
  beep.play();
  vibrateFeedback();
});

document.getElementById('splitBtn').addEventListener('click', () => {
  const li = document.createElement('li');
  li.textContent = formatTime(elapsedTime);
  splits.appendChild(li);
  splits.scrollTop = splits.scrollHeight;
  vibrateFeedback();
});

document.getElementById('modeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const modeBtn = document.getElementById('modeToggle');
  modeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  saveTheme();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const lapTimes = [];
  laps.querySelectorAll('li').forEach(li => lapTimes.push(li.textContent));
  if (lapTimes.length === 0) {
    alert('No laps to export.');
    return;
  }
  const csv = lapTimes.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = `laps_${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

updateDisplay();
loadTheme();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => {
    console.log('Service Worker registered');
  }).catch(console.error);
}



