// js/engine.js - VERSION FINALE & GARANTIE ✅
console.log('🟢 engine.js: chargement démarré');

// 🌍 Création immédiate de l'objet global
window.Engine = {};

// 🎵 Audio Manager - Version Synthétique (0 fichier requis, 0 erreur)
function playSound(name) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (name === 'correct') {
      osc.frequency.value = 880; gain.gain.value = 0.3;
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } else if (name === 'wrong') {
      osc.frequency.value = 330; gain.gain.value = 0.3;
      osc.start(); osc.stop(ctx.currentTime + 0.25);
    } else if (name === 'victory') {
      osc.frequency.value = 660; gain.gain.value = 0.4;
      osc.start();
      setTimeout(() => osc.frequency.value = 880, 120);
      setTimeout(() => osc.frequency.value = 1100, 240);
      setTimeout(() => osc.stop(), 400);
    }
  } catch(e) {
    // Silencieux en cas d'erreur (mobile, navigateur ancien...)
  }
}

// 📦 État du quiz (global simple)
let engineState = { currentIndex: 0, score: 0, pairs: [] };

// ✅ FONCTION PRINCIPALE - définie directement
window.Engine.renderQuiz = function(lesson) {
  console.log('🎮 renderQuiz: démarrage pour', lesson.title);
  
  // Reset état
  engineState.currentIndex = 0;
  engineState.score = 0;
  engineState.pairs = [...lesson.pairs].sort(() => Math.random() - 0.5);
  
  // Rendu HTML
  const content = document.getElementById('app-content');
  if (!content) { console.error('❌ #app-content introuvable'); return; }
  
  content.innerHTML = `
    <div class="quiz-header">
      <h2>${lesson.title}</h2>
      <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
      <p>Score: <span id="score-val">0</span></p>
    </div>
    <div class="quiz-area" id="quiz-area"></div>
    <button id="next-btn" class="hidden">Suivant ➡️</button>
  `;
  
  // Lancer la première manche
  engineRenderRound();
  
  // Bouton Suivant
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.onclick = function() {
      engineState.currentIndex++;
      engineRenderRound();
    };
  }
  
  console.log('✅ renderQuiz: initialisation terminée');
};

// 🔄 Rendu d'une manche
function engineRenderRound() {
  const current = engineState.pairs[engineState.currentIndex];
  if (!current) { engineCompleteQuiz(); return; }
  
  const area = document.getElementById('quiz-area');
  if (!area) return;
  
  // Mélanger les options
  const shuffled = [...engineState.pairs].map(p => p.word).sort(() => Math.random() - 0.5);
  
  area.innerHTML = `
    <div class="drag-container">
      <div class="drop-zone" data-target="${current.word}">Clique sur la bonne réponse</div>
      <div class="image-display">${current.img}</div>
    </div>
    <div class="options-grid">
      ${shuffled.map(w => `<div class="option-card" data-word="${w}">${w}</div>`).join('')}
    </div>
    <div id="feedback" class="feedback hidden"></div>
  `;
  
  // Attacher les clics
  document.querySelectorAll('.option-card').forEach(card => {
    card.onclick = function() {
      engineHandleAnswer(card.dataset.word);
    };
  });
  
  // Mise à jour progression
  const pct = (engineState.currentIndex / engineState.pairs.length) * 100;
  const bar = document.querySelector('.progress-fill');
  if (bar) bar.style.width = pct + '%';
}

// ✅❌ Vérification réponse
function engineHandleAnswer(selectedWord) {
  const zone = document.querySelector('.drop-zone');
  const feedback = document.getElementById('feedback');
  const target = zone?.dataset.target;
  
  if (!zone || !feedback || !target) return;
  
  if (selectedWord === target) {
    // Bonne réponse
    playSound('correct'); // ✅ Appel cohérent
    engineState.score += 10;
    const scoreEl = document.getElementById('score-val');
    if (scoreEl) scoreEl.textContent = engineState.score;
    
    zone.innerHTML = `<span style="color:#34d399;font-weight:bold;">✅ ${target}</span>`;
    zone.classList.add('correct');
    feedback.textContent = "Bravo ! 🎉";
    feedback.className = "feedback success";
    
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.classList.remove('hidden');
  } else {
    // Mauvaise réponse
    playSound('wrong'); // ✅ Appel cohérent
    zone.classList.add('shake');
    feedback.textContent = "Essaie encore ! 💪";
    feedback.className = "feedback error";
    setTimeout(() => zone.classList.remove('shake'), 300);
  }
}

// 🏆 Fin du quiz
function engineCompleteQuiz() {
  playSound('victory'); // ✅ Appel cohérent
  const area = document.getElementById('quiz-area');
  if (!area) return;
  
  area.innerHTML = `
    <div style="text-align:center;padding:2rem;">
      <div style="font-size:4rem;">🏆</div>
      <h2>Bravo !</h2>
      <p>Score final : <strong>${engineState.score} pts</strong></p>
      <button onclick="location.reload()" style="margin-top:1rem;padding:0.8rem 2rem;background:var(--primary);color:#fff;border:none;border-radius:12px;cursor:pointer;">Rejouer 🔄</button>
    </div>
  `;
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) nextBtn.remove();
}

// ✅ Confirmation finale
console.log('🟢 engine.js: window.Engine.renderQuiz =', typeof window.Engine.renderQuiz);
