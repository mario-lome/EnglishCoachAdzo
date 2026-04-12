// js/premium.js - Version Minimaliste & Garantie ✅
console.log('🟢 premium.js: chargé');

// 🎯 Objet global Premium (exposé immédiatement)
window.Premium = {
  // Vérifier si premium est activé
  isPremium: function() {
    return localStorage.getItem('eca_premium') === 'true';
  },
  
  // Activer avec un code
  activate: function(code) {
    const valid = ['PREMIUM2024', 'EARLYBIRD', 'TEST123'];
    if (valid.includes(code.trim().toUpperCase())) {
      localStorage.setItem('eca_premium', 'true');
      return true;
    }
    return false;
  },
  
  // Vérifier l'accès à une leçon
  checkAccess: function(track, lessonIndex) {
    if (track === 'kids') return true;
    if (this.isPremium()) return true;
    return lessonIndex === 0; // 1ère leçon gratuite
  },
  
  // Afficher l'écran de verrouillage (SIMPLIFIÉ)
  showLockScreen: function(container, track, lessonTitle) {
    console.log('🔒 showLockScreen appelé pour:', track, lessonTitle);
    
    container.innerHTML = `
      <div style="text-align:center;padding:2rem;max-width:400px;margin:0 auto;">
        <div style="font-size:4rem;margin-bottom:1rem;">🔒</div>
        <h3 style="margin-bottom:0.5rem;">Contenu Premium</h3>
        <p style="opacity:0.8;margin-bottom:1.5rem;">${lessonTitle || 'Leçon professionnelle'}</p>
        
        <div style="background:rgba(67,97,238,0.1);padding:1rem;border-radius:12px;margin-bottom:1.5rem;">
          <div style="font-size:1.5rem;font-weight:bold;color:var(--primary);">3€<span style="font-size:1rem;opacity:0.7">/mois</span></div>
          <p style="font-size:0.9rem;opacity:0.9;margin:0.5rem 0;">✅ Toutes les leçons débloquées<br>✅ Mises à jour incluses<br>✅ Annulable anytime</p>
        </div>
        
        <button id="premium-buy" style="width:100%;padding:0.8rem;background:var(--primary);color:white;border:none;border-radius:12px;font-weight:600;cursor:pointer;margin-bottom:1rem;">
          S'abonner maintenant ✨
        </button>
        
        <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:1rem;">
          <p style="font-size:0.9rem;margin-bottom:0.5rem;">Déjà un code ?</p>
          <div style="display:flex;gap:0.5rem;">
            <input type="text" id="premium-code" placeholder="EX: PREMIUM2024" style="flex:1;padding:0.6rem;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:var(--text);">
            <button id="premium-activate" style="padding:0.6rem 1rem;background:var(--accent);color:white;border:none;border-radius:8px;cursor:pointer;">OK</button>
          </div>
          <div id="premium-msg" style="font-size:0.85rem;margin-top:0.5rem;"></div>
        </div>
      </div>
    `;
    
    // Gestion des boutons (avec logs pour debug)
    document.getElementById('premium-buy').onclick = function() {
      console.log('🛒 Bouton achat cliqué');
      alert('🔗 Lien de paiement : https://buy.stripe.com/TON_LIEN');
    };
    
    document.getElementById('premium-activate').onclick = function() {
      const code = document.getElementById('premium-code').value;
      const msg = document.getElementById('premium-msg');
      console.log('🔑 Code entré:', code);
      
      if (window.Premium.activate(code)) {
        msg.textContent = '✅ Activé ! Rechargement...';
        msg.style.color = '#10b981';
        setTimeout(() => location.reload(), 1000);
      } else {
        msg.textContent = '❌ Code invalide';
        msg.style.color = '#ef4444';
      }
    };
  }
};
