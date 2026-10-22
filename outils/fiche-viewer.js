/* ═══════════════════════════════════════════════════════════
   A VITA SERENA — fiche-viewer.js
   Affiche une fiche protégée, stockée dans Supabase (table
   fiches_ressources). Réservé aux clientes connectées et à la
   praticienne (RLS côté base). Sans connexion : écran de
   connexion. Nécessite auth-guard.js, SUPA_URL, SUPA_KEY et
   FICHE_SLUG définis par la page appelante.
   ═══════════════════════════════════════════════════════════ */
(function(){
  var attente = document.getElementById('fiche-attente');
  function message(t){ if(attente){ attente.style.display='block'; attente.textContent = t; } }

  async function charger(){
    removeAuthGate();
    message('Chargement de votre fiche…');
    try{
      var token = await Auth.getValidAccessToken();
      if(!token){ return showAuthGate('cliente', charger); }
      var res = await fetch(SUPA_URL + '/rest/v1/fiches_ressources?slug=eq.' + encodeURIComponent(FICHE_SLUG) + '&select=html',
        { headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + token } });
      if(res.status === 401){ Auth.logout(); return showAuthGate('cliente', charger); }
      if(!res.ok) throw new Error('HTTP ' + res.status);
      var rows = await res.json();
      if(!rows.length || !rows[0].html){
        message("Cette fiche est réservée aux clientes de A VITA SERENA. Si vous pensez qu'il s'agit d'une erreur, écrivez-moi : sabrina@avitaserena.com");
        return;
      }
      document.open(); document.write(rows[0].html); document.close();
    }catch(e){
      console.error('Fiche indisponible :', e);
      message("Impossible d'afficher la fiche pour le moment. Rechargez la page ou réessayez dans quelques minutes.");
    }
  }
  showAuthGate('cliente', charger);
})();
