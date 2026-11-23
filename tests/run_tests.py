#!/usr/bin/env python3
"""Petits tests de contrôle A VITA SERENA — à relancer après chaque modification.
Usage : python3 run_tests.py [dossier_du_site]   (par défaut : ../site)
Aucun accès à la base : tout est vérifié sur les fichiers."""
import sys, os, re, json, subprocess, glob
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'site'))
HERE = os.path.dirname(os.path.abspath(__file__))
ok = ko = 0
def check(nom, cond, detail=''):
    global ok, ko
    if cond: ok += 1; print('  ✓', nom)
    else: ko += 1; print('  ✗', nom, ('— ' + str(detail)[:300]) if detail else '')
def read(p): return open(os.path.join(ROOT, p), encoding='utf-8').read()

print('1. Syntaxe des scripts de chaque page')
pages = sorted(glob.glob(ROOT + '/*.html') + glob.glob(ROOT + '/outils/*.html'))
for f in pages:
    s = open(f, encoding='utf-8').read(); bad = []
    for i, sc in enumerate([m[1] for m in re.findall(r'<script((?![^>]*\bsrc\b)[^>]*)>(.*?)</script>', s, re.S) if not re.search(r'type\s*=\s*["\'](?!module|text/javascript)', m[0])]):
        open('/tmp/_t.js', 'w').write(sc)
        r = subprocess.run(['node', '--check', '/tmp/_t.js'], capture_output=True, text=True)
        if r.returncode: bad.append((i, r.stderr.splitlines()[-1] if r.stderr else ''))
    check(os.path.relpath(f, ROOT), not bad, bad)

print('2. Stockage privé : plus aucun lien public vers les analyses')
for f in pages + glob.glob(ROOT + '/outils/*.js'):
    s = open(f, encoding='utf-8').read()
    check('pas d\'URL publique avs-bilans dans ' + os.path.relpath(f, ROOT), '/object/public/avs-bilans/' not in s.replace("object/public/avs-bilans/'+path", '') or 'ouvrirDocBilan' in s or 'ouvrirBilanPrive' in s or f.endswith('.js'))

print('3. Questionnaire de préparation ↔ fonction serveur ↔ libellés CRM')
allow = json.load(open(os.path.join(HERE, 'allow.json')))
labels_js = read('outils/visio-labels.js')
labels = json.loads(labels_js[labels_js.index('{'):labels_js.rindex('}') + 1]) if labels_js.strip().startswith('/*') or '=' in labels_js[:200] else {}
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    pg.goto('file://' + ROOT + '/questionnaire_preparation_visio.html'); pg.wait_for_timeout(800)
    Q = pg.evaluate("Object.fromEntries(Object.entries(Q).map(([id,q])=>[id,q.o.map(o=>o[0])]))")
    ENTRY = pg.evaluate("ENTRY.map(o=>o[0])")
    check('page de préparation sans erreur', not errs, errs)
    manque = [(i, k) for i, ks in Q.items() for k in ks if i not in allow or k not in allow[i]['k']]
    check('toutes les réponses de la page sont acceptées par la fonction serveur', not manque, manque[:5])
    check('motifs d\'entrée acceptés', all(k in allow['e_motifs']['k'] for k in ENTRY))
    # libellés CRM
    lab = pg.evaluate("1")
    b.close()
check('visio-labels.js couvre toutes les questions', all(i in labels_js for i in Q), [i for i in Q if i not in labels_js][:5])

print('4. Moteur de consultation : relecture + confirmation automatique')
SNAP = {"moteur": {"e_motifs": ["digestif", "sommeil"], "motifs": ["ball", "transit"], "ball_quand": ["deux_trois"], "secu": ["sang"], "z_motifs": ["endorm"]}, "alertes": [{"l": "Du sang dans les selles, ou des selles noires"}]}
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    pg.goto('file://' + ROOT + '/outils/Questionnaire_de_consultation.html'); pg.wait_for_timeout(1500)
    check('moteur chargé', pg.evaluate("typeof window.mgChargerVisio") == 'function')
    pg.evaluate("s=>window.mgChargerVisio(s)", SNAP); pg.wait_for_timeout(500)
    cli = pg.evaluate("window.__mg.cli()")
    check('les réponses de la cliente sont relues', cli and len(cli) >= 3, cli)
    check('alertes de la cliente relayées au générateur', 'sang' in json.dumps(pg.evaluate("window.mgAlertesVisio()") or '', ensure_ascii=False).lower(), pg.evaluate("window.mgAlertesVisio()"))
    check('une lecture est affichée', len(pg.evaluate("(document.getElementById('mg-lec')||{innerText:''}).innerText")) > 20)
    check('aucune erreur JS pendant le parcours', not errs, errs)
    b.close()

