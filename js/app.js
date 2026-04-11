// js/app.js - Version Debug + Fallback ✅
const selector = document.getElementById('track-selector');
const html = document.documentElement;
const content = document.getElementById('app-content');

async function loadTrack(track) {
  console.log(`🔄 [app.js] Chargement track: ${track}`);
  html.dataset.track = track;
  localStorage.setItem('selectedTrack', track);

  try {
    const res = await fetch('/data/lessons.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    
    const data = await res.json();
    console.log('📦 [app.js] Données chargées:', Object.keys(data));
    
    const trackData = data[track];
    if (!trackData) throw new Error(`Track "${track}" introuvable dans le JSON`);

    const titles = { kids: '🎮', pro: '🏢', method: '📈' };
    document.getElementById('app-title').textContent = `EnglishCoachAdzo ${titles[track] || ''}`;

    if (track === 'kids') {
      console.log('🔍 [app.js] Vérification Engine:', {
        exists: typeof window.Engine !== 'undefined',
        renderQuizType: typeof window.Engine?.renderQuiz
      });

      if (typeof window.Engine?.renderQuiz !== 'function') {
        throw new Error('Engine.renderQuiz non disponible. Vérifie engine.js.');
      }

      const lesson = trackData.lessons?.[0];
      if (!lesson?.activite?.pairs) {
        throw new Error('Aucune leçon kids valide avec "activite.pairs" trouvée');
      }

      console.log('🎮 [app.js] Appel de Engine.renderQuiz()...');
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
    console.error('❌ [app.js] ERREUR CRITIQUE:', err);
    content.innerHTML = `
      <div class="card" style="padding:2rem;text-align:center;border:2px solid #ef4444;border-radius:12px;">
        <h2 style="color:#ef4444;">⚠️ Erreur de chargement</h2>
        <p style="margin:1rem 0;font-family:monospace;background:#fef2f2;padding:1rem;border-radius:8px;">${err.message}</p>
        <button class="btn-apc" onclick="location.reload()">Recharger la page 🔄</button>
      </div>
    `;
  }
}

selector.addEventListener('change', e => loadTrack(e.target.value));
selector.value = localStorage.getItem('selectedTrack') || 'kids';
document.addEventListener('DOMContentLoaded', () => {
  console.log('🟢 [app.js] DOM prêt, chargement du track...');
  loadTrack(selector.value);
});
