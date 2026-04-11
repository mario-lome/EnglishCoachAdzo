// js/app.js - Version Analytics + Pro + Offline ✅
const selector = document.getElementById('track-selector');
const html = document.documentElement;
const content = document.getElementById('app-content');
const navButtons = document.querySelectorAll('.bottom-nav button');

function switchView(view) {
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
  document.querySelector(`.bottom-nav button[data-view="${view}"]`)?.classList.add('active');
  
  if (view === 'progress') {
    const track = localStorage.getItem('selectedTrack') || 'kids';
    if (typeof Progress !== 'undefined') {
      Progress.render(track, content);
    } else {
      content.innerHTML = '<p style="text-align:center;padding:2rem;">Chargement du dashboard...</p>';
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
  
  // 📈 Hook Analytics: Démarrer une nouvelle session
  if (typeof Progress?.analytics?.startSession === 'function') {
    Progress.analytics.startSession();
  }
  
  html.dataset.track = track;
  localStorage.setItem('selectedTrack', track);

  try {
    const res = await fetch('/data/lessons.json?v=' + Date.now());
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    const trackData = data[track];
    if (!trackData) throw new Error(`Track "${track}" introuvable`);

    const titles = { kids: '🎮', pro: '🏢', method: '📈' };
    document.getElementById('app-title').textContent = `EnglishCoachAdzo ${titles[track] || ''}`;

    if (track === 'kids') {
      if (typeof window.Engine?.renderQuiz !== 'function') throw new Error('Engine.renderQuiz non disponible');
      const lesson = trackData.lessons?.[0];
      if (!lesson?.activite?.pairs) throw new Error('Aucune leçon kids valide');

      const origComplete = window.engineCompleteQuiz;
      window.engineCompleteQuiz = function() {
        if (origComplete) origComplete.call(this);
        if (typeof Progress !== 'undefined') {
          Progress.save('kids', { score: window.engineState?.score || 0, lesson: lesson.title, competence: lesson.competence });
        }
        // 📈 Hook Analytics: Enregistrer la fin de session Kids
        if (typeof Progress?.analytics?.end === 'function') {
          Progress.analytics.end('kids', lesson.title);
        }
      };
      window.Engine.renderQuiz(lesson);
    } 
    else if (track === 'pro') {
      if (typeof window.ProEngine === 'undefined') {
        content.innerHTML = '<p style="text-align:center;padding:2rem;">Chargement du module Pro...</p>';
        const script = document.createElement('script');
        script.src = '/js/proEngine.js';
        script.onload = () => {
          const lesson = trackData.lessons?.[0];
          if (lesson) window.ProEngine.renderLesson(lesson);
        };
        document.body.appendChild(script);
      } else {
        const lesson = trackData.lessons?.[0];
        if (lesson) window.ProEngine.renderLesson(lesson);
      }
    } 
    else {
      content.innerHTML = `
        <div class="card" style="padding:2rem;text-align:center;">
          <h2>${trackData.title}</h2>
          <p style="opacity:0.8;margin:1rem 0;">Module en développement</p>
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

selector.addEventListener('change', e => { loadTrack(e.target.value); switchView('home'); });
navButtons.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));

document.addEventListener('DOMContentLoaded', () => {
  console.log('🟢 [app.js] DOM prêt');
  selector.value = localStorage.getItem('selectedTrack') || 'kids';
  loadTrack(selector.value);
  const pScript = document.createElement('script'); pScript.src = '/js/progress.js'; pScript.defer = true; document.body.appendChild(pScript);
});

// 📶 Détection état réseau (ton code existant - inchangé)
const offlineBanner = document.getElementById('offline-banner');
function updateOnlineStatus() {
  if (!offlineBanner) return; // Sécurité si l'élément n'existe pas
  const isOnline = navigator.onLine;
  offlineBanner.textContent = isOnline ? '🌐 Connecté' : '📶 Mode hors ligne activé';
  offlineBanner.classList.toggle('visible', !isOnline);
  if(isOnline) setTimeout(() => offlineBanner.classList.remove('visible'), 2000);
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();