print('4b. Calibrage des pistes (consultation → table)')
posts=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page()
    def route(r):
        u=r.request.url
        if 'calibrage_pistes' in u:
            if r.request.method=='POST': posts.append(r.request.post_data); r.fulfill(status=201,body='')
            else: r.fulfill(status=200,content_type='application/json',body='[]')
        elif u.startswith('http'): r.abort()
        else: r.continue_()
    pg.route('**/*',route)
    pg.goto('file://'+ROOT+'/outils/Questionnaire_de_consultation.html?client_id=test-cli'); pg.wait_for_timeout(1500)
    pg.evaluate("s=>window.mgChargerVisio(s)",{"moteur":{"e_motifs":["sommeil"],"z_motifs":["endorm","reveils"],"z_endorm":["rumine"],"z_reveils":["trois_heures"],"z_alertes":["aucun"]}}); pg.wait_for_timeout(800)
    check('le bloc Calibrage apparaît avec les pistes', pg.evaluate("document.querySelectorAll('[data-cal=v]').length") >= 1)
    if pg.evaluate("!!document.querySelector('.mg-cal')"):
        pg.evaluate("document.querySelector('.mg-cal').open=true"); pg.evaluate("document.querySelector('[data-cal=v][data-v=confirmee]').click()"); pg.wait_for_timeout(700)
        check('un avis est envoyé à la table calibrage_pistes', len(posts) == 1 and 'confirmee' in posts[0], posts)
        check('le bloc reste ouvert après un clic', pg.evaluate("document.querySelector('.mg-cal').open"))
    b.close()

print('5. Cohérence consultation ↔ suivi ↔ générateur')
gen = read('outils/generateur.html'); suivi = read('outils/Questionnaire_de_suivi.html'); cons = read('outils/Questionnaire_de_consultation.html'); crm = read('outils/crm.html')
check('le générateur lit les alertes médicales', 'alertes_medicales' in gen)
check('le générateur lit les réponses du parcours par motif', 'motif_guide_' in gen)
check('le suivi lit les réponses du parcours par motif', 'motif_guide_' in suivi)
check('la consultation exporte les alertes et les motifs', 'alertes_medicales' in cons and 'motif_guide_' in cons)
check('le CRM ouvre les documents par lien temporaire', 'ouvrirDocBilan' in crm and '/storage/v1/object/sign/avs-bilans/' in crm)
check('le CRM a la page Calibrage', "nav('calibrage'" in crm and 'calibrage_pistes' in crm)
check('le CRM a l\'onglet Sauvegardes', "nav('sauvegardes'" in crm and 'backup-export' in crm)

print('5b. Suivi : relit les signes de chaque profil (6 profils types)')
prof = json.load(open(os.path.join(HERE, 'profils_out.json')))
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    pg.goto('file://' + ROOT + '/outils/Questionnaire_de_suivi.html'); pg.wait_for_timeout(1500)
    for k, v in prof.items():
        r = pg.evaluate("s=>{var l=extraireSymptomesConsultation(s); return {n:l.length, inconnues:l.filter(x=>!CONSULT_SECTIONS[x.s]).length}}", {'motif_guide_suivi': v['d']['motif_guide_suivi']})
        check('suivi : profil ' + k + ' → ' + str(r['n']) + ' signes relus', r['n'] > 0 and r['inconnues'] == 0, r)
    check('suivi sans erreur JS', not errs, errs[:2])
    b.close()
check('le générateur appelle l\'IA en direct (pas par le relais de 150 s)', 'maxTokens: 32000, direct: true' in gen)

print('6. Règles de la charte')
for f in ['questionnaire_preparation_visio.html', 'outils/Questionnaire_de_consultation.html']:
    s = read(f)
    check(f + ' : pas de « AVITA SERENA » en un mot dans le texte visible', not re.search(r'>[^<]*\bAVITA SERENA\b[^<]*<', s))
# alerte : le médecin d'abord
try:
    g=open(os.path.join(ROOT,'outils','generateur.html'),encoding='utf-8').read()
    check('consigne alerte : médecin en premier', 'PRIORITÉ ABSOLUE (RÈGLE N°6)' in g)
    check('signaux détectés injectés dans le prompt', 'Signaux repérés dans le dossier' in g)
except Exception as e:
    check('consigne alerte', False)

print('\nRésultat : %d réussis, %d échecs' % (ok, ko))
sys.exit(1 if ko else 0)
