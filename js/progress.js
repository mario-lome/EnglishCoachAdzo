// js/progress.js - Dashboard Progression ✅
console.log('🟢 progress.js: chargé');

const Progress = {
  // 📊 Charger les données de progression
  load: function(track) {
    const key = `eca_progress_${track}`;
    return JSON.parse(localStorage.getItem(key) || '{"history":[],"badges":[],"totalScore":0}');
  },
  
  // 💾 Sauvegarder une nouvelle session
  save: function(track, session) {
    const key = `eca_progress_${track}`;
    const data = this.load(track);
    
    data.history.unshift({
      date: new Date().toISOString(),
      score: session.score,
      lesson: session.lesson,
      competence: session.competence
    });
    
    // Garder seulement les 20 dernières sessions
    if (data.history.length > 20) data.history.pop();
    
    // Mettre à jour le score total
    data.totalScore = data.history.reduce((sum, s) => sum + s.score, 0);
    
    // Débloquer des badges si critères atteints
    this.unlockBadges(data, session);
    
    localStorage.setItem(key, JSON.stringify(data));
    return data;
  },
  
  // 🏆 Système de badges
  unlockBadges: function(data, session) {
    const badges = [
      { id: 'first_win', name: '🌟 Premier succès', condition: d => d.history.length >= 1 },
      { id: 'score_50', name: '🎯 Score 50+', condition: d => d.totalScore >= 50 },
      { id: 'score_100', name: '🏆 Score 100+', condition: d => d.totalScore >= 100 },
      { id: 'streak_3', name: '🔥 Série x3', condition: d => {
        const last3 = d.history.slice(0, 3);
        return last3.length === 3 && last3.every(s => s.score >= 20);
      }},
      { id: 'all_lessons', name: '📚 Explorateur', condition: d => {
        const unique = [...new Set(d.history.map(h => h.lesson))];
        return unique.length >= 3;
      }}
    ];
    
    badges.forEach(badge => {
      if (badge.condition(data) && !data.badges.includes(badge.id)) {
        data.badges.push(badge.id);
        console.log(`🏆 Nouveau badge débloqué: ${badge.name}`);
      }
    });
  },
  
  // 📈 Générer le HTML du dashboard
  render: function(track, container) {
    const data = this.load(track);
    const titles = { kids: '🎮 Enfants', pro: '🏢 Pro', method: '📈 Méthode' };
    
    // Calculer le niveau (1-10)
    const level = Math.min(10, Math.floor(data.totalScore / 20) + 1);
    const nextLevel = level * 20;
    const progress = (data.totalScore % 20) / 20 * 100;
    
    container.innerHTML = `
      <div class="progress-dashboard">
        <!-- En-tête -->
        <div class="dash-header">
          <h2>📊 Tes Progrès ${titles[track] || ''}</h2>
          <div class="level-badge">Niveau ${level} 🎖️</div>
        </div>
        
        <!-- Score total -->
        <div class="score-card">
          <div class="score-value">${data.totalScore}</div>
          <div class="score-label">Points totaux</div>
          <div class="progress-bar-mini">
            <div class="progress-fill-mini" style="width:${progress}%"></div>
          </div>
          <div class="progress-text">${data.totalScore % 20}/20 pts pour le niveau ${level + 1}</div>
        </div>
        
        <!-- Badges -->
        <div class="badges-section">
          <h3>🏆 Badges débloqués</h3>
          <div class="badges-grid">
            ${this.renderBadges(data.badges)}
          </div>
        </div>
        
        <!-- Historique -->
        <div class="history-section">
          <h3>📜 Historique récent</h3>
          ${data.history.length > 0 ? this.renderHistory(data.history) : '<p style="opacity:0.6">Aucune session encore. Commence une leçon ! 🎮</p>'}
        </div>
        
        <!-- Actions -->
        <div class="dash-actions">
          <button class="btn-dash" onclick="Progress.exportData('${track}')">📤 Exporter mes progrès</button>
          <button class="btn-dash btn-outline" onclick="Progress.resetProgress('${track}')">🔄 Réinitialiser</button>
        </div>
      </div>
    `;
  },
  
  // 🏆 Rendu des badges
  renderBadges: function(unlocked) {
    const allBadges = [
      { id: 'first_win', name: '🌟 Premier succès', desc: 'Première leçon terminée' },
      { id: 'score_50', name: '🎯 Score 50+', desc: '50 points accumulés' },
      { id: 'score_100', name: '🏆 Score 100+', desc: '100 points accumulés' },
      { id: 'streak_3', name: '🔥 Série x3', desc: '3 sessions >20 pts d\'affilée' },
      { id: 'all_lessons', name: '📚 Explorateur', desc: '3 leçons différentes complétées' },
      { id: 'perfect', name: '💯 Perfectionniste', desc: 'Score parfait à une leçon' }
    ];
    
    return allBadges.map(badge => {
      const isUnlocked = unlocked.includes(badge.id);
      return `
        <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}" title="${badge.desc}">
          <div class="badge-icon">${isUnlocked ? badge.name.split(' ')[0] : '🔒'}</div>
          <div class="badge-name">${badge.name}</div>
          ${!isUnlocked ? `<div class="badge-desc">${badge.desc}</div>` : ''}
        </div>
      `;
    }).join('');
  },
  
  // 📜 Rendu de l'historique
  renderHistory: function(history) {
    return `
      <div class="history-list">
        ${history.slice(0, 10).map((item, i) => {
          const date = new Date(item.date).toLocaleDateString('fr-FR', { 
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
          });
          return `
            <div class="history-item">
              <div class="history-date">${date}</div>
              <div class="history-content">
                <strong>${item.lesson}</strong>
                <span class="history-score">+${item.score} pts</span>
              </div>
              <div class="history-competence" style="font-size:0.85rem;opacity:0.8">${item.competence || ''}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },
  
  // 📤 Exporter les données (texte + partage)
  exportData: function(track) {
    const data = this.load(track);
    const titles = { kids: 'Enfants', pro: 'Pro', method: 'Méthode' };
    
    const text = `📊 Mes Progrès EnglishCoachAdzo - ${titles[track]}
━━━━━━━━━━━━━━━━━━━━━━
🎖️ Niveau: ${Math.min(10, Math.floor(data.totalScore/20)+1)}
⭐ Points totaux: ${data.totalScore}
🏆 Badges: ${data.badges.length}/6

📜 Dernières sessions:
${data.history.slice(0,5).map(h => 
  `• ${new Date(h.date).toLocaleDateString('fr-FR')} | ${h.lesson} | +${h.score} pts`
).join('\n')}

🚀 Continue comme ça ! #EnglishCoachAdzo`;
    
    // Copier dans le presse-papiers
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Tes progrès sont copiés ! Colle-les où tu veux 📱');
    }).catch(() => {
      // Fallback pour anciens navigateurs
      const blob = new Blob([text], {type: 'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `progres-english-${track}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    });
  },
  
  // 🔄 Réinitialiser (avec confirmation)
  resetProgress: function(track) {
    if (confirm('⚠️ Es-tu sûr de vouloir effacer TOUTE ta progression ? Cette action est irréversible.')) {
      localStorage.removeItem(`eca_progress_${track}`);
      alert('✅ Progression réinitialisée. À toi de jouer ! 🎮');
      location.reload();
    }
  }
};

// 🎨 CSS dynamique injecté (si pas déjà dans main.css)
if (!document.getElementById('progress-css')) {
  const style = document.createElement('style');
  style.id = 'progress-css';
  style.textContent = `
    .progress-dashboard { padding: 1rem; max-width: 600px; margin: 0 auto; }
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .level-badge { background: var(--primary); color: white; padding: 0.4rem 1rem; border-radius: 20px; font-weight: 600; font-size: 0.9rem; }
    
    .score-card { background: var(--card-bg); padding: 1.5rem; border-radius: 16px; text-align: center; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.1); }
    .score-value { font-size: 3rem; font-weight: 800; color: var(--primary); line-height: 1; }
    .score-label { opacity: 0.8; margin: 0.5rem 0; }
    .progress-bar-mini { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin: 0.8rem 0; }
    .progress-fill-mini { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); border-radius: 4px; transition: width 0.3s; }
    .progress-text { font-size: 0.85rem; opacity: 0.7; }
    
    .badges-section h3, .history-section h3 { margin: 1.5rem 0 1rem; font-size: 1.1rem; }
    .badges-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 0.8rem; }
    .badge-card { background: var(--card-bg); padding: 1rem; border-radius: 12px; text-align: center; border: 2px solid rgba(255,255,255,0.1); transition: all 0.2s; }
    .badge-card.unlocked { border-color: var(--accent); background: rgba(16,185,129,0.1); }
    .badge-card.locked { opacity: 0.6; }
    .badge-icon { font-size: 1.5rem; margin-bottom: 0.3rem; }
    .badge-name { font-weight: 600; font-size: 0.9rem; }
    .badge-desc { font-size: 0.75rem; opacity: 0.7; margin-top: 0.3rem; }
    
    .history-list { display: flex; flex-direction: column; gap: 0.8rem; }
    .history-item { background: var(--card-bg); padding: 1rem; border-radius: 12px; border-left: 3px solid var(--primary); }
    .history-date { font-size: 0.8rem; opacity: 0.7; margin-bottom: 0.3rem; }
    .history-content { display: flex; justify-content: space-between; align-items: center; }
    .history-score { background: var(--primary); color: white; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
    
    .dash-actions { display: flex; gap: 0.8rem; margin-top: 2rem; }
    .btn-dash { flex: 1; padding: 0.8rem; background: var(--primary); color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: transform 0.1s; }
    .btn-dash:active { transform: scale(0.98); }
    .btn-dash.btn-outline { background: transparent; border: 2px solid rgba(255,255,255,0.3); color: var(--text); }
    
    @media (max-width: 480px) {
      .dash-actions { flex-direction: column; }
      .badges-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `;
  document.head.appendChild(style);
}
