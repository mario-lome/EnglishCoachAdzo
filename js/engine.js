// js/engine.js - Module Quiz Enfants (Complet & Autonome)
const Engine = (() => {
  let state = { currentLesson: null, currentIndex: 0, score: 0, pairs: [], draggedItem: null };
  console.log('🔍 engine.js chargé');
window.EngineTest = 'OK'; // Force une variable globale pour le test

  // 🎵 Gestionnaire Audio (sécurisé pour mobile)
  const Audio = {
    correct: new Audio('/assets/audio/correct.mp3'),
    wrong: new Audio('/assets/audio/wrong.mp3'),
    victory: new Audio('/assets/audio/victory.mp3'),
    play(sound) {
      try {
        this[sound].currentTime = 0;
        // Mobile bloque l'autoplay, mais ici on déclenche après interaction utilisateur ✅
        this[sound].play().catch(() => console.warn(`Audio ${sound} bloqué ou introuvable`));
      } catch (e) {
        console.warn('Audio non chargé:', sound);
      }
    }
  };

  // 🖥️ Rendu initial de la leçon
  const renderQuiz = (lesson) => {
    state.currentLesson = lesson;
    state.pairs = [...lesson.pairs].sort(() => Math.random() - 0.5);
    state.currentIndex = 0;
    state.score = 0;

    document.getElementById('app-content').innerHTML = `
      <div class="quiz-header">
        <h2>${lesson.title}</h2>
        <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
        <p class="score">Score: <span id="score-val">0</span></p>
      </div>
      <div class="quiz-area" id="quiz-area"></div>
      <button id="next-btn" class="hidden">Suivant ➡️</button>
    `;
    renderRound();
    document.getElementById('next-btn')?.addEventListener('click', () => {
      state.currentIndex++;
      renderRound();
    });
  };

  // 🔄 Rendu d'une manche
  const renderRound = () => {
    const area = document.getElementById('quiz-area');
    const current = state.pairs[state.currentIndex];
    if (!current) return completeQuiz();

    const shuffled = [...state.pairs].map(p => p.word).sort(() => Math.random() - 0.5);
    area.innerHTML = `
      <div class="drag-container">
        <div class="drop-zone" data-target="${current.word}"><div class="drop-placeholder">Glisse le mot ici</div></div>
        <div class="image-display">${current.img}</div>
      </div>
      <div class="options-grid">
        ${shuffled.map(w => `<div class="option-card" draggable="true" data-word="${w}">${w}</div>`).join('')}
      </div>
      <div id="feedback" class="feedback hidden"></div>
    `;
    setupDragAndDrop();
    updateProgress();
  };

  // 🖱️👆 Gestion Drag & Drop (Desktop + Mobile)
  const setupDragAndDrop = () => {
    const zone = document.querySelector('.drop-zone');
    const cards = document.querySelectorAll('.option-card');

    // Desktop
    cards.forEach(c => {
      c.addEventListener('dragstart', e => {
        state.draggedItem = e.target.dataset.word;
        e.dataTransfer.setData('text', state.draggedItem);
        e.target.style.opacity = '0.5';
      });
      c.addEventListener('dragend', e => e.target.style.opacity = '1');
    });
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      handleAnswer(e.dataTransfer.getData('text'));
    });

    // Mobile Touch
    let clone = null;
    cards.forEach(c => {
      c.addEventListener('touchstart', e => {
        e.preventDefault();
        state.draggedItem = c.dataset.word;
        clone = c.cloneNode(true);
        clone.style.cssText = 'position:fixed;opacity:0.8;z-index:1000;pointer-events:none;transform:scale(1.1);background:var(--card-bg);padding:1rem;border-radius:12px;';
        document.body.appendChild(clone);
        moveTouch(e.touches[0]);
      }, { passive: false });

      c.addEventListener('touchmove', e => { e.preventDefault(); moveTouch(e.touches[0]); }, { passive: false });

      c.addEventListener('touchend', e => {
        if (clone) clone.remove();
        const t = e.changedTouches[0];
        const r = zone.getBoundingClientRect();
        if (t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom) {
          handleAnswer(c.dataset.word);
        }
      });
    });

    const moveTouch = t => { if (clone) { clone.style.left = `${t.clientX - 60}px`; clone.style.top = `${t.clientY - 25}px`; } };
  };

  // ✅❌ Vérification de la réponse + Sons
  const handleAnswer = (word) => {
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
      setTimeout(() => zone.classList.remove('shake'), 400);
    }
  };

  // 📊 Mise à jour barre de progression
  const updateProgress = () => {
    const pct = (state.currentIndex / state.pairs.length) * 100;
    document.querySelector('.progress-fill').style.width = `${pct}%`;
  };

  // 🏆 Fin du quiz + Sauvegarde + Écran de victoire
  const completeQuiz = () => {
    const progress = JSON.parse(localStorage.getItem('eca_kids_progress') || '{}');
    progress.lastScore = state.score;
    progress.lastDate = new Date().toISOString();
    localStorage.setItem('eca_kids_progress', JSON.stringify(progress));

    Audio.play('victory');
    document.getElementById('quiz-area').innerHTML = `
      <div class="victory-overlay" id="victory-overlay">
        <div class="victory-card">
          <div class="victory-emoji">🏆</div>
          <h2>Bravo !</h2>
          <p>Score final : <strong>${state.score} points</strong></p>
          <button class="victory-btn" id="victory-replay">Rejouer 🔄</button>
        </div>
      </div>
    `;
    document.getElementById('next-btn')?.remove();
    document.getElementById('victory-replay').addEventListener('click', () => location.reload());
    createConfetti();
  };

  // 🎉 Confettis animés
  const createConfetti = () => {
    const overlay = document.getElementById('victory-overlay');
    const colors = ['#ff6b6b', '#4361ee', '#10b981', '#f59e0b', '#8b5cf6'];
    for (let i = 0; i < 40; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.animationDelay = Math.random() * 2 + 's';
      c.style.width = Math.random() * 10 + 5 + 'px';
      c.style.height = Math.random() * 10 + 5 + 'px';
      overlay.appendChild(c);
    }
  };

  // 📤 Export public
  return { renderQuiz };
})();
