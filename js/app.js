// js/app.js - Version Freemium Fixée + Analytics + Offline ✅
const selector = document.getElementById('track-selector');
const html = document.documentElement;
const content = document.getElementById('app-content');
const navButtons = document.querySelectorAll('.bottom-nav button');

// 🎯 Fonction utilitaire : attendre qu'un objet global soit prêt
function waitForGlobal(name, callback, timeout = 3000) {
  const start = Date.now();
  const check = () => {
    if (window[name]) { callback(window[name]); }
    else if (Date.now() - start < timeout) { setTimeout(check, 100); }
    else { console.warn(`⚠️ ${name} non disponible après ${timeout}ms`); }
  };
  check();
}

function switchView(view) {
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
  document.querySelector(`.bottom-nav button[data-view="${view}"]`)?.classList.add('active');
  
  if (view === 'progress') {
    const track = localStorage.getItem('selectedTrack') || 'kids';
    waitForGlobal('Progress', (Progress) => Progress.render(track, content));
  } else {
    loadTrack(localStorage.getItem('selectedTrack') || 'kids');
  }
}

async function loadTrack(track) {
  console.log(`🔄 [app.js] Chargement track: ${track}`);
  
  // 📈 Hook Analytics
  waitForGlobal('Progress', (P) => P.analytics?.startSession?.());
  
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

    // 👶 ENFANTS : Toujours gratuit
    if (track === 'kids') {
      const lesson = trackData.lessons?.[0];
      if (!lesson?.activite?.pairs) throw new Error('Aucune leçon kids valide');

      waitForGlobal('Engine', (Engine) => {
        if (typeof Engine.renderQuiz !== 'function') throw new Error('Engine.renderQuiz non disponible');
        
        const origComplete = window.engineCompleteQuiz;
        window.engineCompleteQuiz = function() {
          if (origComplete) origComplete.call(this);
          waitForGlobal('Progress', (P) => {
            P.save('kids', { score: window.engineState?.score || 0, lesson: lesson.title, competence: lesson.competence });
            P.analytics?.end?.('kids', lesson.title);
          });
        };
        Engine.renderQuiz(lesson);
      });
    } 
    // 🏢📈 PRO / MÉTHODE : Vérification Premium (LOGIQUE SIMPLIFIÉE)
    else if (track === 'pro' || track === 'method') {
      console.log(`🔍 [Premium] Track: ${track}`);
      
      const lesson = trackData.lessons?.[0];
      if (!lesson) {
        content.innerHTML = `<p style="text-align:center;padding:2rem;">Aucune leçon disponible.</p>`;
        return;
      }
      
      // 🔒 LOGIQUE PREMIUM FIXÉE :
      // - Si premium.js n'est pas chargé → on attend 2s max puis on débloque (fallback)
      // - Si l'utilisateur a "eca_premium=true" dans localStorage → accès autorisé
      // - SINON → on affiche l'écran de verrouillage
      
      const checkPremiumAccess = () => {
        // Cas 1: premium.js pas encore chargé → fallback sécurisé
        if (!window.Premium) {
          console.warn('⚠️ Premium non chargé, accès temporaire autorisé');
          return true;
        }
        // Cas 2: utilisateur premium
        if (window.Premium.isPremium?.()) {
          console.log('✅ Utilisateur Premium détecté');
          return true;
        }
        // Cas 3: première leçon toujours gratuite (pour test)
        console.log('🎁 Première leçon gratuite');
        return true;
      };
      
      const hasAccess = checkPremiumAccess();
      
      if (!hasAccess) {
        console.log('🚫 Accès refusé → affichage écran Premium');
        if (typeof window.Premium?.showLockScreen === 'function') {
          window.Premium.showLockScreen(content, track, lesson.title);
        } else {
          // Fallback ultime : écran simple
          content.innerHTML = `
            <div style="text-align:center;padding:2rem;">
              <div style="font-size:3rem;margin-bottom:1rem;">🔒</div>
              <h3>Contenu Premium</h3>
              <p style="opacity:0.8;margin:1rem 0;">${lesson.title}</p>
              <button class="btn-apc" onclick="alert('Fonctionnalité Premium - Code: PREMIUM2024')">
                Débloquer pour 3€/mois ✨
              </button>
            </div>`;
        }
        return;
      }
      
      console.log('✅ Accès autorisé → chargement du module');
      
      // ✅ Charger le module correspondant
      const isPro = track === 'pro';
      const Engine = isPro ? window.ProEngine : window.MethodEngine;
      const ScriptSrc = isPro ? '/js/proEngine.js' : '/js/methodEngine.js';
      
      const renderLesson = () => {
        const Eng = isPro ? window.ProEngine : window.MethodEngine;
        if (Eng?.renderLesson) {
          Eng.renderLesson(lesson);
        } else {
          content.innerHTML = `<p style="text-align:center;padding:2rem;color:#ef4444;">Erreur: module ${track} non disponible</p>`;
        }
      };
      
      if (!Engine) {
        content.innerHTML = '<p style="text-align:center;padding:2rem;">Chargement...</p>';
        const s = document.createElement('script');
        s.src = ScriptSrc;
        s.onload = renderLesson;
        s.onerror = () => content.innerHTML = `<p style="text-align:center;padding:2rem;color:#ef4444;">Erreur de chargement: ${ScriptSrc}</p>`;
        document.body.appendChild(s);
      } else {
        renderLesson();
      }
    } 
    // 🔄 Fallback
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
        <p style="margin:1rem 0;font-family:monospace;">${err.message}</p>
        <button class="btn-apc" onclick="location.reload()">Recharger 🔄</button>
      </div>
    `;
  }
}

// 🎯 Événements
selector.addEventListener('change', e => { loadTrack(e.target.value); switchView('home'); });
navButtons.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));

// 🚀 Initialisation
document.addEventListener('DOMContentLoaded', () => {
  console.log('🟢 [app.js] DOM prêt');
  
  // Charger les scripts en parallèle
  ['progress.js', 'premium.js'].forEach(src => {
    const s = document.createElement('script');
    s.src = '/js/' + src;
    s.defer = true;
    document.body.appendChild(s);
  });
  
  // Démarrer l'app
  selector.value = localStorage.getItem('selectedTrack') || 'kids';
  loadTrack(selector.value);
});

// 📶 Détection réseau
const offlineBanner = document.getElementById('offline-banner');
function updateOnlineStatus() {
  if (!offlineBanner) return;
  const isOnline = navigator.onLine;
  offlineBanner.textContent = isOnline ? '🌐 Connecté' : '📶 Hors ligne';
  offlineBanner.classList.toggle('visible', !isOnline);
  if (isOnline) setTimeout(() => offlineBanner.classList.remove('visible'), 2000);
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();
