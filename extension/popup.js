// Configuration
const API_URL = 'http://localhost:3000'; // Changez en production
const WEB_APP_URL = 'http://localhost:3000';

// État de l'application
let currentUser = null;
let usage = null;

// Éléments DOM
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const themeToggle = document.getElementById('theme-toggle');
const themeIconLight = document.getElementById('theme-icon-light');
const themeIconDark = document.getElementById('theme-icon-dark');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const sendGmailBtn = document.getElementById('send-gmail-btn');
const upgradeBtn = document.getElementById('upgrade-btn');
const backBtn = document.getElementById('back-btn');
const editBtn = document.getElementById('edit-btn');
const saveBtn = document.getElementById('save-btn');
const downloadBtn = document.getElementById('download-btn');

const planNameEl = document.getElementById('plan-name');
const planBadgeEl = document.getElementById('plan-badge');
const quotaTextEl = document.getElementById('quota-text');
const contextInput = document.getElementById('context');
const originalEmailInput = document.getElementById('original-email');
const emailTypeSelect = document.getElementById('email-type');
const toneSelect = document.getElementById('tone');

const resultContainer = document.getElementById('result-container');
const resultSubject = document.getElementById('result-subject');
const resultText = document.getElementById('result-text');
const loader = document.getElementById('loader');
const upgradePrompt = document.getElementById('upgrade-prompt');

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 MailWiz popup chargé');
  await checkAuth();
  await loadTheme();
  setupEventListeners();
  
  // Écouter les changements de storage
  chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log('🔄 Storage changé:', changes);
    if (changes.user || changes.usage) {
      checkAuth();
    }
  });
});

// Vérifier l'authentification
async function checkAuth() {
  try {
    const result = await chrome.storage.local.get(['authToken', 'user', 'usage']);
    
    if (result.authToken && result.user) {
      currentUser = result.user;
      usage = result.usage;
      showMainScreen();
      updateUI();
    } else {
      // Pas d'auth locale, vérifier si l'utilisateur est connecté sur le site web
      await checkWebsiteAuth();
    }
  } catch (error) {
    console.error('Error checking auth:', error);
    showLoginScreen();
  }
}

// Vérifier si l'utilisateur est authentifié sur le site web
async function checkWebsiteAuth() {
  try {
    console.log('🔍 Vérification de l\'auth sur le site web...');
    
    // Ouvrir un onglet invisible pour vérifier l'auth
    const response = await fetch(`${API_URL}/api/extension/auth`, {
      method: 'GET',
      credentials: 'include', // Important pour envoyer les cookies
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.authenticated) {
        console.log('✅ Utilisateur déjà connecté sur le site web:', data.user);
        
        // Sauvegarder dans chrome.storage
        await chrome.storage.local.set({
          authToken: data.token,
          user: data.user,
          usage: data.usage
        });
        
        currentUser = data.user;
        usage = data.usage;
        
        showMainScreen();
        updateUI();
        return;
      }
    }
    
    console.log('❌ Non authentifié');
    showLoginScreen();
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    showLoginScreen();
  }
}

// Afficher l'écran de connexion
function showLoginScreen() {
  loginScreen.classList.remove('hidden');
  mainScreen.classList.add('hidden');
}

// Afficher l'écran principal
function showMainScreen() {
  loginScreen.classList.add('hidden');
  mainScreen.classList.remove('hidden');
}

