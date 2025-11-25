// Content script qui écoute les messages d'authentification depuis la page web
console.log('🎧 MailWiz Auth Listener chargé sur:', window.location.href);

// Fonction pour sauvegarder les données d'auth
async function saveAuthData(authData) {
  console.log('💾 Sauvegarde des données d\'auth:', authData);
  
  try {
    await chrome.storage.local.set({
      authToken: authData.token,
      user: authData.user,
      usage: authData.usage
    });
    console.log('✅ Données d\'auth sauvegardées avec succès');
    
    // Informer le background script
    chrome.runtime.sendMessage({
      type: 'AUTH_SUCCESS',
      ...authData
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error);
    return false;
  }
}

// Écouter les messages de la page web
window.addEventListener('message', async (event) => {
  // Vérifier l'origine
  if (event.origin !== 'http://localhost:3000') {
    return;
  }

  console.log('📨 Message reçu de la page:', event.data);

  if (event.data.type === 'AUTH_SUCCESS') {
    console.log('✅ AUTH_SUCCESS détecté');
    await saveAuthData(event.data);
  }
});

// Vérifier aussi le localStorage périodiquement (fallback)
let lastCheck = null;

function checkLocalStorage() {
  const authDataStr = localStorage.getItem('mailwiz_auth');
  
  if (authDataStr && authDataStr !== lastCheck) {
    lastCheck = authDataStr;
    
    try {
      const authData = JSON.parse(authDataStr);
      console.log('📦 Données trouvées dans localStorage:', authData);
      
      if (authData.type === 'AUTH_SUCCESS') {
        saveAuthData(authData);
      }
    } catch (error) {
      console.error('❌ Erreur parsing localStorage:', error);
    }
  }
}

// Vérifier toutes les 500ms
setInterval(checkLocalStorage, 500);

console.log('✅ Auth listener prêt');
