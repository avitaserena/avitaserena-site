/* A VITA SERENA — choix des cookies
   - Rien n'est chargé (Google Tag Manager, qui porte la balise Google Analytics) avant un « Accepter » explicite.
   - « Refuser » est aussi simple que « Accepter ».
   - Le choix est mémorisé 6 mois dans un cookie technique (avs_consent), puis redemandé.
   - Un lien « Gérer mes cookies » (classe js-cookie-settings) rouvre le choix à tout moment.
   Ahrefs Web Analytics fonctionne sans cookie et n'est pas concerné par ce choix. */
(function () {
  var GTM_ID = 'GTM-T5FFCD78';
  var COOKIE = 'avs_consent';
  var SIX_MONTHS = 60 * 60 * 24 * 182;
  var loaded = false;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  /* Consentement Google refusé par défaut, avant tout chargement */
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', wait_for_update: 500
  });

  function readChoice() {
    var m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function saveChoice(v) {
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = COOKIE + '=' + encodeURIComponent(v) + '; Max-Age=' + SIX_MONTHS + '; Path=/; SameSite=Lax' + secure;
  }
  function deleteGoogleCookies() {
    var parts = location.hostname.split('.');
    var domains = ['', location.hostname];
    for (var i = 0; i < parts.length - 1; i++) { domains.push('.' + parts.slice(i).join('.')); }
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0 || name === '_gid' || name.indexOf('_gat') === 0) {
        domains.forEach(function (d) {
          document.cookie = name + '=; Max-Age=0; Path=/' + (d ? '; Domain=' + d : '');
        });
      }
    });
  }

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(g);
  }

  var banner = null;
  function css() {
    if (document.getElementById('avs-consent-css')) return;
    var s = document.createElement('style');
    s.id = 'avs-consent-css';
    s.textContent =
      '#avs-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:100000;max-width:760px;margin:0 auto;background:#F7F6F4;color:#1E1E1C;border:1px solid #D5CFC6;border-radius:4px;box-shadow:0 10px 40px rgba(30,30,28,.16);padding:24px 26px;font-family:"Be Vietnam Pro",system-ui,sans-serif}' +
      '#avs-consent h2{margin:0 0 10px;font-size:19px;line-height:1.3;font-weight:800;color:#1E1E1C;letter-spacing:0}' +
      '#avs-consent p{margin:0 0 12px;font-size:17px;line-height:1.75;color:#2C2C2A}' +
      '#avs-consent a{color:#1E1E1C;text-decoration:underline;text-underline-offset:3px}' +
      '#avs-consent .avs-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}' +
      '#avs-consent button{flex:1 1 200px;min-height:48px;padding:12px 22px;border-radius:99px;font:700 16px "Be Vietnam Pro",system-ui,sans-serif;cursor:pointer;border:1.5px solid #1E1E1C;background:transparent;color:#1E1E1C}' +
      '#avs-consent button.avs-yes{background:#C4A882;border-color:#C4A882}' +
      '#avs-consent button:hover,#avs-consent button:focus-visible{background:#1E1E1C;color:#fff;border-color:#1E1E1C;outline:none}' +
      '@media(max-width:600px){#avs-consent{left:10px;right:10px;bottom:10px;padding:20px 18px;max-height:88vh;overflow:auto}}';
    document.head.appendChild(s);
  }
  function hide() { if (banner && banner.parentNode) banner.parentNode.removeChild(banner); banner = null; }
  function show() {
    if (banner) return;
    css();
    banner = document.createElement('div');
    banner.id = 'avs-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'avs-consent-title');
    banner.innerHTML =
      '<h2 id="avs-consent-title">Vos choix sur les cookies</h2>' +
      '<p>Avec votre accord, je mesure la fréquentation de ce site (pages consultées, durée de visite) grâce à Google Analytics. Cela me permet de savoir quels articles vous aident vraiment, et donc de les améliorer. Aucune mesure n’est lancée tant que vous n’avez pas choisi, et refuser ne change rien à votre navigation.</p>' +
      '<p>Vous pouvez changer d’avis à tout moment avec « Gérer mes cookies » en bas de chaque page. <a href="/politique-confidentialite">Politique de confidentialité</a></p>' +
      '<div class="avs-actions"><button type="button" class="avs-no">Refuser</button><button type="button" class="avs-yes">Accepter</button></div>';
    document.body.appendChild(banner);
    banner.querySelector('.avs-yes').addEventListener('click', function () { saveChoice('granted'); hide(); loadAnalytics(); });
    banner.querySelector('.avs-no').addEventListener('click', function () {
      saveChoice('denied'); hide();
      gtag('consent', 'update', { analytics_storage: 'denied' });
      deleteGoogleCookies();
    });
    banner.setAttribute('tabindex', '-1');
    banner.style.outline = 'none';
    banner.focus({ preventScroll: true });
  }

  var choice = readChoice();
  if (choice === 'granted') loadAnalytics();

  function ready() {
    if (!choice) show();
    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('.js-cookie-settings') : null;
      if (el) { e.preventDefault(); show(); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