// Mettre à jour l'interface
function updateUI() {
  if (!currentUser || !usage) return;
  
  // Plan badge - petite bulle avec couleur
  const plan = currentUser.plan || 'FREE';
  planBadgeEl.textContent = plan;
  
  // Retirer toutes les classes de plan
  planBadgeEl.classList.remove('free', 'starter', 'pro', 'admin');
  
  // Ajouter la classe correspondante
  planBadgeEl.classList.add(plan.toLowerCase());
  
  // Limites par plan (synchronisé avec le site)
  const limits = {
    'FREE': 10,
    'STARTER': 100,
    'PRO': 1000,
    'ADMIN': Infinity
  };
  
  const limit = limits[plan] || 10;
  const used = usage.used || 0;
  const remaining = limit === Infinity ? '∞' : (limit - used);
  
  // Quota
  if (limit === Infinity) {
    quotaTextEl.textContent = `Illimité`;
  } else {
    quotaTextEl.textContent = `${used} / ${limit} utilisés`;
  }
  
  // Bouton générer - désactiver si quota épuisé
  if (limit !== Infinity && used >= limit) {
    generateBtn.disabled = true;
    upgradePrompt.classList.remove('hidden');
  } else {
    generateBtn.disabled = false;
    upgradePrompt.classList.add('hidden');
  }
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
  loginBtn.addEventListener('click', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  themeToggle.addEventListener('click', toggleTheme);
  generateBtn.addEventListener('click', handleGenerate);
  copyBtn.addEventListener('click', handleCopy);
  sendGmailBtn.addEventListener('click', handleSendGmail);
  upgradeBtn.addEventListener('click', handleUpgrade);
  backBtn.addEventListener('click', handleBack);
  editBtn.addEventListener('click', handleEdit);
  saveBtn.addEventListener('click', handleSave);
  downloadBtn.addEventListener('click', handleDownload);
}

// Gérer la connexion
async function handleLogin() {
  // Ouvrir l'application web pour l'authentification
  const authUrl = `${WEB_APP_URL}/?extension=true`;
  chrome.tabs.create({ url: authUrl });
  
  // Fermer la popup pour éviter la confusion
  window.close();
}

// Gérer la déconnexion
async function handleLogout() {
  await chrome.storage.local.clear();
  currentUser = null;
  usage = null;
  showLoginScreen();
}

// Gérer la génération
async function handleGenerate() {
  const context = contextInput.value.trim();
  const originalEmail = originalEmailInput.value.trim();
  
  if (!context) {
    alert('Veuillez saisir un contexte');
    return;
  }
  
  // Vérifier le quota
  const plan = currentUser.plan || 'FREE';
  const limits = {
    'FREE': 10,
    'STARTER': 100,
    'PRO': 1000,
    'ADMIN': Infinity
  };
  
  const limit = limits[plan] || 10;
  const used = usage.used || 0;
  
  if (limit !== Infinity && used >= limit) {
    alert(`Quota épuisé (${limit} emails/mois). Passez au plan supérieur.`);
    upgradePrompt.classList.remove('hidden');
    return;
  }
  
  try {
    // Afficher le loader
    loader.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    generateBtn.disabled = true;
    
    // Récupérer le token
    const { authToken } = await chrome.storage.local.get(['authToken']);
    
    // Construire le contexte enrichi
    let enrichedContext = context;
    if (originalEmail) {
      enrichedContext = `Email d'origine:\n${originalEmail}\n\nInstructions:\n${context}`;
    }
    
    // Appel API - utiliser la route spéciale pour l'extension
    const response = await fetch(`${API_URL}/api/extension/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailType: emailTypeSelect.value,
        tone: toneSelect.value,
        context: enrichedContext,
        style: 'formel',
        language: 'fr'
      })
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la génération');
    }
    
    const data = await response.json();
    
    // Incrémenter l'usage
    try {
      await fetch(`${API_URL}/api/extension/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ tokensUsed: data.tokensUsed || 1000 })
      });
    } catch (usageError) {
      console.warn('Could not increment usage:', usageError);
    }
    
    // Afficher le résultat
    resultSubject.textContent = data.subject;
    resultText.innerHTML = data.html;
    
    // Masquer le formulaire et afficher le résultat en plein écran
    document.getElementById('main-screen').querySelector('.content').style.display = 'none';
    document.querySelector('.quota-bar').style.display = 'none';
    resultContainer.classList.remove('hidden');
    
    // Mettre à jour le quota - utiliser la route spéciale pour l'extension
    try {
      const usageResponse = await fetch(`${API_URL}/api/extension/auth`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        if (usageData.authenticated) {
          usage = usageData.usage;
          await chrome.storage.local.set({ usage: usageData.usage });
          updateUI();
        }
      }
    } catch (usageError) {
      console.warn('Could not update usage:', usageError);
    }
    
  } catch (error) {
    console.error('Error generating email:', error);
    alert('Erreur lors de la génération de l\'email');
  } finally {
    loader.classList.add('hidden');
    generateBtn.disabled = false;
  }
}

