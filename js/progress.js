// js/progress.js - Dashboard + Analytics + Export CSV ✅
console.log('🟢 progress.js: chargé avec Analytics');
const Progress = {
  // 📊 Charger les données
  load: function(track) {
    return JSON.parse(localStorage.getItem(`eca_progress_${track}`) || '{"history":[],"badges":[],"totalScore":0}');
  },
  save: function(track, session) {
    const key = `eca_progress_${track}`;
    const data = this.load(track);
    data.history.unshift({ date: new Date().toISOString(), score: session.score, lesson: session.lesson, competence: session.competence });
    if (data.history.length > 20) data.history.pop();
    data.totalScore = data.history.reduce((sum, s) => sum + s.score, 0);
    this.unlockBadges(data, session);
    localStorage.setItem(key, JSON.stringify(data));
    return data;
  },
  unlockBadges: function(data, session) {
    const badges = [
      { id: 'first_win', name: '🌟 Premier succès', cond: d => d.history.length >= 1 },
      { id: 'score_50', name: '🎯 Score 50+', cond: d => d.totalScore >= 50 },
      { id: 'streak_3', name: '🔥 Série x3', cond: d => d.history.slice(0,3).length===3 && d.history.slice(0,3).every(s=>s.score>=20) }
    ];
    badges.forEach(b => { if(b.cond(data) && !data.badges.includes(b.id)) data.badges.push(b.id); });
  },
  
  // 📈 Analytics Tracking
  analytics: {
    start: null, correct: 0, attempts: 0,
    startSession: function() { this.start = Date.now(); this.correct = 0; this.attempts = 0; },
    record: function(isCorrect) { this.attempts++; if(isCorrect) this.correct++; },
    end: function(track, lesson) {
      const duration = this.start ? Math.round((Date.now() - this.start) / 1000) : 0;
      const rate = this.attempts > 0 ? Math.round((this.correct / this.attempts) * 100) : 0;
      const key = `eca_analytics_${track}`;
      const data = JSON.parse(localStorage.getItem(key) || '{"sessions":[],"totalCorrect":0,"totalAttempts":0}');
      data.sessions.unshift({ date: new Date().toISOString(), duration, successRate: rate, lesson });
      if(data.sessions.length > 30) data.sessions.pop();
      data.totalCorrect += this.correct; data.totalAttempts += this.attempts;
      localStorage.setItem(key, JSON.stringify(data));
      this.start = null; this.correct = 0; this.attempts = 0;
      return data;
    },
    exportCSV: function(track) {
      const key = `eca_analytics_${track}`;
      const d = JSON.parse(localStorage.getItem(key) || '{"sessions":[],"totalCorrect":0,"totalAttempts":0}');
      let csv = "Date,Leçon,Durée (sec),Taux Réussite (%),Cumul Justes,Cumul Tentatives\n";
      d.sessions.forEach(s => { csv += `"${s.date}","${s.lesson||''}",${s.duration},${s.successRate},${d.totalCorrect},${d.totalAttempts}\n`; });
      const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `analytics-${track}-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    }
  },

  // 📊 Rendu Dashboard
  render: function(track, container) {
    const data = this.load(track);
    const aKey = `eca_analytics_${track}`;
    const aData = JSON.parse(localStorage.getItem(aKey) || '{"totalCorrect":0,"totalAttempts":0,"sessions":[]}');
    const level = Math.min(10, Math.floor(data.totalScore / 20) + 1);
    const nextLevel = level * 20;
    const progressPct = (data.totalScore % 20) / 20 * 100;
    const globalRate = aData.totalAttempts > 0 ? Math.round((aData.totalCorrect/aData.totalAttempts)*100) : 0;

    container.innerHTML = `
      <div class="progress-dashboard">
        <div class="dash-header">
          <h2>📊 Tes Progrès</h2>
          <div class="level-badge">Niveau ${level} 🎖️</div>
        </div>
        <div class="score-card">
          <div class="score-value">${data.totalScore}</div>
          <div class="score-label">Points totaux</div>
          <div class="progress-bar-mini"><div class="progress-fill-mini" style="width:${progressPct}%"></div></div>
          <div class="progress-text">${data.totalScore % 20}/20 pts pour le niveau ${level+1}</div>
        </div>
        
        <!-- 📈 Carte Analytics -->
        <div class="analytics-card">
          <h3>📈 Analytics Session</h3>
          <div class="stats-grid">
            <div class="stat-box"><div class="stat-val">${globalRate}%</div><div class="stat-lab">Taux global</div></div>
            <div class="stat-box"><div class="stat-val">${aData.totalAttempts}</div><div class="stat-lab">Tentatives</div></div>
            <div class="stat-box"><div class="stat-val">${aData.totalCorrect}</div><div class="stat-lab">Réponses justes</div></div>
          </div>
          <div class="history-list" style="margin-top:1rem;">
            ${aData.sessions.slice(0,5).map(s => `
              <div class="history-item">
                <div class="history-content">
                  <strong>${s.lesson || 'Session'}</strong>
                  <span class="history-score">⏱️ ${s.duration}s | ✅ ${s.successRate}%</span>
                </div>
              </div>
            `).join('') || '<p style="opacity:0.6;font-size:0.9rem;">Commence une leçon pour activer le suivi ⏱️</p>'}
          </div>
        </div>

        <div class="badges-section">
          <h3>🏆 Badges</h3>
          <div class="badges-grid">
            ${this.renderBadges(data.badges)}
          </div>
        </div>
        <div class="dash-actions">
          <button class="btn-dash" onclick="Progress.analytics.exportCSV('${track}')">📤 Exporter CSV</button>
          <button class="btn-dash btn-outline" onclick="Progress.resetProgress('${track}')">🔄 Réinitialiser</button>
        </div>
      </div>
    `;
    // Inject CSS si absent
    if(!document.getElementById('analytics-css')) {
      const style = document.createElement('style'); style.id='analytics-css';
      style.textContent = `.analytics-card{background:var(--card-bg);padding:1.2rem;border-radius:16px;margin-bottom:1.5rem;border:1px solid rgba(255,255,255,0.1);} .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0.8rem;margin-bottom:1rem;} .stat-box{background:rgba(255,255,255,0.05);padding:0.8rem;border-radius:12px;text-align:center;} .stat-val{font-size:1.4rem;font-weight:700;color:var(--accent);} .stat-lab{font-size:0.8rem;opacity:0.7;margin-top:0.3rem;}`;
      document.head.appendChild(style);
    }
  },
  renderBadges: function(unlocked) {
    const all = [{id:'first_win',name:'🌟 Premier'},{id:'score_50',name:'🎯 50 pts'},{id:'streak_3',name:'🔥 Série x3'}];
    return all.map(b => `<div class="badge-card ${unlocked.includes(b.id)?'unlocked':'locked'}"><div class="badge-icon">${unlocked.includes(b.id)?b.name.split(' ')[0]:'🔒'}</div><div class="badge-name">${b.name}</div></div>`).join('');
  },
  resetProgress: function(track) {
    if(confirm('⚠️ Effacer TOUTE la progression ?')) {
      localStorage.removeItem(`eca_progress_${track}`); localStorage.removeItem(`eca_analytics_${track}`);
      location.reload();
    }
  }
};
