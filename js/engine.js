// js/engine.js - Quiz Enfants (Version Globale)
(function() {
  'use strict';
  
  let state = { currentLesson: null, currentIndex: 0, score: 0, pairs: [] };

  // 🎵 Audio (tolérant aux erreurs)
  const Audio = {
    correct: new Audio('/assets/audio/correct.mp3'),
    wrong: new Audio('/assets/audio/wrong.mp3'),
    victory: new Audio('/assets/audio/victory.mp3'),
    play: function(sound) {
      try { this[sound].currentTime = 0; this[sound].play().catch(()=>{}); } 
      catch(e) {}
    }
  };

  // 🖥️ Rendu principal
  function renderQuiz(lesson) {
    console.log('🎮 Quiz démarré:', lesson.title);
    state.currentLesson = lesson;
    state.pairs = [...lesson.pairs].sort(() => Math.random() - 0.5);
    state.currentIndex = 0;
    state.score = 0;

    document.getElementById('app-content').innerHTML = `
      <div class="quiz-header">
        <h2>${lesson.title}</h2>
        <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
        <p>Score: <span id="score-val">0</span></p>
      </div>
      <div class="quiz-area" id="quiz-area"></div>
      <button id="next-btn" class="hidden">Suivant ➡️</button>
    `;
    renderRound();
    document.getElementById('next-btn').addEventListener('click', () => {
      state.currentIndex++;
      renderRound();
    });
  }

  function renderRound() {
    const area = document.getElementById('quiz-area');
    const current = state.pairs[state.currentIndex];
    if (!current) return completeQuiz();

    const shuffled = [...state.pairs].map(p => p.word).sort(() => Math.random() - 0.5);
    area.innerHTML = `
      <div class="drag-container">
        <div class="drop-zone" data-target="${current.word}">Glisse le mot ici</div>
        <div class="image-display">${current.img}</div>
      </div>
      <div class="options-grid">
        ${shuffled.map(w => `<div class="option-card" data-word="${w}">${w}</div>`).join('')}
      </div>
      <div id="feedback" class="feedback hidden"></div>
    `;
    setupInteractions();
    updateProgress();
  }

  function setupInteractions() {
    const zone = document.querySelector('.drop-zone');
    const cards = document.querySelectorAll('.option-card');
    
    // Click simple (plus fiable que drag&drop pour le dev)
    cards.forEach(card => {
      card.addEventListener('click', () => handleAnswer(card.dataset.word));
    });
  }

  function handleAnswer(word) {
    const fb = document.getElementById('feedback');
    const zone = document.querySelector('.drop-zone');
    
    if (word === zone.dataset.target) {
      Audio.play('correct');
      state.score += 10;
      document.getElementById('score-val').textContent = state.score;
      zone.innerHTML = `<span style="color:#34d399;font-weight:bold;">✅ ${word}</span>`;
      zone.classList.add('correct');
      fb.textContent = "Bravo ! 🎉";
      fb.className = "feedback success";
      document.getElementById('next-btn').classList.remove('hidden');
    } else {
      Audio.play('wrong');
      zone.classList.add('shake');
      fb.textContent = "Essaie encore ! 💪";
      fb.className = "feedback error";
      setTimeout(() => zone.classList.remove('shake'), 300);
    }
  }

  function updateProgress() {
    const pct = (state.currentIndex / state.pairs.length) * 100;
    document.querySelector('.progress-fill').style.width = `${pct}%`;
  }

  function completeQuiz() {
    Audio.play('victory');
    document.getElementById('quiz-area').innerHTML = `
      <div style="text-align:center;padding:2rem;">
        <div style="font-size:4rem;">🏆</div>
        <h2>Bravo !</h2>
        <p>Score : <strong>${state.score} pts</strong></p>
        <button onclick="location.reload()" style="margin-top:1rem;padding:0.8rem 2rem;">Rejouer 🔄</button>
      </div>
    `;
    document.getElementById('next-btn').remove();
  }

  // 🌍 EXPOSITION GLOBALE (CLÉ DU SUCCÈS)
  window.Engine = { renderQuiz };
  
  // Log de confirmation
  console.log('✅ Engine.js chargé et Engine exposé globalement');
})();
