// js/engine.js
const Engine = (() => {
  let state = { currentLesson: null, currentIndex: 0, score: 0, pairs: [], draggedItem: null };

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
    document.getElementById('next-btn')?.addEventListener('click', () => { state.currentIndex++; saveProgress(); renderRound(); });
  };

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

  const setupDragAndDrop = () => {
    const zone = document.querySelector('.drop-zone');
    const cards = document.querySelectorAll('.option-card');

    // Desktop
    cards.forEach(c => {
      c.addEventListener('dragstart', e => { state.draggedItem = e.target.dataset.word; e.dataTransfer.setData('text', e.target.dataset.word); e.target.style.opacity='0.5'; });
      c.addEventListener('dragend', e => e.target.style.opacity='1');
    });
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); handleAnswer(e.dataTransfer.getData('text')); });

    // Mobile Touch
    let clone = null;
    cards.forEach(c => {
      c.addEventListener('touchstart', e => {
        e.preventDefault();
        state.draggedItem = c.dataset.word;
        clone = c.cloneNode(true);
        clone.style.cssText = 'position:fixed;opacity:0.8;z-index:1000;pointer-events:none;transform:scale(1.1);';
        document.body.appendChild(clone);
        moveTouch(e.touches[0]);
      }, {passive:false});
      c.addEventListener('touchmove', e => { e.preventDefault(); moveTouch(e.touches[0]); }, {passive:false});
      c.addEventListener('touchend', e => {
        if(clone) clone.remove();
        const t = e.changedTouches[0];
        const r = zone.getBoundingClientRect();
        if(t.clientX>=r.left && t.clientX<=r.right && t.clientY>=r.top && t.clientY<=r.bottom) handleAnswer(c.dataset.word);
      });
    });
    const moveTouch = t => { if(clone) { clone.style.left=`${t.clientX-60}px`; clone.style.top=`${t.clientY-25}px`; } };
  };

  const handleAnswer = (word) => {
    const fb = document.getElementById('feedback');
    const zone = document.querySelector('.drop-zone');
    if(word === zone.dataset.target) {
      state.score += 10;
      document.getElementById('score-val').textContent = state.score;
      zone.innerHTML = `<span style="color:#34d399;font-weight:bold;">✅ ${word}</span>`;
      zone.classList.add('correct');
      fb.textContent = "Bravo ! 🎉"; fb.className = "feedback success";
      document.getElementById('next-btn').classList.remove('hidden');
    } else {
      zone.classList.add('shake');
      fb.textContent = "Essaie encore ! 💪"; fb.className = "feedback error";
      setTimeout(()=>zone.classList.remove('shake'), 400);
    }
  };

  const updateProgress = () => {
    document.querySelector('.progress-fill').style.width = `${(state.currentIndex/state.pairs.length)*100}%`;
  };

  const completeQuiz = () => {
    localStorage.setItem('eca_kids_progress', JSON.stringify({score: state.score, date: new Date().toISOString()}));
    document.getElementById('quiz-area').innerHTML = `<div class="quiz-complete"><h2>🏆 Félicitations !</h2><p>Score final : <strong>${state.score} pts</strong></p><button onclick="location.reload()">Rejouer 🔄</button></div>`;
    document.getElementById('next-btn').remove();
  };

  const saveProgress = () => {}; // Placeholder for intermediate saves

  return { renderQuiz };
})();
