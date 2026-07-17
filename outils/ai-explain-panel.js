/* ══════════════════════════════════════════════════
   AI-EXPLAIN-PANEL.JS — Avita Serena
   Panneau latéral d'explications cliente générées en direct pendant la
   consultation. Ajoute automatiquement un bouton "💬 Expliquer à la
   cliente" après chaque bloc .check-list de la page, et un panneau
   flottant qui accumule les explications générées.
   Dépend de AIClient (ai-client.js) — à inclure AVANT ce fichier.
   À déployer dans le même dossier que Questionnaire_de_consultation.html
   et Questionnaire_de_suivi.html.
══════════════════════════════════════════════════ */
const AIPanel = (function () {
  let entries = []; // { id, section, items:[{label,hint}], text, ts }
  let nextId = 1;

  const STYLE = `
  .ai-explain-btn{margin-top:10px;display:inline-flex;align-items:center;gap:6px;background:var(--or-clair,#E6F7F1);color:var(--or,#08805C);border:1px solid rgba(8,128,92,.25);border-radius:99px;padding:7px 15px;font-size:12px;font-weight:600;cursor:pointer;transition:.15s;font-family:'Inter',sans-serif}
  .ai-explain-btn:hover:not(:disabled){background:var(--or,#08805C);color:#fff}
  .ai-explain-btn.done{background:var(--or,#08805C);color:#fff;border-color:var(--or,#08805C)}
  .ai-explain-btn:disabled{opacity:.55;cursor:wait}
  #ai-panel-toggle{position:fixed;bottom:24px;right:24px;z-index:600;background:var(--ardoise,#101828);color:#fff;border:none;border-radius:99px;padding:14px 20px;font-size:13px;font-weight:600;font-family:'Inter',sans-serif;cursor:pointer;box-shadow:0 6px 20px rgba(16,24,40,.28);display:flex;align-items:center;gap:8px}
  #ai-panel-toggle .ai-badge{background:var(--or,#08805C);border-radius:99px;padding:2px 8px;font-size:11px;font-weight:700}
  #ai-panel{position:fixed;top:90px;right:24px;bottom:24px;width:370px;max-width:calc(100vw - 48px);background:#fff;border:1px solid var(--taupe,#EAECF0);border-radius:18px;box-shadow:0 16px 48px rgba(16,24,40,.22);z-index:601;display:none;flex-direction:column;overflow:hidden;font-family:'Inter',sans-serif}
  #ai-panel.open{display:flex}
  #ai-panel-hdr{padding:16px 18px;border-bottom:1px solid var(--taupe,#EAECF0);display:flex;align-items:center;justify-content:space-between;background:var(--off,#F7F8FA)}
  #ai-panel-hdr h4{font-size:13px;font-weight:700;color:var(--ardoise,#101828);margin:0}
  #ai-panel-close{background:none;border:none;font-size:16px;cursor:pointer;color:var(--gris,#98A2B3);line-height:1}
  #ai-key-box{padding:16px 18px;border-bottom:1px solid var(--taupe,#EAECF0);font-size:12px;color:var(--ardoise,#101828)}
  #ai-key-box input{width:100%;border:1px solid var(--taupe,#EAECF0);border-radius:8px;padding:9px 11px;font-size:12.5px;font-family:'DM Mono',monospace;margin:8px 0}
  #ai-key-box .ai-key-actions{display:flex;gap:8px}
  #ai-key-box button{background:var(--ardoise,#101828);color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;font-weight:600}
  #ai-key-status{margin-top:8px;font-size:11px}
  #ai-panel-body{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:12px}
  #ai-panel-empty{color:var(--gris,#98A2B3);font-size:13px;text-align:center;padding:40px 12px;line-height:1.6}
  .ai-entry{background:var(--off,#F7F8FA);border:1px solid var(--taupe,#EAECF0);border-radius:12px;padding:13px 15px}
  .ai-entry-sec{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--or,#08805C);font-weight:700;margin-bottom:7px}
  .ai-entry-txt{font-size:13px;line-height:1.7;color:var(--ardoise,#101828);white-space:pre-wrap}
  .ai-entry-acts{display:flex;gap:14px;margin-top:9px}
  .ai-entry-acts button{background:none;border:none;font-size:11px;color:var(--gris,#98A2B3);cursor:pointer;text-decoration:underline;font-family:'Inter',sans-serif;padding:0}
  .ai-entry-acts button:hover{color:var(--ardoise,#101828)}
  #ai-panel-footer{padding:12px 16px;border-top:1px solid var(--taupe,#EAECF0)}
  #ai-panel-footer button{width:100%;background:var(--ardoise,#101828);color:#fff;border:none;border-radius:99px;padding:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif}
  .ai-loading-txt{color:var(--gris,#98A2B3);font-style:italic;font-size:12.5px}
  `;

  function injectStyle() {
    if (document.getElementById('ai-panel-style')) return;
    const s = document.createElement('style');
    s.id = 'ai-panel-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function buildDom() {
    if (document.getElementById('ai-panel')) return;

    const toggle = document.createElement('button');
    toggle.id = 'ai-panel-toggle';
    toggle.innerHTML = '💬 Explications <span class="ai-badge" id="ai-badge">0</span>';
    toggle.onclick = togglePanel;
    document.body.appendChild(toggle);

    const panel = document.createElement('div');
    panel.id = 'ai-panel';
    panel.innerHTML = `
      <div id="ai-panel-hdr">
        <h4>💬 Explications pour la cliente</h4>
        <button id="ai-panel-close" onclick="AIPanel.close()">✕</button>
      </div>
      <div id="ai-key-box" style="display:none">
        <div>Entrez votre clé API Anthropic pour activer les explications en direct (mémorisée dans ce navigateur).</div>
        <input type="password" id="ai-key-input" placeholder="sk-ant-api03-…">
        <div class="ai-key-actions">
          <button onclick="AIPanel.saveKey()">Enregistrer</button>
        </div>
        <div id="ai-key-status"></div>
      </div>
      <div id="ai-panel-body">
        <div id="ai-panel-empty">Cochez des éléments dans le questionnaire, puis cliquez sur « 💬 Expliquer à la cliente » sous chaque section pour générer une explication claire à lui dire en direct.</div>
      </div>
      <div id="ai-panel-footer">
        <button onclick="AIPanel.copyAll()">📋 Copier toutes les explications</button>
      </div>`;
    document.body.appendChild(panel);
    refreshKeyBox();
  }

  function refreshKeyBox() {
    const box = document.getElementById('ai-key-box');
    if (!box) return;
    box.style.display = AIClient.hasKey() ? 'none' : 'block';
  }

  function saveKey() {
    const input = document.getElementById('ai-key-input');
    const status = document.getElementById('ai-key-status');
    if (AIClient.saveKey(input.value)) {
      status.innerHTML = '<span style="color:var(--or,#08805C)">✓ Clé enregistrée</span>';
      setTimeout(refreshKeyBox, 600);
    } else {
      status.innerHTML = '<span style="color:var(--rouge,#E4604C)">Clé invalide (doit commencer par sk-ant)</span>';
    }
  }

  function togglePanel() {
    const panel = document.getElementById('ai-panel');
    panel.classList.toggle('open');
  }
  function open() { document.getElementById('ai-panel').classList.add('open'); refreshKeyBox(); }
  function close() { document.getElementById('ai-panel').classList.remove('open'); }

  function updateBadge() {
    const b = document.getElementById('ai-badge');
    if (b) b.textContent = entries.length;
  }

  function render() {
    const body = document.getElementById('ai-panel-body');
    if (!body) return;
    if (!entries.length) {
      body.innerHTML = '<div id="ai-panel-empty">Cochez des éléments dans le questionnaire, puis cliquez sur « 💬 Expliquer à la cliente » sous chaque section pour générer une explication claire à lui dire en direct.</div>';
      updateBadge();
      return;
    }
    body.innerHTML = entries.map(e => `
      <div class="ai-entry" data-id="${e.id}">
        <div class="ai-entry-sec">${escHtml(e.section)}</div>
        <div class="ai-entry-txt">${escHtml(e.text)}</div>
        <div class="ai-entry-acts">
          <button onclick="AIPanel.regenerate(${e.id})">🔄 Régénérer</button>
          <button onclick="AIPanel.copyOne(${e.id})">📋 Copier</button>
          <button onclick="AIPanel.remove(${e.id})">✕ Retirer</button>
        </div>
      </div>`).join('');
    updateBadge();
  }

  function escHtml(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Récupère les items cochés + indices cliniques d'un bloc .check-list ──
  // Gère les deux structures existantes :
  //  - Questionnaire_de_consultation : .check-item > .ci-top > span  +  .check-item > .ci-why (sibling)
  //  - Questionnaire_de_suivi        : .check-item > div (texte + span.check-sub imbriqué)
  function collectChecked(checkListEl) {
    const items = [];
    checkListEl.querySelectorAll('.check-item.checked').forEach(ci => {
      const hintEl = ci.querySelector('.ci-why') || ci.querySelector('.check-sub');
      let label = '';
      const ciTop = ci.querySelector('.ci-top');
      if (ciTop) {
        const span = ciTop.querySelector('span');
        label = (span ? span.textContent : ciTop.textContent).trim();
      } else {
        const container = ci.querySelector('div:not(.cb)') || ci;
        const clone = container.cloneNode(true);
        const hintInClone = clone.querySelector('.check-sub') || clone.querySelector('.ci-why');
        if (hintInClone) hintInClone.remove();
        label = clone.textContent.trim();
      }
      const hint = hintEl ? hintEl.textContent.replace(/^→\s*/, '').trim() : '';
      items.push({ label, hint });
    });
    return items;
  }

  function sectionTitleFor(checkListEl) {
    const qcard = checkListEl.closest('.qcard');
    const qtext = qcard ? qcard.querySelector('.qtext') : null;
    return qtext ? qtext.textContent.trim() : 'Section';
  }

  function buildPrompt(sectionTitle, items) {
    const itemsTxt = items.map(it => '• ' + it.label + (it.hint ? ' (indice clinique : ' + it.hint + ')' : '')).join('\n');
    return `Tu es l'assistante clinique de Sabrina Castelli, naturopathe (Avita Serena, Porto-Vecchio). Sabrina est EN DIRECT en visio avec sa cliente et vient de cocher, dans la section "${sectionTitle}", les éléments suivants :

${itemsTxt}

Rédige l'explication que Sabrina peut dire ou paraphraser À VOIX HAUTE, MAINTENANT, à sa cliente. Format : 1 SEUL paragraphe compact de 4 à 6 phrases maximum (sans titres, sans numéros visibles), structuré ainsi :
1. Reformule ce qu'elle vit, dans des mots simples, sans jargon
2. Explique l'enchaînement logique de cause à effet dans son corps — un mécanisme clair et concret, jamais une liste plate de faits
3. Termine par 1 geste concret ou 1 repère immédiat, actionnable dès maintenant

Vouvoiement EXCLUSIF (vous, votre, vos), JAMAIS le tutoiement. Ton chaleureux, rassurant, normalisant — jamais alarmant.
VOCABULAIRE INTERDIT : "pathologie", "traitement", "diagnostic", "maladie", "guérir", "soigner", "cure", "thérapeutique", "prescrire", "symptômes".
Réponds UNIQUEMENT avec le paragraphe final, sans préambule, sans guillemets, sans markdown.`;
  }

  async function explainSection(btn) {
    const checkList = btn.previousElementSibling;
    if (!checkList || !checkList.classList || !checkList.classList.contains('check-list')) return;
    const items = collectChecked(checkList);
    if (!items.length) {
      alert('Cochez au moins un élément de cette section avant de générer une explication.');
      return;
    }
    if (!AIClient.hasKey()) {
      open();
      alert('Ajoutez d\'abord votre clé API Anthropic dans le panneau d\'explications (bouton 💬 en bas à droite).');
      return;
    }
    const sectionTitle = sectionTitleFor(checkList);
    btn.disabled = true;
    const originalTxt = btn.textContent;
    btn.textContent = '⏳ Génération…';
    try {
      const prompt = buildPrompt(sectionTitle, items);
      const text = await AIClient.generate(prompt, { maxTokens: 400 });
      const entry = { id: nextId++, section: sectionTitle, items, text, ts: Date.now(), checkListRef: checkList };
      entries.push(entry);
      render();
      open();
      btn.textContent = '✓ Expliqué · régénérer';
      btn.classList.add('done');
      btn.dataset.entryId = entry.id;
    } catch (e) {
      if (e.code === 'NO_API_KEY') {
        open();
      } else {
        alert('Erreur lors de la génération : ' + e.message);
      }
      btn.textContent = originalTxt;
    } finally {
      btn.disabled = false;
    }
  }

  async function regenerate(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    try {
      const prompt = buildPrompt(entry.section, entry.items);
      const text = await AIClient.generate(prompt, { maxTokens: 400 });
      entry.text = text;
      entry.ts = Date.now();
      render();
    } catch (e) {
      alert('Erreur lors de la régénération : ' + e.message);
    }
  }

  function remove(id) {
    entries = entries.filter(e => e.id !== id);
    render();
  }

  function copyOne(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    copyToClipboard(entry.text);
  }

  function copyAll() {
    if (!entries.length) return;
    const txt = entries.map(e => `— ${e.section} —\n${e.text}`).join('\n\n');
    copyToClipboard(txt);
  }

  function copyToClipboard(txt) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).catch(() => fallbackCopy(txt));
    } else {
      fallbackCopy(txt);
    }
  }
  function fallbackCopy(txt) {
    const ta = document.createElement('textarea');
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  // ── Injecte automatiquement un bouton après chaque .check-list ──
  function attachButtons() {
    document.querySelectorAll('.check-list').forEach(cl => {
      const next = cl.nextElementSibling;
      if (next && next.classList && next.classList.contains('ai-explain-btn')) return; // déjà présent
      const btn = document.createElement('button');
      btn.className = 'ai-explain-btn';
      btn.textContent = '💬 Expliquer à la cliente';
      btn.onclick = function () { explainSection(btn); };
      cl.insertAdjacentElement('afterend', btn);
    });
  }

  // ── Intégration avec la sauvegarde de session (pause / reprise) ──
  function getEntries() {
    return entries.map(({ id, section, items, text, ts }) => ({ id, section, items, text, ts }));
  }
  function setEntries(list) {
    entries = Array.isArray(list) ? list : [];
    nextId = entries.reduce((m, e) => Math.max(m, e.id || 0), 0) + 1;
    render();
  }

  function init() {
    injectStyle();
    buildDom();
    attachButtons();
    render();
  }

  return {
    init, open, close, saveKey, regenerate, remove, copyOne, copyAll,
    getEntries, setEntries, attachButtons
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  // Léger différé pour laisser le reste du DOM (auth-guard, sections) se construire.
  setTimeout(function () { AIPanel.init(); }, 300);
});
