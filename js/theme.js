// js/theme.js - Gestionnaire de thème (Dark/Light) ✅
console.log('🟢 theme.js: chargé');

const ThemeManager = {
  init: function() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    
    // Charger le thème sauvegardé ou détecter la préférence système
    const saved = localStorage.getItem('eca_theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (systemDark ? 'dark' : 'light');
    
    this.apply(theme);
    this.updateIcon(theme);
    
    // Événement clic
    toggle.addEventListener('click', () => {
      const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      this.apply(newTheme);
      this.updateIcon(newTheme);
      localStorage.setItem('eca_theme', newTheme);
      
      // Micro-vibration si disponible
      if (navigator.vibrate) navigator.vibrate(10);
    });
    
    // Écouter les changements système en temps réel
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('eca_theme')) {
        this.apply(e.matches ? 'dark' : 'light');
        this.updateIcon(e.matches ? 'dark' : 'light');
      }
    });
  },
  
  apply: function(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    // Mise à jour meta theme-color pour la barre d'état mobile
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#0f172a' : '#4361ee');
    }
  },
  
  updateIcon: function(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
