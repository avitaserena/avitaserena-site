// ═══════════════════════════════════════════════════
// MODALE LISTE D'ATTENTE — A Vita Serena
// Script universel — chargé sur toutes les pages
// ═══════════════════════════════════════════════════
(function(){

// ── Styles ──
const css = `
#avs-modal-overlay{
  position:fixed;inset:0;z-index:9999;
  background:rgba(30,30,28,.55);
  backdrop-filter:blur(6px);
  display:none;align-items:center;justify-content:center;
  padding:20px;
}
#avs-modal-overlay.open{display:flex}
#avs-modal{
  background:#fff;
  border-radius:24px;
  width:100%;max-width:480px;
  max-height:92vh;overflow-y:auto;
  box-shadow:0 20px 60px rgba(30,30,28,.22);
  animation:avsMIn .25s cubic-bezier(.34,1.3,.64,1);
  position:relative;
}
@keyframes avsMIn{from{opacity:0;transform:scale(.93) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}

/* Header */
#avs-modal-head{
  background:linear-gradient(160deg,#1E1E1C 0%,#2C2C2A 100%);
  border-radius:24px 24px 0 0;
  padding:28px 28px 24px;
  position:relative;overflow:hidden;
}
#avs-modal-head::before{
  content:'';position:absolute;top:-80px;right:-80px;
  width:220px;height:220px;border-radius:50%;
  background:radial-gradient(circle,rgba(180,144,106,.12) 0%,transparent 70%);
}
.avs-head-eyebrow{
  font-size:9px;font-weight:700;letter-spacing:.2em;
  text-transform:uppercase;color:rgba(196,169,125,.6);
  margin-bottom:8px;font-family:'Be Vietnam Pro',system-ui,sans-serif;
}
.avs-head-title{
  font-family:'Cormorant Garamond',Georgia,serif;
  font-size:26px;font-weight:300;font-style:italic;
  color:#fff;line-height:1.2;margin-bottom:8px;
}
.avs-head-title strong{
  font-style:normal;font-weight:400;color:#C4A882;display:block;
}
.avs-head-sub{
  font-size:12px;color:rgba(255,255,255,.45);
  font-family:'Be Vietnam Pro',system-ui,sans-serif;
  line-height:1.6;
}
.avs-close{
  position:absolute;top:16px;right:16px;
  width:28px;height:28px;border-radius:8px;
  background:rgba(255,255,255,.08);border:none;cursor:pointer;
  color:rgba(255,255,255,.4);font-size:18px;line-height:1;
  display:flex;align-items:center;justify-content:center;
  transition:all .2s;z-index:2;
}
.avs-close:hover{background:rgba(255,255,255,.15);color:#fff}

/* Corps */
#avs-modal-body{padding:24px 28px 28px}

/* Choix prestation */
.avs-presta-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
.avs-presta{
  padding:14px;border:1.5px solid #E8E4DC;border-radius:14px;
  cursor:pointer;transition:all .2s;background:#fff;
  font-family:'Be Vietnam Pro',system-ui,sans-serif;
}
.avs-presta:hover{border-color:#C4A882}
.avs-presta.selected{border-color:#B4906A;background:rgba(180,144,106,.06)}
.avs-presta-name{font-size:13px;font-weight:700;color:#1E1E1C;margin-bottom:3px}
.avs-presta-detail{font-size:11px;color:#8B7B6A;line-height:1.4}
.avs-presta-prix{font-size:14px;font-weight:700;color:#B4906A;margin-top:7px}

/* Champs */
.avs-field{margin-bottom:14px}
.avs-field label{
  display:block;font-size:10px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;
  color:#8B7B6A;margin-bottom:5px;
  font-family:'Be Vietnam Pro',system-ui,sans-serif;
}
.avs-field input,.avs-field select,.avs-field textarea{
  width:100%;padding:11px 14px;
  border:1.5px solid #E8E4DC;border-radius:10px;
  font-family:'Be Vietnam Pro',system-ui,sans-serif;
  font-size:14px;color:#1E1E1C;background:#fff;
  outline:none;transition:border .2s;
}
.avs-field input:focus,.avs-field select:focus,.avs-field textarea:focus{
  border-color:#B4906A;box-shadow:0 0 0 3px rgba(180,144,106,.1);
}
.avs-field textarea{resize:none;height:80px;line-height:1.6}
.avs-g2{display:grid;grid-template-columns:1fr 1fr;gap:11px}

/* Note */
.avs-note{
  background:#F7F6F4;border-radius:10px;
  padding:12px 14px;margin-bottom:18px;
  font-size:12px;color:#8B7B6A;line-height:1.65;
  font-family:'Be Vietnam Pro',system-ui,sans-serif;
}
.avs-note strong{color:#1E1E1C}

/* Bouton */
.avs-btn{
  width:100%;padding:14px 20px;
  background:linear-gradient(135deg,#B4906A,#9B7230);
  color:#fff;border:none;border-radius:99px;
  font-family:'Be Vietnam Pro',system-ui,sans-serif;
  font-size:13px;font-weight:700;letter-spacing:.06em;
  cursor:pointer;transition:all .25s;
  box-shadow:0 4px 16px rgba(180,144,106,.3);
}
.avs-btn:hover{background:linear-gradient(135deg,#9B7230,#7A5500);transform:translateY(-1px);box-shadow:0 6px 22px rgba(180,144,106,.42)}
.avs-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}

/* Succès */
#avs-success{display:none;text-align:center;padding:20px 0}
.avs-success-icon{font-size:48px;margin-bottom:16px}
.avs-success-title{
  font-family:'Cormorant Garamond',Georgia,serif;
  font-size:26px;font-weight:300;font-style:italic;
  color:#1E1E1C;margin-bottom:12px;line-height:1.2;
}
.avs-success-sub{font-size:14px;color:#6B6560;line-height:1.75;max-width:340px;margin:0 auto 20px}
.avs-success-steps{
  background:#F7F6F4;border-radius:12px;padding:16px 18px;
  text-align:left;margin-bottom:20px;
}
.avs-step-item{
  font-size:12px;color:#6B6560;padding:5px 0;
  display:flex;gap:9px;align-items:flex-start;
  font-family:'Be Vietnam Pro',system-ui,sans-serif;
  border-bottom:1px solid #EDE9E1;line-height:1.5;
}
.avs-step-item:last-child{border:none}
.avs-step-icon{font-size:14px;flex-shrink:0;margin-top:1px}
.avs-close-btn{
  padding:10px 28px;border:1.5px solid #D5CFC6;border-radius:99px;
  background:#fff;color:#6B6560;
  font-family:'Be Vietnam Pro',system-ui,sans-serif;
  font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;
}
.avs-close-btn:hover{border-color:#B4906A;color:#B4906A}

/* Erreur */
.avs-error{
  background:#FFF0ED;border:1px solid rgba(226,68,92,.2);
  border-radius:8px;padding:10px 14px;margin-bottom:14px;
  font-size:12px;color:#B83232;display:none;
  font-family:'Be Vietnam Pro',system-ui,sans-serif;
}

@media(max-width:560px){
  #avs-modal{border-radius:20px}
  #avs-modal-head{border-radius:20px 20px 0 0;padding:22px 20px 18px}
  #avs-modal-body{padding:18px 20px 22px}
  .avs-presta-grid{grid-template-columns:1fr}
  .avs-g2{grid-template-columns:1fr}
}
`;

// ── Injecter CSS ──
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

// ── Injecter HTML ──
const html = `
<div id="avs-modal-overlay">
  <div id="avs-modal" role="dialog" aria-modal="true" aria-label="Rejoindre la liste d'attente">

    <div id="avs-modal-head">
      <button class="avs-close" onclick="AVS.close()" aria-label="Fermer">×</button>
      <div class="avs-head-eyebrow">A Vita Serena · Ouverture 15 septembre 2026</div>
      <div class="avs-head-title">Réservez votre<br><strong>place en priorité.</strong></div>
      <div class="avs-head-sub">Inscrivez-vous maintenant pour être contactée en priorité. <strong style="color:#C4A882">Aucun paiement demandé avant août.</strong></div>
    </div>

    <div id="avs-modal-body">
      <div id="avs-form-wrap">

        <!-- Choix prestation -->
        <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8B7B6A;margin-bottom:10px;font-family:'Be Vietnam Pro',system-ui,sans-serif">Ce qui vous intéresse</div>
        <div class="avs-presta-grid">
          <div class="avs-presta" id="avs-p-bilan" onclick="AVS.selectPresta('bilan',this)">
            <div class="avs-presta-name">Bilan de vitalité</div>
            <div class="avs-presta-detail">Première consultation · 90 min · Anamnèse complète + protocole personnalisé</div>
            <div class="avs-presta-prix">90 €</div>
          </div>
          <div class="avs-presta" id="avs-p-suivi" onclick="AVS.selectPresta('suivi',this)">
            <div class="avs-presta-name">Consultation de suivi</div>
            <div class="avs-presta-detail">Pour clientes existantes · 60 min · Ajustement du protocole</div>
            <div class="avs-presta-prix">65 €</div>
          </div>
          <div class="avs-presta" id="avs-p-alba" onclick="AVS.selectPresta('alba',this)">
            <div class="avs-presta-name">Parcours Alba</div>
            <div class="avs-presta-detail">3 mois · Bilan + 2 suivis + protocole évolutif</div>
            <div class="avs-presta-prix">320 €</div>
          </div>
          <div class="avs-presta" id="avs-p-aria" onclick="AVS.selectPresta('aria',this)">
            <div class="avs-presta-name">Parcours Aria ✦</div>
            <div class="avs-presta-detail">6 mois · Le plus choisi · SIBO, hormones, terrain complexe</div>
            <div class="avs-presta-prix">560 €</div>
          </div>
        </div>

        <!-- Infos -->
        <div class="avs-g2">
          <div class="avs-field">
            <label>Prénom *</label>
            <input type="text" id="avs-prenom" placeholder="Marie" autocomplete="given-name">
          </div>
          <div class="avs-field">
            <label>Nom *</label>
            <input type="text" id="avs-nom" placeholder="Dupont" autocomplete="family-name">
          </div>
        </div>
        <div class="avs-field">
          <label>Email *</label>
          <input type="email" id="avs-email" placeholder="marie@email.com" autocomplete="email">
        </div>
        <div class="avs-field">
          <label>Motif principal (optionnel)</label>
          <textarea id="avs-motif" placeholder="Ex : ballonnements chroniques, SIBO suspecté, SPM intense..."></textarea>
        </div>

        <div class="avs-note">
          <strong>Ce qui se passe ensuite :</strong> Sabrina vous contacte personnellement sous 48h pour confirmer votre place. Le paiement ne sera demandé qu'à partir de fin août — aucun engagement financier aujourd'hui.
        </div>

        <div class="avs-error" id="avs-error"></div>

        <button class="avs-btn" id="avs-submit" onclick="AVS.submit()">
          Rejoindre la liste prioritaire →
        </button>

      </div>

      <div id="avs-success">
        <div class="avs-success-icon">🌿</div>
        <div class="avs-success-title">Votre place est<br>réservée.</div>
        <div class="avs-success-sub">Sabrina vous contacte personnellement sous 48h pour confirmer votre créneau.</div>
        <div class="avs-success-steps">
          <div class="avs-step-item"><span class="avs-step-icon">✉️</span><span>Un email de confirmation va vous parvenir dans quelques minutes</span></div>
          <div class="avs-step-item"><span class="avs-step-icon">📞</span><span>Sabrina vous contacte sous 48h pour fixer le créneau ensemble</span></div>
          <div class="avs-step-item"><span class="avs-step-icon">📋</span><span>Un questionnaire de préparation vous sera envoyé avant la séance</span></div>
          <div class="avs-step-item"><span class="avs-step-icon">🔒</span><span>Lien de paiement Stripe envoyé à partir de fin août — aucun engagement aujourd'hui</span></div>
        </div>
        <button class="avs-close-btn" onclick="AVS.close()">Fermer</button>
      </div>
    </div>

  </div>
</div>`;

document.body.insertAdjacentHTML('beforeend', html);

// ── Fermer au clic overlay ──
document.getElementById('avs-modal-overlay').addEventListener('click', function(e){
  if(e.target === this) AVS.close();
});

// ── Fermer au clavier Escape ──
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape') AVS.close();
});

