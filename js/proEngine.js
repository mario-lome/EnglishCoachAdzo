// js/proEngine.js - Module Professionnel ✅
console.log('🟢 proEngine.js: chargé');
window.ProEngine = {};

window.ProEngine.renderLesson = function(lesson) {
  console.log('🏢 Pro: chargement de', lesson.title);
  const content = document.getElementById('app-content');
  this.currentLesson = lesson;

  content.innerHTML = `
    <div class="pro-container">
      <h2>${lesson.title}</h2>
      <p class="competence-tag">🎯 ${lesson.competence}</p>
      <div class="pro-tabs">
        <button class="pro-tab active" data-view="flashcards">🃏 Flashcards</button>
        <button class="pro-tab" data-view="pomodoro">⏱️ Pomodoro</button>
        <button class="pro-tab" data-view="emails">📧 Emails</button>
      </div>
      <div id="pro-content"></div>
    </div>
  `;
  this.setupTabs();
  this.showFlashcards();
};

window.ProEngine.setupTabs = function() {
  document.querySelectorAll('.pro-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.pro-tab').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const view = e.target.dataset.view;
      if(view === 'flashcards') this.showFlashcards();
      else if(view === 'pomodoro') this.showPomodoro();
      else if(view === 'emails') this.showEmails();
    });
  });
};

// 🃏 Flashcards
window.ProEngine.showFlashcards = function() {
  const content = document.getElementById('pro-content');
  const cards = this.currentLesson.flashcards || [];
  let idx = 0;

  const renderCard = () => {
    if(!cards[idx]) {
      content.innerHTML = `<p style="text-align:center;opacity:0.7;padding:2rem;">✅ Toutes les cartes vues !</p>`;
      return;
    }
    const c = cards[idx];
    content.innerHTML = `
      <div class="flashcard-wrapper">
        <div class="flashcard" onclick="this.classList.toggle('flipped')">
          <div class="flashcard-inner">
            <div class="flashcard-front"><h3>${c.front}</h3><p>Clique pour révéler</p></div>
            <div class="flashcard-back"><h3>${c.back}</h3></div>
          </div>
        </div>
        <div class="flashcard-nav">
          <button id="fc-prev" ${idx===0?'disabled':''}>⬅️ Préc.</button>
          <span>${idx+1} / ${cards.length}</span>
          <button id="fc-next" ${idx===cards.length-1?'disabled':''}>Suiv. ➡️</button>
        </div>
      </div>
    `;
    document.getElementById('fc-next').onclick = () => { idx++; renderCard(); };
    document.getElementById('fc-prev').onclick = () => { idx--; renderCard(); };
  };
  renderCard();
};

// ⏱️ Pomodoro
window.ProEngine.showPomodoro = function() {
  const content = document.getElementById('pro-content');
  const tasks = this.currentLesson.pomodoro?.tasks || [];
  let currentTask = 0;
  let timeLeft = 25 * 60;
  let timer = null;

  content.innerHTML = `
    <div class="pomodoro-ui">
      <h3>🎧 Scénario Pomodoro</h3>
      <div class="task-list">
        ${tasks.map((t,i) => `<div class="task-item ${i===0?'active':''}" data-i="${i}">${t.label} (${t.duration} min)</div>`).join('')}
      </div>
      <div class="timer-display">
        <div class="timer-circle">
          <div class="timer-text" id="timer-val">25:00</div>
        </div>
      </div>
      <div class="timer-controls">
        <button id="timer-start" class="btn-pro">▶️ Démarrer</button>
        <button id="timer-reset" class="btn-pro btn-outline">🔄 Reset</button>
      </div>
    </div>
  `;

  const format = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const updateDisplay = () => document.getElementById('timer-val').textContent = format(timeLeft);

  document.getElementById('timer-start').onclick = () => {
    if(timer) { clearInterval(timer); timer=null; document.getElementById('timer-start').textContent='▶️ Reprendre'; return; }
    document.getElementById('timer-start').textContent='⏸️ Pause';
    timer = setInterval(() => {
      timeLeft--;
      updateDisplay();
      if(timeLeft <= 0) {
        clearInterval(timer); timer=null;
        document.getElementById('timer-start').textContent='✅ Terminé';
        // Son de fin + sauvegarde
        if(window.playSound) window.playSound('victory');
        if(typeof Progress !== 'undefined') {
          Progress.save('pro', { score: tasks[currentTask].duration, lesson: this.currentLesson.title, competence: this.currentLesson.competence });
        }
        alert(`⏱️ Session terminée ! Prochaine tâche : ${tasks[currentTask+1]?.label || 'Repos'}`);
      }
    }, 1000);
  };

  document.getElementById('timer-reset').onclick = () => {
    clearInterval(timer); timer=null; timeLeft = tasks[currentTask].duration * 60; updateDisplay();
    document.getElementById('timer-start').textContent='▶️ Démarrer';
  };
};

// 📧 Emails
window.ProEngine.showEmails = function() {
  const content = document.getElementById('pro-content');
  const email = this.currentLesson.emails;
  if(!email) return content.innerHTML = '<p>Module email en préparation.</p>';

  content.innerHTML = `
    <div class="email-scenario">
      <h3>${email.title}</h3>
      <p class="scenario-text">${email.scenario}</p>
      <div class="email-options">
        ${email.options.map((opt, i) => `
          <button class="email-opt" data-i="${i}">
            <div class="opt-text">${opt.text}</div>
            <div class="opt-feedback hidden"></div>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  document.querySelectorAll('.email-opt').forEach(btn => {
    btn.onclick = () => {
      if(btn.classList.contains('answered')) return;
      const idx = parseInt(btn.dataset.i);
      const opt = email.options[idx];
      const fb = btn.querySelector('.opt-feedback');
      fb.textContent = opt.feedback;
      fb.classList.remove('hidden');
      fb.classList.add(opt.correct ? 'success' : 'error');
      btn.classList.add('answered', opt.correct ? 'correct-opt' : 'wrong-opt');
      
      if(opt.correct) {
        if(window.playSound) window.playSound('correct');
        if(typeof Progress !== 'undefined') {
          Progress.save('pro', { score: 30, lesson: this.currentLesson.title, competence: this.currentLesson.competence });
        }
      } else {
        if(window.playSound) window.playSound('wrong');
      }
    };
  });
};
