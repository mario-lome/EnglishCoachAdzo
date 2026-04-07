// js/app.js
const selector = document.getElementById('track-selector');
const html = document.documentElement;
const content = document.getElementById('app-content');

async function loadTrack(track) {
  console.log(`🔄 Chargement: ${track}`);
  html.dataset.track = track;
  localStorage.setItem('selectedTrack', track);

  try {
    const res = await fetch('/data/lessons.json');
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
    const data = await res.json();
    const trackData = data[track];

    document.getElementById('app-title').textContent = 
      `EnglishCoachAdzo ${track==='kids'?'🎮':track==='pro'?'🏢':'📈'}`;

    if (track === 'kids') {
      // 🔍 VÉRIFICATION EXPLICITE AVANT APPEL
      if (!window.Engine || typeof window.Engine.renderQuiz !== 'function') {
        throw new Error('window.Engine.renderQuiz n\'est pas défini. Vérifie engine.js et vide le cache.');
      }
      const lesson = trackData.lessons?.[0];
      if (!lesson?.pairs) throw new Error('Aucune leçon "kids" valide trouvée');
      
      window.Engine.renderQuiz(lesson);
    } else {
      content.innerHTML = `<div class="card"><h2>${trackData.title}</h2><p>Module en cours de développement...</p></div>`;
    }
  } catch (err) {
    console.error('❌ ERREUR:', err);
    content.innerHTML = `<div class="card"><h2>⚠️ ${err.message}</h2></div>`;
  }
}

selector.addEventListener('change', e => loadTrack(e.target.value));
selector.value = localStorage.getItem('selectedTrack') || 'kids';
loadTrack(selector.value);