// ── Logique ──
const FORMSPREE = 'https://formspree.io/f/xvzyakle';
let selectedPresta = null;

window.AVS = {
  open: function(prestaHint){
    document.getElementById('avs-modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    // Pré-sélectionner si on vient d'un bouton spécifique
    if(prestaHint){
      const map = {alba:'avs-p-alba',aria:'avs-p-aria',ora:'avs-p-aria',bilan:'avs-p-bilan',suivi:'avs-p-suivi'};
      const el = document.getElementById(map[prestaHint]);
      if(el) this.selectPresta(prestaHint, el);
    }
    // Focus accessibilité
    setTimeout(()=>{ document.getElementById('avs-prenom').focus(); }, 200);
  },
  close: function(){
    document.getElementById('avs-modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
  },
  selectPresta: function(key, el){
    selectedPresta = key;
    document.querySelectorAll('.avs-presta').forEach(p => p.classList.remove('selected'));
    if(el) el.classList.add('selected');
  },
  submit: async function(){
    const btn = document.getElementById('avs-submit');
    const err = document.getElementById('avs-error');
    const prenom = document.getElementById('avs-prenom').value.trim();
    const nom = document.getElementById('avs-nom').value.trim();
    const email = document.getElementById('avs-email').value.trim();
    const motif = document.getElementById('avs-motif').value.trim();

    err.style.display = 'none';

    if(!prenom || !email){
      err.textContent = 'Prénom et email sont requis.';
      err.style.display = 'block';
      return;
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      err.textContent = 'Adresse email invalide.';
      err.style.display = 'block';
      return;
    }

    const prestaLabels = {
      bilan:'Bilan de vitalité (90 € · 90 min)',
      suivi:'Consultation de suivi (65 € · 60 min)',
      alba:'Parcours Alba (320 € · 3 mois)',
      aria:'Parcours Aria (560 € · 6 mois)',
      ora:'Parcours Ora (780 € · 9 mois)'
    };

    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';

    try {
      const res = await fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: '🌿 Liste d\'attente — ' + prenom + ' ' + nom + ' · ' + (selectedPresta ? prestaLabels[selectedPresta] : 'prestation ?'),
          prenom,
          nom,
          email,
          prestation: selectedPresta ? prestaLabels[selectedPresta] : 'Non précisée',
          motif: motif || '—',
          source: window.location.pathname,
          date: new Date().toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})
        })
      });

      if(res.ok){
        document.getElementById('avs-form-wrap').style.display = 'none';
        document.getElementById('avs-success').style.display = 'block';
      } else {
        throw new Error('Erreur serveur');
      }
    } catch(e){
      err.textContent = 'Une erreur est survenue. Écrivez directement à sabrina@avitaserena.com';
      err.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Rejoindre la liste prioritaire →';
    }
  }
};

// ── Intercepter tous les liens reservation.html et boutons Réserver ──
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('a[href*="reservation"]').forEach(function(a){
    // Détecter si le lien porte un indice de prestation
    const txt = (a.textContent || '').toLowerCase();
    const href = (a.getAttribute('href') || '').toLowerCase();
    let hint = null;
    if(txt.includes('alba') || href.includes('alba')) hint = 'alba';
    else if(txt.includes('aria') || href.includes('aria')) hint = 'aria';
    else if(txt.includes('ora') || href.includes('ora')) hint = 'ora';
    else if(txt.includes('suivi') || href.includes('suivi')) hint = 'suivi';
    else if(txt.includes('bilan') || href.includes('bilan')) hint = 'bilan';
    a.addEventListener('click', function(e){
      e.preventDefault();
      AVS.open(hint);
    });
  });

  // Boutons nav "Réserver" qui pointent vers programmes.html
  document.querySelectorAll('a[href*="programmes"]').forEach(function(a){
    if(/(r[eé]server|réservez|prendre rdv|rendez-vous)/i.test(a.textContent)){
      a.addEventListener('click', function(e){
        e.preventDefault();
        AVS.open(null);
      });
    }
  });
});

})();
