// js/engine.js - VERSION APC (Approche Par Compétences) ✅
console.log('🟢 engine.js APC: chargement démarré');
window.Engine = {};

// 🎵 Audio synthétique (0 fichier requis)
function playSound(name) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (name === 'correct') { osc.frequency.value = 880; gain.gain.value = 0.3; osc.start(); osc.stop(ctx.currentTime + 0.15); }
    else if (name === 'wrong') { osc.frequency.value = 330; gain.gain.value = 0.3; osc.start(); osc.stop(ctx.currentTime + 0.25); }
    else if (name === 'victory') { osc.frequency.value = 660; gain.gain.value = 0.4; osc.start(); setTimeout(() => { osc.frequency.value = 880; }, 120); setTimeout(() => { osc.frequency.value = 1100; }, 240); setTimeout(() => { osc.stop(); }, 400); }
  } catch(e) {}
}

let engineState = { currentIndex: 0, score: 0, pairs: [], currentStep: 'situation' };

// 🎮 Point d'entrée principal
window.Engine.renderQuiz = function(lesson) {
  console.log('🎮 APC: démarrage pour', lesson.title);
  engineState.currentIndex = 0;
  engineState.score = 0;
  engineState.currentStep = 'situation';
  engineState.pairs = lesson.activite?.pairs ? [...lesson.activite.pairs].sort(() => Math.random() - 0.5) : [];
  engineState.lesson = lesson; // Stocke la leçon complète

  const content = document.getElementById('app-content');
  if (!content) { console.error('❌ #app-content introuvable'); return; }

  // Structure APC complète
  content.innerHTML = `
    <div class="quiz-header">
      <h2>${lesson.title}</h2>
      <p style="opacity:0.8;font-size:0.9rem">🎯 Compétence: ${lesson.competence}</p>
    </div>
    
    <!-- Navigation APC -->
    <div class="apc-nav">
      <button class="apc-step active" data-step="situation" id="step-situation">1️⃣ Situation</button>
      <button class="apc-step" data-step="lecon" id="step-lecon" disabled>2️⃣ Leçon</button>
      <button class="apc-step" data-step="activite" id="step-activite" disabled>3️⃣ Activité</button>
    </div>
    
    <!-- Zone de contenu dynamique -->
    <div id="apc-content"></div>
    
    <!-- Bouton de progression -->
    <button id="apc-next" class="btn-apc">Je suis prêt(e) ➡️</button>
  `;

  // Gestion des onglets APC
  document.querySelectorAll('.apc-step').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const step = e.target.dataset.step;
      if (step === 'situation' || (step === 'lecon' && engineState.currentStep !== 'situation') || (step === 'activite' && engineState.currentStep === 'lecon')) {
        engineState.currentStep = step;
        renderAPCStep();
      }
    });
  });

  // Bouton suivant
  document.getElementById('apc-next').onclick = () => {
    if (engineState.currentStep === 'situation') {
      engineState.currentStep = 'lecon';
      document.getElementById('step-lecon').disabled = false;
      document.getElementById('step-situation').classList.remove('active');
      document.getElementById('step-lecon').classList.add('active');
    } else if (engineState.currentStep === 'lecon') {
      engineState.currentStep = 'activite';
      document.getElementById('step-activite').disabled = false;
      document.getElementById('step-lecon').classList.remove('active');
      document.getElementById('step-activite').classList.add('active');
      document.getElementById('apc-next').textContent = 'Commencer l\'activité 🎮';
    } else {
      // Démarrer l'activité quiz
      renderQuizActivity();
      return;
    }
    renderAPCStep();
  };

  renderAPCStep();
  console.log('✅ APC: initialisation terminée');
};

