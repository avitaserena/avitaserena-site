/* ═══════════════════════════════════════════════════════════
   AVITA SERENA · supabase-db.js
   Couche d'abstraction Supabase — partagée par tous les outils
   Inclure avec : <script src="supabase-db.js"></script>
   ═══════════════════════════════════════════════════════════ */

const SUPA_URL = 'https://bqhkdndwldwqacrrbbig.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxaGtkbmR3bGR3cWFjcnJiYmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzAyNTIsImV4cCI6MjA5NjMwNjI1Mn0.nH2UktMAVKYwng4L3SvW5F0fluV_sObGV0f3Mk1dnOY';

/* ── Requête générique ──────────────────────────────────── */
async function supaFetch(path, opts = {}) {
  const res = await fetch(SUPA_URL + '/rest/v1/' + path, {
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': 'Bearer ' + SUPA_KEY,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || 'return=representation',
      ...(opts.headers || {})
    },
    method: opts.method || 'GET',
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Supabase ' + res.status + ': ' + err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ════════════════════════════════════════════════════════
   CLIENTES
   ════════════════════════════════════════════════════════ */
const DB = {

  /* ── Clientes ─────────────────────────────────────── */
  async getClientes() {
    return await supaFetch('clientes?order=created_at.desc');
  },

  async saveCliente(client) {
    // Upsert : crée ou met à jour selon l'id
    const payload = {
      id:             client.id,
      prenom:         client.prenom,
      nom:            client.nom || null,
      email:          client.email || null,
      tel:            client.tel || null,
      age:            client.age || null,
      motifs:         client.motifs || null,
      axes:           client.axes || null,
      notes:          client.notes || null,
      programme:      client.programme || null,
      duree_ttt:      client.dureeTtt || null,
      date1:          client.date1 || null,
      date_protocole: client.dateProtocole || null,
      timeline:       client.timeline || [],
      workflow_done:  client.workflowDone || {},
      created_at:     client.createdAt || null,
      updated_at:     new Date().toISOString()
    };
    return await supaFetch('clientes', {
      method: 'POST',
      prefer: 'return=representation,resolution=merge-duplicates',
      headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
      body: payload
    });
  },

  async deleteCliente(id) {
    return await supaFetch('clientes?id=eq.' + encodeURIComponent(id), { method: 'DELETE', prefer: '' });
  },

  /* ── Factures ─────────────────────────────────────── */
  async getFactures() {
    return await supaFetch('factures?order=date.desc');
  },

  async saveFacture(f) {
    const payload = {
      id:               f.id,
      num:              f.num,
      client_id:        f.clientId || null,
      date:             f.date,
      prestation:       f.prestation,
      prestation_label: f.prestationLabel,
      montant:          f.montant,
      paiement:         f.paiement,
      paiement_label:   f.paiementLabel,
      statut:           f.statut,
      deux_fois:        f.deuxFois || 'non',
      created_at:       f.createdAt || null,
      updated_at:       new Date().toISOString()
    };
    return await supaFetch('factures', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
      body: payload
    });
  },

  async deleteFacture(id) {
    return await supaFetch('factures?id=eq.' + encodeURIComponent(id), { method: 'DELETE', prefer: '' });
  },

  /* ── Rendez-vous ──────────────────────────────────── */
  async getRdvs() {
    return await supaFetch('rendez_vous?order=date.asc,time.asc');
  },

  async saveRdv(rdv) {
    const payload = {
      id:         rdv.id,
      name:       rdv.name,
      email:      rdv.email || null,
      date:       rdv.date,
      time:       rdv.time,
      type:       rdv.type,
      status:     rdv.status || 'attente',
      notes:      rdv.notes || null,
      parcours:   rdv.parcours || null,
      mails_done: rdv.mailsDone || {},
      updated_at: new Date().toISOString()
    };
    return await supaFetch('rendez_vous', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
      body: payload
    });
  },

  async deleteRdv(id) {
    return await supaFetch('rendez_vous?id=eq.' + id, { method: 'DELETE', prefer: '' });
  },

  /* ── Agenda config ────────────────────────────────── */
  async getAgendaConfig() {
    const rows = await supaFetch('agenda_config?id=eq.main');
    return rows?.[0] || null;
  },

  async saveAgendaConfig(slots, blocked, prepTime) {
    return await supaFetch('agenda_config', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
      body: { id: 'main', slots, blocked, prep_time: prepTime, updated_at: new Date().toISOString() }
    });
  },

  /* ── Questionnaires ───────────────────────────────── */
  async saveQuestionnaire(type, prenom, snapshot, clientId) {
    const id = type + '_' + Date.now();
    return await supaFetch('questionnaires', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: {
        id,
        client_id:  clientId || null,
        type,
        prenom,
        snapshot,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  },

  async getQuestionnaires(clientId) {
    const filter = clientId ? '?client_id=eq.' + encodeURIComponent(clientId) + '&order=created_at.desc' : '?order=created_at.desc';
    return await supaFetch('questionnaires' + filter);
  },

  /* ── PHV Memos (observance fiche mémo cliente) ───────── */

  // Clé unique cliente : prenom+nom+ddn normalisés
  clientKey(prenom, nom, ddn) {
    const normalize = s => (s||'').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'');
    return [normalize(prenom), normalize(nom), normalize(ddn)].filter(Boolean).join('_');
  },

  async savePHVMemo(prenom, nom, ddn, payload) {
    const client_key = this.clientKey(prenom, nom, ddn);
    const id = 'memo_' + client_key + '_' + Date.now();
    return await supaFetch('phv_memos', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: {
        id,
        client_key,
        prenom:     prenom || null,
        nom:        nom || null,
        ddn:        ddn || null,
        stats:      payload.stats || {},
        details:    payload.details || {},
        note:       payload.note || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  },

  async getPHVMemos(prenom, nom, ddn) {
    const client_key = this.clientKey(prenom, nom, ddn);
    return await supaFetch('phv_memos?client_key=eq.' + encodeURIComponent(client_key) + '&order=created_at.desc');
  },

  async getLatestPHVMemo(prenom, nom, ddn) {
    const rows = await this.getPHVMemos(prenom, nom, ddn);
    return rows?.[0] || null;
  },
  async getSettings() {
    const rows = await supaFetch('settings?id=eq.praticien');
    return rows?.[0]?.data || {};
  },

  async saveSettings(data) {
    return await supaFetch('settings', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
      body: { id: 'praticien', data, updated_at: new Date().toISOString() }
    });
  },

  /* ── Compteur factures ────────────────────────────── */
  async getNextFactureNum() {
    const factures = await supaFetch('factures?select=num&order=num.desc&limit=1');
    if (!factures || factures.length === 0) return 1;
    return parseInt(factures[0].num || '0') + 1;
  }
};

/* ════════════════════════════════════════════════════════
   MIGRATION localStorage → Supabase
   Appeler une seule fois depuis la console navigateur
   si tu as des données existantes à récupérer
   ════════════════════════════════════════════════════════ */
async function migrerLocalStorageVersSupabase() {
  console.log('🔄 Migration localStorage → Supabase...');
  let ok = 0, err = 0;

  // CRM
  try {
    const raw = localStorage.getItem('avs_crm_v2');
    if (raw) {
      const data = JSON.parse(raw);
      for (const c of (data.clients || [])) {
        try { await DB.saveCliente(c); ok++; } catch(e) { console.warn('Client échoué:', c.prenom, e); err++; }
      }
      for (const f of (data.factures || [])) {
        try { await DB.saveFacture(f); ok++; } catch(e) { console.warn('Facture échouée:', f.id, e); err++; }
      }
      console.log('✓ CRM migré');
    }
  } catch(e) { console.warn('CRM skipped:', e); }

  // Agenda
  try {
    const raw = localStorage.getItem('avs_agenda');
    if (raw) {
      const data = JSON.parse(raw);
      for (const r of (data.rdvs || [])) {
        try { await DB.saveRdv(r); ok++; } catch(e) { console.warn('RDV échoué:', r.id, e); err++; }
      }
      await DB.saveAgendaConfig(data.slots || [], data.blocked || [], data.prepTime || 10);
      console.log('✓ Agenda migré');
    }
  } catch(e) { console.warn('Agenda skipped:', e); }

  console.log(`✅ Migration terminée : ${ok} éléments OK, ${err} erreurs`);
  return { ok, err };
}

console.log('✓ supabase-db.js chargé — DB disponible globalement');
