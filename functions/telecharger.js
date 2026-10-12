// A VITA SERENA — téléchargement protégé du guide complet.
// Vérifie auprès de Stripe que la session de paiement est bien payée,
// puis renvoie le PDF personnalisé (nom/e-mail de l'acheteur·se en pied de page).
//
// Variables à définir dans Cloudflare Pages (Settings > Variables and Secrets) :
//   STRIPE_KEY        clé restreinte Stripe en lecture seule (Checkout Sessions : Read)
//   STRIPE_PLINK_ID   (facultatif) identifiant du lien de paiement, ex. plink_1Abc... pour n'accepter que ce produit

import { PDFDocument, StandardFonts, rgb } from './_pdf-lib.js';
import { GUIDE_B64 } from './_guide.js';

const page = (title, msg, status = 400) =>
  new Response(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head><body style="margin:0;background:#F7F6F4;color:#1E1E1C;font-family:system-ui,sans-serif;line-height:1.7"><div style="max-width:520px;margin:12vh auto;padding:0 24px"><h1 style="font-family:Georgia,serif;font-weight:400;font-size:28px">${title}</h1><p style="color:#6B6560">${msg}</p><p><a href="/ebook-sibo" style="color:#B4906A">Retour à la page du guide</a> · <a href="mailto:sabrina@avitaserena.com" style="color:#B4906A">Me contacter</a></p></div></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } }
  );

const latin = (s) => String(s || '').replace(/[^\x20-\x7E -ÿ]/g, '');

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const sid = url.searchParams.get('session_id') || '';
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(sid))
    return page('Lien incomplet', 'Ce lien de téléchargement n’est pas valide. Utilisez le bouton de la page de confirmation affichée après votre paiement, ou écrivez-moi : je vous renverrai votre guide.');
  if (!env.STRIPE_KEY) return page('Service momentanément indisponible', 'Le téléchargement est en cours de configuration. Écrivez-moi, je vous envoie votre guide sous 24h.', 503);

  const r = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sid), {
    headers: { Authorization: 'Bearer ' + env.STRIPE_KEY },
  });
  if (!r.ok) return page('Paiement introuvable', 'Je n’ai pas retrouvé ce paiement. Si vous venez de payer, patientez une minute puis rechargez la page, ou écrivez-moi.', 404);
  const s = await r.json();
  if (s.payment_status !== 'paid') return page('Paiement non confirmé', 'Ce paiement n’est pas encore confirmé. Rechargez la page dans un instant, ou écrivez-moi si le problème persiste.', 402);
  if (env.STRIPE_PLINK_ID && s.payment_link !== env.STRIPE_PLINK_ID)
    return page('Lien non valable', 'Ce paiement ne correspond pas au guide. Écrivez-moi et je vous aide.', 403);

  const email = (s.customer_details && s.customer_details.email) || s.customer_email || '';
  const name = (s.customer_details && s.customer_details.name) || '';

  const bin = Uint8Array.from(atob(GUIDE_B64), (c) => c.charCodeAt(0));
  const pdf = await PDFDocument.load(bin);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const label = latin('Exemplaire personnel de ' + (name ? name + ' · ' : '') + email + ' · reproduction et diffusion interdites');
  for (const p of pdf.getPages()) {
    const { width } = p.getSize();
    const size = 6.5;
    const w = font.widthOfTextAtSize(label, size);
    p.drawText(label, { x: Math.max(20, (width - w) / 2), y: 14, size, font, color: rgb(0.42, 0.40, 0.38) });
  }
  pdf.setSubject('Exemplaire personnel — ' + latin(email));
  const out = await pdf.save();

  return new Response(out, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="guide-sibo-comprendre-tester-agir.pdf"',
      'cache-control': 'private, no-store',
      'x-robots-tag': 'noindex',
    },
  });
}
