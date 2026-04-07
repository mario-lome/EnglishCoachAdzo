// js/app.js - Contrôleur principal
const selector = document.getElementById('track-selector');
const html = document.documentElement;
const content = document.getElementById('app-content');

async function loadTrack(track) {
  html.dataset.track = track;
  localStorage.setItem('selectedTrack', track);

  try {
    const res = await fetch('data/lessons.json');
    if (!res.ok) throw new Error('Impossible de charger les données');
    const data = await res.json();
    const trackData = data[track];

    // Met à jour le titre
    document.getElementById('app-title').textContent = 
      `EnglishCoachAdzo ${track === 'kids' ? '🎮' : track === 'pro' ? '🏢' : '📈'}`;

    // Affichage conditionnel
    console.log('🔍 Test Engine:', typeof Engine, window.EngineTest);
    if (track === 'kids' && typeof Engine !== 'undefined' && trackData.lessons?.[0]) {
      Engine.renderQuiz(trackData.lessons[0]);
    } else if (trackData.lessons?.[0]) {
      // Fallback simple pour Pro & Méthode (à remplacer par leurs modules plus tard)
      content.innerHTML = `<div class="card"><h2>${trackData.title}</h2><p>Module en cours de développement...</p></div>`;
    } else {
      content.innerHTML = `<div class="card"><h2>Aucune leçon disponible</h2></div>`;
    }
  } catch (err) {
    console.error('❌ Erreur chargement track:', err);
    content.innerHTML = `<div class="card"><h2>⚠️ Erreur de chargement</h2><p>${err.message}</p></div>`;
  }
}

// Initialisation
selector.addEventListener('change', e => loadTrack(e.target.value));
selector.value = localStorage.getItem('selectedTrack') || 'kids';
loadTrack(selector.value);

// Service Worker (désactivé temporairement pour les tests)
// if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js'));
