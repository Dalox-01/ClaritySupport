// Service worker pour l'extension
console.log('MailWiz background service worker started');

// Gérer l'installation de l'extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('MailWiz extension installed');
});

// Écouter les messages de la page web et du content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message reçu:', message);
  
  if (message.type === 'AUTH_SUCCESS') {
    console.log('✅ AUTH_SUCCESS reçu, sauvegarde des données...');
    
    // Sauvegarder les données d'authentification
    chrome.storage.local.set({
      authToken: message.token,
      user: message.user,
      usage: message.usage
    }, () => {
      console.log('💾 Données d\'auth sauvegardées:', message.user);
      sendResponse({ success: true });
    });
    
    return true; // Pour garder le canal de message ouvert pour sendResponse
  }
});

// Écouter les changements de storage pour déboguer
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('🔄 Storage changé:', changes);
});
