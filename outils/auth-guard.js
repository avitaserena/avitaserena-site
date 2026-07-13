/* ═══════════════════════════════════════════════════════════
   A Vita Serena — auth-guard.js
   Authentification par lien magique (Supabase Auth), partagée
   entre tous les outils (praticienne) et l'espace clientes.
   Inclure APRÈS supabase-db.js (ou avant, l'ordre n'importe pas,
   mais AVANT tout code qui appelle DB.* / sb()).
   ═══════════════════════════════════════════════════════════ */

const AUTH_STORAGE_KEY = 'avs_auth_session';

const Auth = {

  /* ── Demander un lien magique ── */
  async requestMagicLink(email, redirectTo) {
    const res = await fetch(SUPA_URL + '/auth/v1/otp', {
      method: 'POST',
      headers: { 'apikey': SUPA_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, create_user: true, options: { email_redirect_to: redirectTo || window.location.href.split('#')[0] } })
    });
    if (!res.ok) throw new Error('Échec de l\'envoi du lien : ' + (await res.text()));
    return true;
  },

  /* ── Récupérer les tokens depuis le hash d'URL après clic sur le lien ── */
  handleRedirect() {
    if (!window.location.hash || window.location.hash.indexOf('access_token') === -1) return false;
    const params = new URLSearchParams(window.location.hash.substring(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const expires_in = parseInt(params.get('expires_in') || '3600', 10);
    if (!access_token) return false;

    const session = {
      access_token,
      refresh_token,
      expires_at: Date.now() + expires_in * 1000
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

    // Nettoyer l'URL (retirer le hash contenant les tokens)
    history.replaceState(null, '', window.location.pathname + window.location.search);
    return true;
  },

  getSession() {
    try { return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null'); }
    catch(e) { return null; }
  },

  /* ── Renvoie un access_token valide, en le rafraîchissant si besoin ── */
  async getValidAccessToken() {
    const session = this.getSession();
    if (!session) return null;

    if (Date.now() < session.expires_at - 30000) return session.access_token;

    // Token expiré ou proche de l'expiration → rafraîchir
    try {
      const res = await fetch(SUPA_URL + '/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        headers: { 'apikey': SUPA_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token })
      });
      if (!res.ok) throw new Error('refresh failed');
      const data = await res.json();
      const newSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (data.expires_in || 3600) * 1000
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
      return newSession.access_token;
    } catch(e) {
      this.logout();
      return null;
    }
  },

  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  isLoggedIn() {
    return !!this.getSession();
  }
};

/* ── Écran de connexion réutilisable (overlay plein écran) ──
   appelPar : "praticienne" ou "cliente" — change juste le texte affiché.
   onSuccess : callback appelé une fois la session confirmée valide. */
function showAuthGate(profil, onSuccess) {
  Auth.handleRedirect();

  if (Auth.isLoggedIn()) {
    onSuccess();
    return;
  }

  const isPraticienne = profil === 'praticienne';
  const overlay = document.createElement('div');
  overlay.id = 'auth-gate-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#1E1E1C;display:flex;align-items:center;justify-content:center;padding:24px;font-family:"Be Vietnam Pro",Arial,sans-serif';
  overlay.innerHTML = `
    <div style="max-width:380px;width:100%;background:#F7F6F4;border-radius:16px;padding:40px 32px;text-align:center">
      <div style="font-family:Georgia,serif;font-size:22px;font-style:italic;color:#1E1E1C;margin-bottom:8px">A Vita Serena</div>
      <p style="font-size:13px;color:#6B6560;margin-bottom:24px">${isPraticienne ? 'Connexion praticienne' : 'Connectez-vous pour accéder à votre espace'}</p>
      <input id="auth-email-input" type="email" placeholder="Votre email" style="width:100%;padding:12px 14px;border:1px solid #D5CFC6;border-radius:8px;font-size:14px;margin-bottom:12px;box-sizing:border-box">
      <button id="auth-submit-btn" style="width:100%;background:#1E1E1C;color:#fff;border:none;padding:13px;border-radius:99px;font-size:13px;font-weight:600;cursor:pointer">Recevoir un lien de connexion →</button>
      <p id="auth-status-msg" style="font-size:12px;color:#6B6560;margin-top:16px;line-height:1.6"></p>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('auth-submit-btn').onclick = async () => {
    const email = document.getElementById('auth-email-input').value.trim();
    const btn = document.getElementById('auth-submit-btn');
    const msg = document.getElementById('auth-status-msg');
    if (!email) { msg.textContent = 'Merci de renseigner un email.'; msg.style.color = '#C0392B'; return; }
    btn.disabled = true; btn.textContent = 'Envoi…';
    try {
      await Auth.requestMagicLink(email);
      msg.style.color = '#3D6B2C';
      msg.textContent = 'Lien envoyé ! Vérifiez votre boîte mail et cliquez sur le lien pour continuer.';
      btn.textContent = 'Lien envoyé ✓';
    } catch(e) {
      msg.style.color = '#C0392B';
      msg.textContent = "Erreur : impossible d'envoyer le lien. Réessayez.";
      btn.disabled = false; btn.textContent = 'Recevoir un lien de connexion →';
      console.error(e);
    }
  };
}

function removeAuthGate() {
  const el = document.getElementById('auth-gate-overlay');
  if (el) el.remove();
}
