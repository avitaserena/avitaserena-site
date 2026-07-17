/* ══════════════════════════════════════════════════
   AI-CLIENT.JS — Avita Serena
   Module partagé : clé API Anthropic (stockage local) + appel de génération.
   Utilisé par : generateur.html, Questionnaire_de_consultation.html,
   Questionnaire_de_suivi.html.
   À déployer dans le même dossier que ces fichiers (référencé en relatif,
   comme auth-guard.js) — donc à la racine ET dans /outils/ si besoin.
══════════════════════════════════════════════════ */
const AIClient = (function () {
  const KEY_STORAGE = 'avita_api_key';

  function getKey() {
    try { return localStorage.getItem(KEY_STORAGE) || ''; }
    catch (e) { return ''; }
  }

  function hasKey() {
    return !!getKey();
  }

  function saveKey(k) {
    const key = (k || '').trim();
    if (!key.startsWith('sk-ant')) return false;
    try { localStorage.setItem(KEY_STORAGE, key); return true; }
    catch (e) { return false; }
  }

  function clearKey() {
    try { localStorage.removeItem(KEY_STORAGE); } catch (e) {}
  }

  // Appel générique au endpoint Messages. Retourne le texte généré (string).
  // Lève une erreur avec .code = 'NO_API_KEY' | 'API_ERROR' en cas d'échec.
  async function generate(promptText, opts) {
    opts = opts || {};
    const key = getKey();
    if (!key) {
      const err = new Error('Clé API Anthropic manquante.');
      err.code = 'NO_API_KEY';
      throw err;
    }
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: opts.model || 'claude-sonnet-4-5',
        max_tokens: opts.maxTokens || 600,
        messages: [{ role: 'user', content: promptText }]
      })
    });
    if (!res.ok) {
      let bodyTxt = '';
      try { bodyTxt = await res.text(); } catch (e) {}
      const err = new Error('Erreur API (' + res.status + ') ' + bodyTxt);
      err.code = 'API_ERROR';
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    const block = (data.content || []).find(b => b.type === 'text');
    return block ? block.text.trim() : '';
  }

  return { getKey, hasKey, saveKey, clearKey, generate };
})();
