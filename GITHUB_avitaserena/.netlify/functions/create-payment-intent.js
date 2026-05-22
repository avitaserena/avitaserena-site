// ══════════════════════════════════════════════════════════════
// NETLIFY FUNCTION — create-payment-intent.js
// Emplacement : /.netlify/functions/create-payment-intent.js
//
// Cette fonction tourne côté serveur (Netlify) et crée
// un PaymentIntent Stripe avec votre clé SECRÈTE.
// Votre clé secrète n'est JAMAIS exposée dans le navigateur.
//
// INSTALLATION :
// 1. Dans votre projet Netlify, créez le dossier /.netlify/functions/
// 2. Copiez ce fichier dedans
// 3. Dans Netlify → Site settings → Environment variables, ajoutez :
//    STRIPE_SECRET_KEY = sk_live_xxxxx (votre clé secrète Stripe)
//    BREVO_API_KEY = xkeysib-xxxxx (pour l'envoi du mail de confirmation)
//    SABRINA_EMAIL = sabrina@avitaserena.com
// 4. Déployez — la function est automatiquement disponible
// ══════════════════════════════════════════════════════════════

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { amount, currency, description, customer_email, customer_name, metadata } = body;

    // Validation
    if (!amount || amount < 100) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Montant invalide' }) };
    }
    if (!customer_email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email obligatoire' }) };
    }

    // Créer ou récupérer le client Stripe
    let customerId;
    const existingCustomers = await stripe.customers.list({ email: customer_email, limit: 1 });
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: customer_email,
        name: customer_name,
        metadata: metadata || {}
      });
      customerId = customer.id;
    }

    // Créer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,           // en centimes (ex: 9000 pour 90€)
      currency: currency || 'eur',
      customer: customerId,
      description: description || 'Consultation Avita Serena',
      receipt_email: customer_email,
      metadata: {
        prenom: metadata?.prenom || '',
        nom: metadata?.nom || '',
        email: customer_email,
        tel: metadata?.tel || '',
        motif: metadata?.motif || '',
        prestation: description || '',
        source: 'avitaserena.fr'
      },
      // Envoi automatique du reçu par Stripe
      payment_method_types: ['card'],
    });

    // ── OPTIONNEL : Notifier Sabrina par email via Brevo ──
    // (décommentez si vous avez configuré BREVO_API_KEY)
    /*
    if (process.env.BREVO_API_KEY) {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
          sender: { name: 'Avita Serena · Réservation', email: 'sabrina@avitaserena.com' },
          to: [{ email: process.env.SABRINA_EMAIL || 'sabrina@avitaserena.com' }],
          subject: `💰 Nouvelle réservation — ${customer_name} — ${description}`,
          textContent: `Nouvelle réservation reçue !\n\nCliente : ${customer_name}\nEmail : ${customer_email}\nTél : ${metadata?.tel || '—'}\nPrestation : ${description}\nMontant : ${amount/100}€\nMotif : ${metadata?.motif || '—'}\n\nPaymentIntent ID : ${paymentIntent.id}`
        })
      });
    }
    */

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      })
    };

  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
