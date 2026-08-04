// ══════════════════════════════════════
// A VITA SERENA — Service Worker
// Rôle : réception des notifications push (réponses de Sabrina dans le
// chat) et ouverture de l'espace client au clic. Volontairement minimal —
// pas de mise en cache agressive, pour ne jamais servir une version périmée
// de l'espace client (voir note : le cache navigateur cause déjà assez de
// faux "aucun changement" pendant le déploiement des autres outils).
// ══════════════════════════════════════

self.addEventListener('install', function(event){
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(self.clients.claim());
});

// Réception d'une notification push envoyée par l'Edge Function notify-reply-client
self.addEventListener('push', function(event){
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e){
    data = { title: 'A Vita Serena', body: event.data ? event.data.text() : 'Vous avez une nouvelle notification.' };
  }

  var title = data.title || 'Sabrina vous a répondu';
  var options = {
    body: data.body || 'Ouvrez votre espace pour lire le message.',
    icon: '/apple-touch-icon.png',
    badge: '/apple-touch-icon.png',
    data: { url: data.url || 'https://avitaserena.com/espace-clientes.html#serena' },
    tag: 'avs-reponse-chat',
    renotify: true
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Clic sur la notification → ouvre (ou remet au premier plan) l'espace client
self.addEventListener('notificationclick', function(event){
  event.notification.close();
  var targetUrl = (event.notification.data && event.notification.data.url) || 'https://avitaserena.com/espace-clientes.html';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList){
      for (var i = 0; i < clientList.length; i++){
        var c = clientList[i];
        if (c.url.indexOf('espace-clientes.html') > -1 && 'focus' in c){
          c.navigate(targetUrl);
          return c.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
