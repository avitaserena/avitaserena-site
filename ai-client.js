/* ══════════════════════════════════════════════════
   AI-CLIENT.JS — A Vita Serena
   Module partagé d'appel à l'IA (Anthropic).
   Chargé par : generateur.html, Questionnaire_de_consultation.html,
   Questionnaire_de_suivi.html (seul le générateur l'utilise réellement).
   À déployer dans le même dossier que ces fichiers (référencé en relatif,
   comme auth-guard.js) — donc à la racine ET dans /outils/ si besoin.

   REFONTE SÉCURITÉ (24/09/2026) — solution mixte validée par Sabrina :
   1. PAR DÉFAUT, les appels passent par le relais sécurisé Supabase « crm-proxy » :
      la clé Anthropic reste sur le serveur (secret ANTHROPIC_API_KEY) et seule
      la praticienne connectée peut l'utiliser. Aucune clé dans le navigateur.
      Limite : le relais (offre Supabase gratuite) coupe au bout de 150 s →
      réservé aux réponses courtes (bilans, interprétations : ~3 000 tokens).
   2. AVEC { direct: true } (génération du PHV uniquement, jusqu'à 32 000 tokens,
      plusieurs minutes) : appel direct avec une CLÉ DÉDIÉE ET PLAFONNÉE
      (espace de travail Anthropic « Générateur PHV » avec limite de dépenses).
      Si elle fuitait, la perte maximale serait ce plafond.
   Les anciennes clés locales (avita_api_key, avs_akey — clé principale du compte)
   sont effacées de ce navigateur au chargement.
══════════════════════════════════════════════════ */
const AIClient = (function () {
  const KEY_STORAGE = 'avita_phv_key';            // clé PHV plafonnée (seule clé locale restante)
  const OLD_KEYS = ['avita_api_key', 'avs_akey']; // anciennes clés principales, à ne plus garder
  const SUPA_URL_RELAIS = 'https://bqhkdndwldwqacrrbbig.supabase.co';
  const SUPA_ANON_RELAIS = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxaGtkbmR3bGR3cWFjcnJiYmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzAyNTIsImV4cCI6MjA5NjMwNjI1Mn0.nH2UktMAVKYwng4L3SvW5F0fluV_sObGV0f3Mk1dnOY';
  const RELAIS_TIMEOUT_MS = 145000;               // juste sous la coupure serveur de 150 s
  const DEFAULT_MODEL = 'claude-sonnet-4-5';

  // Nettoyage unique des anciennes clés principales stockées en clair
  try {
    OLD_KEYS.forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
  } catch (e) {}

  function erreur(message, code, status) {
    const err = new Error(message);
    err.code = code;
    if (status != null) err.status = status;
    return err;
  }

  // ── Clé PHV plafonnée (appels directs uniquement) ──
  function getKey() {
    try { return localStorage.getItem(KEY_STORAGE) || ''; }
    catch (e) { return ''; }
  }
  function hasKey() { return !!getKey(); }
  function saveKey(k) {
    const key = (k || '').trim();
    if (!key.startsWith('sk-ant')) return false;
    try { localStorage.setItem(KEY_STORAGE, key); return true; }
    catch (e) { return false; }
  }
  function clearKey() {
    try { localStorage.removeItem(KEY_STORAGE); } catch (e) {}
  }

  function corpsRequete(promptText, opts) {
    return {
      model: opts.model || DEFAULT_MODEL,
      max_tokens: opts.maxTokens || 600,
      messages: [{ role: 'user', content: promptText }]
    };
  }
  function extraireTexte(data) {
    const block = ((data && data.content) || []).find(b => b.type === 'text');
    return block ? block.text.trim() : '';
  }

  // ── Voie 1 : relais sécurisé (par défaut) ──
  async function viaRelais(promptText, opts) {
    let token = SUPA_ANON_RELAIS;
    if (typeof Auth !== 'undefined' && Auth.getValidAccessToken) {
      try { const t = await Auth.getValidAccessToken(); if (t) token = t; } catch (e) {}
    }
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), RELAIS_TIMEOUT_MS) : null;
    let res;
    try {
      res = await fetch(SUPA_URL_RELAIS + '/functions/v1/crm-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPA_ANON_RELAIS, 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ service: 'anthropic', payload: corpsRequete(promptText, opts) }),
        signal: ctrl ? ctrl.signal : undefined
      });
    } catch (e) {
      if (e && e.name === 'AbortError') throw erreur('La réponse a pris trop de temps (plus de 2 min 30) — réessayez.', 'TIMEOUT');
      throw erreur('Connexion au relais impossible — vérifiez votre connexion internet.', 'NETWORK');
    } finally {
      if (timer) clearTimeout(timer);
    }
    if (!res.ok) {
      let msg = '';
      try { const j = await res.json(); msg = (j.error && (j.error.message || j.error)) || j.message || ''; } catch (e) {}
      if (res.status === 401 || res.status === 403) throw erreur('Session expirée ou accès refusé — reconnectez-vous puis réessayez.', 'AUTH', res.status);
      if (res.status === 546 || res.status === 504) throw erreur('Le relais a été coupé avant la fin de la réponse (limite de 150 s) — réessayez.', 'TIMEOUT', res.status);
      throw erreur('Erreur API (' + res.status + ')' + (msg ? ' ' + msg : ''), 'API_ERROR', res.status);
    }
    return extraireTexte(await res.json());
  }

  // ── Voie 2 : appel direct avec la clé PHV plafonnée ({ direct: true }) ──
  async function direct(promptText, opts) {
    const key = getKey();
    if (!key) throw erreur('Clé PHV plafonnée manquante — enregistrez-la en haut de la page.', 'NO_API_KEY');
    let res;
    try {
      res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify(corpsRequete(promptText, opts))
      });
    } catch (e) {
      throw erreur('Connexion à Anthropic impossible — vérifiez votre connexion internet.', 'NETWORK');
    }
    if (!res.ok) {
      let bodyTxt = '';
      try { bodyTxt = await res.text(); } catch (e) {}
      if (res.status === 401) throw erreur('Clé PHV refusée par Anthropic (révoquée ou erronée) — enregistrez-en une nouvelle.', 'API_ERROR', 401);
      if (/spend|billing|credit|limit/i.test(bodyTxt) && (res.status === 400 || res.status === 403 || res.status === 429))
        throw erreur('Plafond de dépenses de la clé PHV atteint — augmentez-le dans la console Anthropic.', 'API_ERROR', res.status);
      throw erreur('Erreur API (' + res.status + ') ' + bodyTxt, 'API_ERROR', res.status);
    }
    return extraireTexte(await res.json());
  }

  // Retourne le texte généré (string). Lève une erreur avec .code =
  // 'NO_API_KEY' | 'AUTH' | 'TIMEOUT' | 'NETWORK' | 'API_ERROR'.
  async function generate(promptText, opts) {
    opts = opts || {};
    return opts.direct ? direct(promptText, opts) : viaRelais(promptText, opts);
  }

  return { getKey, hasKey, saveKey, clearKey, generate };
})();
