// js/app.js
const selector = document.getElementById('track-selector');
const html = document.documentElement;

async function loadTrack(track) {
  html.dataset.track = track;
  const res = await fetch('data/lessons.json');
  const data = await res.json();
  const trackData = data[track];

  document.getElementById('app-title').textContent = `EnglishCoachAdzo ${track==='kids'?'🎮':track==='pro'?'🏢':'📈'}`;

  if (track === 'kids' && trackData.lessons[0]) {
    Engine.renderQuiz(trackData.lessons[0]);
  } else {
    document.getElementById('app-content').innerHTML = `<div class="card"><h2>${trackData.title}</h2><p>Module en cours de développement...</p></div>`;
  }
  localStorage.setItem('selectedTrack', track);
}

selector.addEventListener('change', e => loadTrack(e.target.value));
selector.value = localStorage.getItem('selectedTrack') || 'kids';
loadTrack(selector.value);

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js'));
