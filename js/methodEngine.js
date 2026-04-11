// js/methodEngine.js - Module Méthode Structurée ✅
console.log('🟢 methodEngine.js: chargé');
window.MethodEngine = {};

window.MethodEngine.renderLesson = function(lesson) {
  console.log('📈 Method: chargement de', lesson.title);
  const content = document.getElementById('app-content');
  this.currentLesson = lesson;
  this.state = { currentStep: 'situation', quizIndex: 0, score: 0 };

  content.innerHTML = `
    <div class="method-container">
      <h2>${lesson.title}</h2>
      <p class="competence-tag">🎯 ${lesson.competence}</p>
      <div class="method-nav">
        <button class="method-step active" data-step="situation">1️⃣ Situation</button>
        <button class="method-step" data-step="lecon" disabled>2️⃣ Leçon</button>
        <button class="method-step" data-step="activite" disabled>3️⃣ Exercice</button>
      </div>
      <div id="method-content"></div>
      <button id="method-next" class="btn-apc">Je comprends ➡️</button>
    </div>
  `;
  this.setupNav();
  this.renderStep();
};

window.MethodEngine.setupNav = function() {
  const steps = document.querySelectorAll('.method-step');
  const btn = document.getElementById('method-next');
  steps.forEach(b => b.addEventListener('click', e => {
    if(e.target.disabled) return;
    steps.forEach(x => x.classList.remove('active'));
    e.target.classList.add('active');
    this.state.currentStep = e.target.dataset.step;
    this.renderStep();
  }));
  
  btn.onclick = () => {
    const idx = ['situation','lecon','activite'].indexOf(this.state.currentStep);
    if(idx < 2) {
      this.state.currentStep = ['situation','lecon','activite'][idx+1];
      steps[idx].disabled = true; steps[idx+1].disabled = false;
      steps[idx].classList.remove('active'); steps[idx+1].classList.add('active');
      btn.textContent = this.state.currentStep === 'activite' ? 'Commencer l\'exercice 📝' : 'Voir la leçon 📚';
      this.renderStep();
    } else if(this.state.currentStep === 'activite') {
      this.startQuiz();
      btn.style.display = 'none';
    }
  };
};

window.MethodEngine.renderStep = function() {
  const content = document.getElementById('method-content');
  const l = this.currentLesson;
  if(this.state.currentStep === 'situation') {
    content.innerHTML = `
      <div class="situation-card">
        <h3>${l.situationProbleme.titre}</h3>
        <div style="font-size:3rem;text-align:center;margin:1rem;">${l.situationProbleme.image}</div>
        <p class="situation-text">${l.situationProbleme.texte}</p>
        <div class="situation-question">❓ ${l.situationProbleme.question}</div>
      </div>`;
  } else if(this.state.currentStep === 'lecon') {
    content.innerHTML = `
      <div class="lesson-card">
        <h3>${l.lecon.titre}</h3>
        <div class="grammar-grid">
          ${l.lecon.contenu.map(c => `
            <div class="grammar-rule">
              <div class="rule-title">${c.regle}</div>
              <div class="rule-usage">🎯 ${c.usage}</div>
              <div class="rule-example">💬 ${c.exemple}</div>
              <div class="rule-markers">🏷️ Marqueurs : ${c.marqueurs}</div>
            </div>`).join('')}
        </div>
        <div class="lesson-tip">${l.lecon.astuce}</div>
      </div>`;
  }
};

window.MethodEngine.startQuiz = function() {
  const content = document.getElementById('method-content');
  const qs = this.currentLesson.activite.questions || [];
  this.state.quizIndex = 0; this.state.score = 0;

  const renderQ = () => {
    if(this.state.quizIndex >= qs.length) return this.finishQuiz();
    const q = qs[this.state.quizIndex];
    content.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-progress">Question ${this.state.quizIndex + 1}/${qs.length}</div>
        <h3>${q.q}</h3>
        <div class="options-grid">
          ${q.options.map((opt, i) => `<button class="quiz-opt" data-i="${i}">${opt}</button>`).join('')}
        </div>
        <div id="quiz-fb" class="feedback hidden"></div>
      </div>`;
    document.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.onclick = () => {
        if(btn.disabled) return;
        document.querySelectorAll('.quiz-opt').forEach(b => { b.disabled = true; b.style.opacity = '0.6'; });
        const i = parseInt(btn.dataset.i);
        const ok = i === q.correct;
        if(ok) { this.state.score += 10; if(window.playSound) window.playSound('correct'); }
        else { if(window.playSound) window.playSound('wrong'); }
        if(typeof Progress?.analytics?.record === 'function') Progress.analytics.record(ok);
        const fb = document.getElementById('quiz-fb');
        fb.textContent = q.feedback;
        fb.className = `feedback ${ok ? 'success' : 'error'}`;
        btn.style.opacity = '1'; btn.style.borderColor = ok ? '#10b981' : '#ef4444';
        setTimeout(() => { this.state.quizIndex++; renderQ(); }, 1500);
      };
    });
  };
  renderQ();
};

window.MethodEngine.finishQuiz = function() {
  const content = document.getElementById('method-content');
  if(window.playSound) window.playSound('victory');
  if(typeof Progress !== 'undefined') {
    Progress.save('method', { score: this.state.score, lesson: this.currentLesson.title, competence: this.currentLesson.competence });
    Progress.analytics.end('method', this.currentLesson.title);
  }
  content.innerHTML = `
    <div style="text-align:center;padding:2rem;">
      <div style="font-size:4rem;">🏆</div>
      <h2>Leçon terminée !</h2>
      <p>Score : <strong>${this.state.score} / ${this.currentLesson.activite.questions.length * 10} pts</strong></p>
      <button onclick="location.reload()" class="btn-apc" style="margin-top:1rem;">Recommencer 🔄</button>
    </div>`;
};
