// Content script pour Gmail
console.log('MailWiz extension loaded');

// Écouter les messages de la popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'INSERT_EMAIL') {
    insertEmailInGmail(message.subject, message.body);
  }
});

// Insérer l'email dans Gmail
function insertEmailInGmail(subject, body) {
  try {
    // Trouver le champ sujet
    const subjectField = document.querySelector('input[name="subjectbox"]');
    if (subjectField) {
      subjectField.value = subject;
      subjectField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Trouver le champ corps
    const bodyField = document.querySelector('div[aria-label="Corps du message"]') ||
                     document.querySelector('div[role="textbox"]');
    
    if (bodyField) {
      bodyField.innerHTML = body;
      bodyField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Notification de succès
    showNotification('✅ Email inséré dans Gmail');
  } catch (error) {
    console.error('Error inserting email:', error);
    showNotification('❌ Erreur lors de l\'insertion');
  }
}

// Afficher une notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2D6A4F;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Styles d'animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
