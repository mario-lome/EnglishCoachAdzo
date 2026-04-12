// js/premium.js - Gestion Freemium ✅
console.log('🟢 premium.js: chargé');
window.Premium = {};

// 🎯 Vérifier si l'utilisateur est premium
window.Premium.isPremium = function() {
  return localStorage.getItem('eca_premium') === 'true';
};

// 🔓 Activer le premium (après paiement)
window.Premium.activate = function(code) {
  // Codes valides (à remplacer par un système backend plus tard)
  const validCodes = ['PREMIUM2024', 'EARLYBIRD', 'TEACHER2024'];
  if (validCodes.includes(code.toUpperCase())) {
    localStorage.setItem('eca_premium', 'true');
    localStorage.setItem('eca_premium_activated', new Date().toISOString());
    console.log('✅ Premium activé pour:', code);
    return true;
  }
  console.warn('❌ Code invalide:', code);
  return false;
};

// 🔒 Vérifier l'accès à une leçon
window.Premium.checkAccess = function(track, lessonIndex = 0) {
  if (track === 'kids') return true; // Toujours gratuit
  if (this.isPremium()) return true; // Premium = accès total
  return lessonIndex === 0; // Gratuit = seulement la 1ère leçon Pro/Méthode
};

// 🎨 Afficher l'écran de verrouillage
window.Premium.showLockScreen = function(container, track, lessonTitle) {
  const titles = { pro: '🏢 Pro', method: '📈 Méthode' };
  container.innerHTML = `
    <div class="premium-lock">
      <div class="lock-icon">🔒</div>
      <h3>Leçon Premium</h3>
      <p class="lock-title">${lessonTitle || titles[track] || 'Contenu exclusif'}</p>
      <p class="lock-desc">Débloque l'accès illimité à tous les modules professionnels.</p>
      
      <div class="premium-pricing">
        <div class="price-card">
          <div class="price-amount">3€<span class="price-period">/mois</span></div>
          <ul class="price-features">
            <li>✅ Toutes les leçons Pro & Méthode</li>
            <li>✅ Mises à jour incluses</li>
            <li>✅ Annulable anytime</li>
          </ul>
          <button class="btn-premium" id="btn-subscribe">S'abonner maintenant ✨</button>
        </div>
        <div class="price-card price-lifetime">
          <div class="price-amount">25€<span class="price-period">à vie</span></div>
          <ul class="price-features">
            <li>✅ Tout illimité, pour toujours</li>
            <li>✅ Support prioritaire</li>
            <li>✅ Packs exclusifs offerts</li>
          </ul>
          <button class="btn-premium btn-outline" id="btn-lifetime">Acheter à vie 🎁</button>
        </div>
      </div>
      
      <div class="premium-activate">
        <p style="font-size:0.9rem;opacity:0.8;margin-bottom:0.5rem;">Déjà un code ?</p>
        <div style="display:flex;gap:0.5rem;">
          <input type="text" id="premium-code" placeholder="EX: PREMIUM2024" style="flex:1;padding:0.6rem;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:var(--text);">
          <button class="btn-premium btn-small" id="btn-activate-code">Activer</button>
        </div>
        <div id="activate-msg" style="font-size:0.85rem;margin-top:0.5rem;"></div>
      </div>
      
      <p class="lock-footer">Paiement sécurisé • Données stockées localement • Annulable anytime</p>
    </div>
  `;
  
  // Gestion des boutons
  document.getElementById('btn-subscribe').onclick = () => {
    window.open('https://buy.stripe.com/TON_LIEN_STRIPE_MENSUEL', '_blank');
  };
  document.getElementById('btn-lifetime').onclick = () => {
    window.open('https://buy.stripe.com/TON_LIEN_STRIPE_LIFETIME', '_blank');
  };
  document.getElementById('btn-activate-code').onclick = () => {
    const code = document.getElementById('premium-code').value.trim();
    const msg = document.getElementById('activate-msg');
    if (window.Premium.activate(code)) {
      msg.textContent = '✅ Premium activé ! Rechargement...';
      msg.style.color = '#10b981';
      setTimeout(() => location.reload(), 1500);
    } else {
      msg.textContent = '❌ Code invalide. Vérifie ou contacte-nous.';
      msg.style.color = '#ef4444';
    }
  };
};

// 🎨 Injecter le CSS Premium si absent
if (!document.getElementById('premium-css')) {
  const style = document.createElement('style');
  style.id = 'premium-css';
  style.textContent = `
    .premium-lock { text-align: center; padding: 2rem 1rem; max-width: 500px; margin: 0 auto; }
    .lock-icon { font-size: 4rem; margin-bottom: 1rem; }
    .lock-title { font-size: 1.3rem; font-weight: 700; margin: 0.5rem 0; }
    .lock-desc { opacity: 0.8; margin-bottom: 1.5rem; }
    
    .premium-pricing { display: grid; grid-template-columns: 1fr; gap: 1rem; margin: 1.5rem 0; }
    @media (min-width: 600px) { .premium-pricing { grid-template-columns: 1fr 1fr; } }
    
    .price-card { background: var(--card-bg); padding: 1.5rem; border-radius: 16px; border: 2px solid rgba(255,255,255,0.1); }
    .price-card.price-lifetime { border-color: var(--accent); background: rgba(16,185,129,0.05); }
    
    .price-amount { font-size: 2rem; font-weight: 800; color: var(--primary); }
    .price-period { font-size: 1rem; font-weight: 400; opacity: 0.7; }
    
    .price-features { list-style: none; padding: 0; margin: 1rem 0; text-align: left; }
    .price-features li { padding: 0.3rem 0; font-size: 0.9rem; opacity: 0.9; }
    
    .btn-premium { width: 100%; padding: 0.8rem; background: var(--primary); color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; margin-top: 0.5rem; transition: transform 0.1s; }
    .btn-premium:active { transform: scale(0.98); }
    .btn-premium.btn-outline { background: transparent; border: 2px solid var(--accent); color: var(--accent); }
    .btn-premium.btn-small { padding: 0.6rem 1rem; width: auto; }
    
    .premium-activate { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
    .lock-footer { font-size: 0.75rem; opacity: 0.6; margin-top: 2rem; }
  `;
  document.head.appendChild(style);
}
