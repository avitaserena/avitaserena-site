/* A VITA SERENA — Offre des deux guides SIBO sur les pages SIBO.
   Ajoute : un bloc au milieu de l'article, un bloc en bas, et une barre qui suit le défilement.
   Installation : une seule ligne avant </body> de chaque page SIBO :
   <script src="/sibo-guides.js" defer></script> */
(function () {
  var FREE = '/ebooks#guide-sibo', FULL = '/ebook-sibo';
  var art = document.querySelector('.article-content'); if (!art) return;

  var css = '\
.gd-block{margin:56px 0;background:#F7F6F4;border:1px solid #D5CFC6;border-top:3px solid #B4906A;padding:34px clamp(22px,4vw,44px);font-family:"Be Vietnam Pro",sans-serif}\
.gd-kicker{font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#9B7230;margin-bottom:10px}\
.gd-title{font-family:"Cormorant Garamond",serif;font-style:italic;font-weight:400;font-size:clamp(26px,3vw,34px);line-height:1.2;color:#1E1E1C;margin:0 0 12px}\
.gd-lead{font-size:17px;line-height:1.75;color:#2C2C2A;margin:0 0 24px;max-width:62ch}\
.gd-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}\
.gd-card{background:#fff;border:1px solid #D5CFC6;padding:22px;display:flex;flex-direction:column;gap:12px}\
.gd-card img{width:100%;height:auto;display:block}\
.gd-tag{font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#6B6560}\
.gd-name{font-size:19px;font-weight:600;color:#1E1E1C;line-height:1.35}\
.gd-desc{font-size:16px;line-height:1.7;color:#2C2C2A;flex:1}\
.gd-btn{display:inline-block;text-align:center;text-decoration:none;font-size:14px;font-weight:700;padding:14px 22px;border-radius:99px;border:1.5px solid #1E1E1C;color:#1E1E1C;background:transparent}\
.gd-btn.pri{background:#C4A882;border-color:#C4A882;color:#1E1E1C}\
.gd-btn:hover{background:#1E1E1C;border-color:#1E1E1C;color:#fff}\
.gd-mini{margin:44px 0;padding:22px clamp(18px,3vw,30px);background:#EDE9E1;border-left:3px solid #B4906A;font-family:"Be Vietnam Pro",sans-serif;display:flex;gap:18px;align-items:center;justify-content:space-between;flex-wrap:wrap}\
.gd-mini p{margin:0;font-size:17px;line-height:1.7;color:#2C2C2A;flex:1 1 320px}\
.gd-mini p b{font-weight:600;color:#1E1E1C}\
.gd-mini .gd-links{display:flex;gap:10px;flex-wrap:wrap}\
.gd-bar{position:fixed;left:0;right:0;bottom:0;z-index:900;background:#EDE9E1;border-top:1px solid #D5CFC6;box-shadow:0 -8px 24px rgba(30,30,28,.10);padding:12px 16px calc(12px + env(safe-area-inset-bottom));display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;transform:translateY(110%);transition:transform .4s cubic-bezier(.22,1,.36,1);font-family:"Be Vietnam Pro",sans-serif}\
.gd-bar.show{transform:translateY(0)}\
.gd-bar-t{font-size:14.5px;color:#1E1E1C;font-weight:600}\
.gd-bar-t span{font-weight:400;color:#6B6560}\
.gd-bar .gd-btn{padding:10px 18px;font-size:13px}\
.gd-x{position:absolute;right:8px;top:6px;background:none;border:0;font-size:22px;line-height:1;color:#6B6560;cursor:pointer;padding:6px 10px}\
@media(max-width:700px){.gd-grid{grid-template-columns:1fr}.gd-bar-t span{display:none}.gd-bar{justify-content:space-between;padding-right:44px}.gd-bar .gd-btn.sec{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var mini = document.createElement('aside'); mini.className = 'gd-mini'; mini.id = 'guides-milieu';
  mini.innerHTML = '<p><b>Envie de reprendre tout cela au calme ?</b> Un guide gratuit de 12 pages pose les bases, et le guide complet de 37 pages explique chaque étape : pourquoi le SIBO s’installe, comment se passent les tests, ce que révèle chaque profil de gaz.</p>' +
    '<div class="gd-links"><a class="gd-btn" href="' + FREE + '">Guide gratuit · 12 pages</a><a class="gd-btn pri" href="' + FULL + '">Guide complet · 37 pages · 22 €</a></div>';

  var big = document.createElement('section'); big.className = 'gd-block'; big.id = 'guides-sibo';
  big.innerHTML = '<div class="gd-kicker">Pour aller plus loin</div><h2 class="gd-title" style="margin-top:0">Comprendre votre ventre, à votre rythme.</h2>' +
    '<p class="gd-lead">Deux guides en PDF, rédigés par Sabrina Castelli, naturopathe. Chacun explique le « pourquoi » : ce qui se passe dans votre intestin, pourquoi les symptômes reviennent, et ce que les examens permettent réellement de savoir. Ils complètent votre suivi médical sans le remplacer.</p>' +
    '<div class="gd-grid">' +
    '<div class="gd-card"><img src="/images/guide-sibo-light-apercu.png" alt="Guide gratuit SIBO, 12 pages" loading="lazy" width="600" height="400"><div class="gd-tag">Gratuit · 12 pages</div><div class="gd-name">Les bases du SIBO</div><div class="gd-desc">Ce qu’est le SIBO, les trois profils de gaz et les repères pour savoir si vous vous reconnaissez. Reçu par e-mail.</div><a class="gd-btn" href="' + FREE + '">Recevoir le guide gratuit</a></div>' +
    '<div class="gd-card"><img src="/images/guide-sibo-complet-apercu.png" alt="Guide complet SIBO, 37 pages" loading="lazy" width="600" height="400"><div class="gd-tag">Complet · 37 pages · 22 €</div><div class="gd-name">SIBO : comprendre, tester, agir</div><div class="gd-desc">Le parcours expliqué de bout en bout : mécanismes, tests respiratoires, lien digestif et hormones, bases FODMAP. Téléchargement immédiat.</div><a class="gd-btn pri" href="' + FULL + '">Découvrir le guide complet</a></div>' +
    '</div>';

  var h2s = art.querySelectorAll('h2');
  var mid = h2s.length > 4 ? h2s[Math.floor(h2s.length / 2)] : null;
  if (mid) mid.parentNode.insertBefore(mini, mid);
  var anchor = document.querySelector('.types-nav') || document.querySelector('.cta-inline');
  if (anchor) anchor.parentNode.insertBefore(big, anchor);
  else art.appendChild(big);

  var bar = document.createElement('div'); bar.className = 'gd-bar'; bar.setAttribute('role', 'complementary'); bar.setAttribute('aria-label', 'Guides SIBO');
  bar.innerHTML = '<div class="gd-bar-t">Guides SIBO <span>· gratuit 12 pages ou complet 37 pages</span></div>' +
    '<a class="gd-btn sec" href="' + FREE + '">Gratuit</a><a class="gd-btn pri" href="' + FULL + '">Guide complet · 22 €</a>' +
    '<button class="gd-x" type="button" aria-label="Fermer">×</button>';
  document.body.appendChild(bar);

  var closed = false; try { closed = sessionStorage.getItem('gdBarClosed') === '1'; } catch (e) {}
  bar.querySelector('.gd-x').onclick = function () { closed = true; bar.classList.remove('show'); try { sessionStorage.setItem('gdBarClosed', '1'); } catch (e) {} };
  var nearBlocks = false;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { nearBlocks = es.some(function (e) { return e.isIntersecting; }); update(); });
    io.observe(big); io.observe(mini);
  }
  function update() {
    var h = document.documentElement, p = (window.scrollY || h.scrollTop) / Math.max(1, h.scrollHeight - h.clientHeight);
    var ft = document.querySelector('footer'); var nearFooter = ft && ft.getBoundingClientRect().top < window.innerHeight;
    bar.classList.toggle('show', !closed && p > 0.15 && !nearBlocks && !nearFooter);
  }
  window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update();
})();
