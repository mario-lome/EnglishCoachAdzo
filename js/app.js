// js/app.js - Version avec Dashboard Progression ✅
const selector = document.getElementById('track-selector');
const html = document.documentElement;
const content = document.getElementById('app-content');
const navButtons = document.querySelectorAll('.bottom-nav button');

// 🎯 Gestion de la navigation
function switchView(view) {
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
  document.querySelector(`.bottom-nav button[data-view="${view}"]`)?.classList.add('active');
  
  if (view === 'progress') {
    const track = localStorage.getItem('selectedTrack') || 'kids';
    if (typeof Progress !== 'undefined') {
      Progress.render(track, content);
    } else {
      content.innerHTML = '<p style="text-align:center;padding:2rem;">Chargement du dashboard...</p>';
      // Charger progress.js dynamiquement si besoin
      const script = document.createElement('script');
      script.src = '/js/progress.js';
      script.onload = () => Progress.render(track, content);
      document.body.appendChild(script);
    }
  } else {
    loadTrack(localStorage.getItem('selectedTrack') || 'kids');
  }
}

async function loadTrack(track) {
  console.log(`🔄 [app.js] Chargement track: ${track}`);
  html.dataset.track = track;
  localStorage.setItem('selectedTrack', track);

  try {
    const res = await fetch('/data/lessons.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    
    const data = await res.json();
    const trackData = data[track];
    if (!trackData) throw new Error(`Track "${track}" introuvable`);

    const titles = { kids: '🎮', pro: '🏢', method: '📈' };
    document.getElementById('app-title').textContent = `EnglishCoachAdzo ${titles[track] || ''}`;

    if (track === 'kids') {
      if (typeof window.Engine?.renderQuiz !== 'function') {
        throw new Error('Engine.renderQuiz non disponible');
      }
      const lesson = trackData.lessons?.[0];
      if (!lesson?.activite?.pairs) throw new Error('Aucune leçon kids valide');

      // 🎯 Hook pour sauvegarder la progression à la fin du quiz
      const originalComplete = window.engineCompleteQuiz;
      window.engineCompleteQuiz = function() {
        if (originalComplete) originalComplete.call(this);
        // Sauvegarder dans Progress
        if (typeof Progress !== 'undefined') {
          Progress.save('kids', {
            score: window.engineState?.score || 0,
            lesson: lesson.title,
            competence: lesson.competence
          });
        }
      };

      window.Engine.renderQuiz(lesson);
    } else {
      content.innerHTML = `
        <div class="card" style="padding:2rem;text-align:center;">
          <h2>${trackData.title}</h2>
          <p style="opacity:0.8;margin:1rem 0;">${trackData.lessons?.[0]?.competence || 'Module en développement'}</p>
          <button class="btn-apc" onclick="alert('Fonctionnalité à venir !')">Bientôt disponible 🚀</button>
        </div>
      `;
    }
  } catch (err) {
    console.error('❌ [app.js] ERREUR:', err);
    content.innerHTML = `
      <div class="card" style="padding:2rem;text-align:center;border:2px solid #ef4444;border-radius:12px;">
        <h2 style="color:#ef4444;">⚠️ Erreur</h2>
        <p style="margin:1rem 0;">${err.message}</p>
        <button class="btn-apc" onclick="location.reload()">Recharger 🔄</button>
      </div>
    `;
  }
}

// 🚀 Initialisation
selector.addEventListener('change', e => {
  loadTrack(e.target.value);
  // Revenir à la vue quiz quand on change de track
  switchView('home');
});

// Boutons de navigation
navButtons.forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

// Démarrage
document.addEventListener('DOMContentLoaded', () => {
  console.log('🟢 [app.js] DOM prêt');
  selector.value = localStorage.getItem('selectedTrack') || 'kids';
  loadTrack(selector.value);
  
  // Charger progress.js en arrière-plan
  const script = document.createElement('script');
  script.src = '/js/progress.js';
  script.defer = true;
  document.body.appendChild(script);
});