// 🔄 Rendu dynamique selon l'étape APC
function renderAPCStep() {
  const content = document.getElementById('apc-content');
  const lesson = engineState.lesson;
  const btn = document.getElementById('apc-next');

  if (engineState.currentStep === 'situation') {
    btn.textContent = 'Voir la leçon 📚';
    content.innerHTML = `
      <div class="situation-card">
        <h3>${lesson.situationProbleme.titre}</h3>
        <div style="font-size:3rem;text-align:center;margin:1rem;">${lesson.situationProbleme.image}</div>
        <p class="situation-text">${lesson.situationProbleme.texte}</p>
        <div class="situation-question">❓ ${lesson.situationProbleme.question}</div>
      </div>
      <p style="text-align:center;opacity:0.8;font-size:0.9rem;margin-top:1rem;">💭 Réfléchis d'abord, puis découvre la solution dans la leçon.</p>
    `;
  } 
  else if (engineState.currentStep === 'lecon') {
    btn.textContent = 'Passer à l\'activité 🎮';
    content.innerHTML = `
      <div class="lesson-card">
        <h3>${lesson.lecon.titre}</h3>
        <div class="vocab-grid">
          ${lesson.lecon.contenu.map(item => `
            <div class="vocab-item">
              <div class="vocab-emoji">${item.emoji || '📝'}</div>
              <div class="vocab-mot">${item.mot || item.phrase}</div>
              <div class="vocab-trad">${item.traduction || item.usage}</div>
            </div>
          `).join('')}
        </div>
        ${lesson.lecon.astuce ? `<div class="lesson-tip">${lesson.lecon.astuce}</div>` : ''}
      </div>
    `;
  }
}

// 🎮 Rendu de l'activité quiz (inchangé, réutilisé)
function renderQuizActivity() {
  const content = document.getElementById('apc-content');
  const btn = document.getElementById('apc-next');
  btn.style.display = 'none'; // Cache le bouton APC pendant le quiz

  content.innerHTML = `
    <div class="quiz-area" id="quiz-area"></div>
    <button id="next-btn" class="hidden" style="margin-top:1rem;width:100%;">Suivant ➡️</button>
  `;
  engineRenderRound();
  document.getElementById('next-btn')?.addEventListener('click', () => {
    engineState.currentIndex++;
    engineRenderRound();
  });
}

// 🔄 Manche du quiz
function engineRenderRound() {
  const current = engineState.pairs[engineState.currentIndex];
  if (!current) { engineCompleteQuiz(); return; }
  
  const area = document.getElementById('quiz-area');
  if (!area) return;
  
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
  
  document.querySelectorAll('.option-card').forEach(card => {
    card.onclick = () => engineHandleAnswer(card.dataset.word);
  });
  
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
    playSound('correct');
    engineState.score += 10;
    document.getElementById('score-val').textContent = engineState.score;
    zone.innerHTML = `<span style="color:#34d399;font-weight:bold;">✅ ${target}</span>`;
    zone.classList.add('correct');
    feedback.textContent = "Bravo ! 🎉";
    feedback.className = "feedback success";
    document.getElementById('next-btn').classList.remove('hidden');
  } else {
    playSound('wrong');
    zone.classList.add('shake');
    feedback.textContent = "Essaie encore ! 💪";
    feedback.className = "feedback error";
    setTimeout(() => { zone.classList.remove('shake'); }, 300);
  }
}

// 🏆 Fin du quiz
function engineCompleteQuiz() {
  playSound('victory');
  document.getElementById('quiz-area').innerHTML = `
    <div style="text-align:center;padding:2rem;">
      <div style="font-size:4rem;">🏆</div>
      <h2>Bravo !</h2>
      <p>Score final : <strong>${engineState.score} pts</strong></p>
      <p style="opacity:0.8;margin:1rem 0;">Compétence acquise : ${engineState.lesson.competence}</p>
      <button onclick="location.reload()" style="margin-top:1rem;padding:0.8rem 2rem;background:var(--primary);color:#fff;border:none;border-radius:12px;cursor:pointer;">Rejouer 🔄</button>
    </div>
  `;
  document.getElementById('next-btn')?.remove();
}

console.log('🟢 engine.js APC: window.Engine.renderQuiz =', typeof window.Engine.renderQuiz);