// Copier le résultat
function handleCopy() {
  const subject = resultSubject.textContent;
  const text = resultText.innerText;
  const fullEmail = `Objet: ${subject}\n\n${text}`;
  
  navigator.clipboard.writeText(fullEmail).then(() => {
    // Animation de succès
    copyBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    
    setTimeout(() => {
      copyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;
    }, 2000);
  });
}

// Envoyer dans Gmail
async function handleSendGmail() {
  const subject = resultSubject.textContent;
  const text = resultText.innerHTML;
  
  // Envoyer un message au content script
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab.url && tab.url.includes('mail.google.com')) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'INSERT_EMAIL',
      subject: subject,
      body: text
    });
    
    window.close();
  } else {
    alert('Veuillez ouvrir Gmail pour insérer l\'email');
  }
}

// Ouvrir la page de mise à niveau
function handleUpgrade() {
  chrome.tabs.create({ url: `${WEB_APP_URL}/dashboard/billing` });
}

// Retour au formulaire
function handleBack() {
  resultContainer.classList.add('hidden');
  document.getElementById('main-screen').querySelector('.content').style.display = 'block';
  document.querySelector('.quota-bar').style.display = 'flex';
}

// Modifier l'email (ouvrir un textarea éditable)
function handleEdit() {
  const bodyDiv = document.getElementById('result-text');
  const currentHTML = bodyDiv.innerHTML;
  
  // Convertir en textarea éditable
  bodyDiv.contentEditable = true;
  bodyDiv.focus();
  bodyDiv.style.border = '2px solid var(--primary)';
  bodyDiv.style.padding = '12px';
  bodyDiv.style.borderRadius = '8px';
  bodyDiv.style.minHeight = '200px';
  
  // Changer le bouton en "Terminer"
  editBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    Terminer
  `;
  
  editBtn.onclick = () => {
    bodyDiv.contentEditable = false;
    bodyDiv.style.border = 'none';
    bodyDiv.style.padding = '0';
    
    editBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
      Modifier
    `;
    editBtn.onclick = handleEdit;
  };
}

// Enregistrer l'email dans l'historique
async function handleSave() {
  try {
    const subject = resultSubject.textContent;
    const body = resultText.innerHTML;
    
    const { authToken } = await chrome.storage.local.get(['authToken']);
    
    const response = await fetch(`${API_URL}/api/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject,
        body,
        emailType: emailTypeSelect.value,
        tone: toneSelect.value
      })
    });
    
    if (response.ok) {
      // Animation de succès
      saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Enregistré !
      `;
      
      setTimeout(() => {
        saveBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Enregistrer
        `;
      }, 2000);
    } else {
      alert('Erreur lors de l\'enregistrement');
    }
  } catch (error) {
    console.error('Error saving email:', error);
    alert('Erreur lors de l\'enregistrement');
  }
}

// Télécharger l'email en PDF
function handleDownload() {
  const subject = resultSubject.textContent;
  const body = resultText.innerText;
  
  // Créer un fichier texte
  const content = `Objet: ${subject}\n\n${body}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Télécharger
  const a = document.createElement('a');
  a.href = url;
  a.download = `email-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Animation de succès
  downloadBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    Téléchargé !
  `;
  
  setTimeout(() => {
    downloadBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Télécharger
    `;
  }, 2000);
}

// Gérer le thème
async function loadTheme() {
  const { theme } = await chrome.storage.local.get(['theme']);
  const currentTheme = theme || 'light';
  applyTheme(currentTheme);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
  chrome.storage.local.set({ theme: newTheme });
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  
  if (theme === 'dark') {
    themeIconLight.classList.add('hidden');
    themeIconDark.classList.remove('hidden');
  } else {
    themeIconLight.classList.remove('hidden');
    themeIconDark.classList.add('hidden');
  }
}
