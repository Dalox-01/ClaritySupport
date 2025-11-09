export interface DefaultTemplate {
  id: string;
  name: string;
  category: 'business' | 'networking' | 'customer-service' | 'hr' | 'marketing';
  description: string;
  subject: string;
  content: string;
  tone: 'professional' | 'friendly' | 'formal';
  language: 'fr' | 'en';
  variables: string[]; // Variables à personnaliser [Nom], [Entreprise], etc.
}

export const defaultTemplates: DefaultTemplate[] = [
  // ==================== BUSINESS (5) ====================
  {
    id: 'cold-email-b2b',
    name: 'Cold Email B2B',
    category: 'business',
    description: 'Premier contact avec un prospect professionnel',
    subject: 'Collaboration potentielle - [Entreprise]',
    tone: 'professional',
    language: 'fr',
    variables: ['Nom', 'Entreprise', 'Votre Entreprise', 'Bénéfice'],
    content: `Bonjour [Nom],

Je me permets de vous contacter car j'ai remarqué que [Entreprise] [contexte spécifique à l'entreprise].

Chez [Votre Entreprise], nous aidons des entreprises comme la vôtre à [Bénéfice]. Nos clients ont constaté en moyenne [résultat chiffré].

Seriez-vous disponible pour un échange rapide de 15 minutes cette semaine afin d'explorer si nous pourrions vous être utiles ?

Je reste à votre disposition.

Cordialement,
[Signature]`
  },
  {
    id: 'relance-commerciale',
    name: 'Relance Commerciale',
    category: 'business',
    description: 'Relance après une première proposition sans réponse',
    subject: 'Suite à ma proposition du [Date]',
    tone: 'professional',
    language: 'fr',
    variables: ['Nom', 'Proposition', 'Date'],
    content: `Bonjour [Nom],

Je me permets de revenir vers vous concernant [Proposition] que je vous ai envoyée le [Date].

Avez-vous eu l'occasion d'examiner les détails ? Je serais ravi de répondre à vos éventuelles questions.

Si le timing n'est pas idéal actuellement, n'hésitez pas à me le faire savoir et nous pourrons reprogrammer notre échange.

Dans l'attente de votre retour.

Cordialement,
[Signature]`
  },
  {
    id: 'proposition-collaboration',
    name: 'Proposition de Collaboration',
    category: 'business',
    description: 'Proposition de partenariat ou collaboration',
    subject: 'Opportunité de collaboration - [Projet]',
    tone: 'professional',
    language: 'fr',
    variables: ['Nom', 'Entreprise', 'Projet', 'Avantage Mutuel'],
    content: `Bonjour [Nom],

J'ai suivi avec intérêt le développement de [Entreprise] et je pense qu'une collaboration entre nos deux structures pourrait être mutuellement bénéfique.

Je travaille actuellement sur [Projet] et j'ai identifié plusieurs synergies potentielles, notamment [Avantage Mutuel].

Seriez-vous intéressé(e) par un appel exploratoire pour discuter de cette opportunité ?

Au plaisir d'échanger avec vous.

Cordialement,
[Signature]`
  },
  {
    id: 'demande-temoignage',
    name: 'Demande de Témoignage',
    category: 'business',
    description: 'Demande de témoignage client satisfait',
    subject: 'Votre avis compte pour nous !',
    tone: 'friendly',
    language: 'fr',
    variables: ['Nom', 'Service/Produit'],
    content: `Bonjour [Nom],

J'espère que vous êtes pleinement satisfait(e) de [Service/Produit] !

Votre retour d'expérience serait extrêmement précieux pour nous aider à améliorer nos services et inspirer d'autres entreprises.

Accepteriez-vous de partager un bref témoignage (3-4 lignes) sur votre expérience avec notre solution ?

Je vous remercie par avance pour votre temps.

Bien cordialement,
[Signature]`
  },
  {
    id: 'envoi-facture',
    name: 'Envoi de Facture',
    category: 'business',
    description: 'Envoi de facture professionnel',
    subject: 'Facture N°[Numéro] - [Prestation]',
    tone: 'professional',
    language: 'fr',
    variables: ['Nom', 'Numéro', 'Prestation', 'Montant', 'Date Échéance'],
    content: `Bonjour [Nom],

Veuillez trouver ci-joint la facture N°[Numéro] d'un montant de [Montant] € pour [Prestation].

Date d'échéance : [Date Échéance]

Modalités de paiement :
- Virement bancaire (coordonnées sur la facture)
- Chèque à l'ordre de [Votre Entreprise]

N'hésitez pas à me contacter pour toute question.

Cordialement,
[Signature]`
  },

  // ==================== NETWORKING (5) ====================
  {
    id: 'remerciement-networking',
    name: 'Remerciement Networking',
    category: 'networking',
    description: 'Remerciement après un événement de networking',
    subject: 'Ravi de notre échange lors de [Événement]',
    tone: 'friendly',
    language: 'fr',
    variables: ['Nom', 'Événement', 'Sujet Discussion'],
    content: `Bonjour [Nom],

J'ai beaucoup apprécié notre échange lors de [Événement] hier. Votre perspective sur [Sujet Discussion] était particulièrement intéressante.

Comme évoqué, je serais ravi de poursuivre notre discussion autour d'un café dans les prochaines semaines.

Restons en contact !

Bien cordialement,
[Signature]`
  },
  {
    id: 'recommandation-linkedin',
    name: 'Demande de Recommandation LinkedIn',
    category: 'networking',
    description: 'Demande de recommandation professionnelle',
    subject: 'Demande de recommandation LinkedIn',
    tone: 'friendly',
    language: 'fr',
    variables: ['Nom', 'Projet/Collaboration'],
    content: `Bonjour [Nom],

J'espère que tout va bien de votre côté !

Notre collaboration sur [Projet/Collaboration] a été très enrichissante pour moi. Accepteriez-vous de rédiger une brève recommandation sur mon profil LinkedIn concernant notre travail ensemble ?

Bien entendu, je serais ravi de faire de même pour vous.

Merci d'avance et à très bientôt !

Cordialement,
[Signature]`
  },
  {
    id: 'introduction-contact',
    name: 'Introduction à un Contact',
    category: 'networking',
    description: 'Mise en relation de deux contacts',
    subject: 'Introduction : [Personne 1] ↔ [Personne 2]',
    tone: 'friendly',
    language: 'fr',
    variables: ['Personne 1', 'Personne 2', 'Raison'],
    content: `Bonjour [Personne 1] et [Personne 2],

Je me permets de vous mettre en relation car je pense que vous pourriez mutuellement vous apporter beaucoup.

[Personne 1], [brève présentation et expertise]
[Personne 2], [brève présentation et expertise]

[Raison] : je pense qu'échanger ensemble pourrait ouvrir des opportunités intéressantes.

Je vous laisse poursuivre la conversation directement !

Bonne journée à tous les deux.

Cordialement,
[Signature]`
  },
  {
    id: 'suivi-evenement',
    name: 'Suivi après Événement',
    category: 'networking',
    description: 'Suivi professionnel après une conférence ou salon',
    subject: 'Suite à notre rencontre au [Événement]',
    tone: 'professional',
    language: 'fr',
    variables: ['Nom', 'Événement', 'Projet'],
    content: `Bonjour [Nom],

C'était un plaisir de vous rencontrer lors du [Événement] la semaine dernière.

J'ai beaucoup apprécié notre discussion sur [Projet] et je pense qu'il y a de belles opportunités à explorer ensemble.

Seriez-vous disponible pour un appel de 30 minutes afin de creuser ces idées ?

Au plaisir de vous parler bientôt.

Cordialement,
[Signature]`
  },
  {
    id: 'demande-conseil',
    name: 'Demande de Conseil',
    category: 'networking',
    description: 'Demande de conseil à un expert',
    subject: 'Demande de conseil - [Sujet]',
    tone: 'professional',
    language: 'fr',
    variables: ['Nom', 'Sujet', 'Contexte'],
    content: `Bonjour [Nom],

Je suis en admiration de votre parcours dans [domaine] et je me permets de vous solliciter pour un conseil.

Je travaille actuellement sur [Sujet] et je rencontre [Contexte/Défi]. Votre expertise dans ce domaine pourrait m'être extrêmement précieuse.

Accepteriez-vous un échange téléphonique de 20 minutes dans les prochaines semaines ?

Je comprends que votre temps est précieux et vous en remercie par avance.

Respectueusement,
[Signature]`
  },

  // ==================== CUSTOMER SERVICE (5) ====================
  {
    id: 'reponse-reclamation',
    name: 'Réponse à Réclamation',
    category: 'customer-service',
    description: 'Réponse professionnelle à une réclamation client',
    subject: 'Re: Votre réclamation - [Référence]',
    tone: 'professional',
    language: 'fr',
    variables: ['Nom', 'Référence', 'Problème', 'Solution'],
    content: `Bonjour [Nom],

Nous avons bien pris note de votre réclamation concernant [Problème] (réf: [Référence]).

Nous vous présentons nos sincères excuses pour ce désagrément. Voici les mesures que nous mettons en place immédiatement :

[Solution détaillée]

Nous ferons tout notre possible pour que cette situation ne se reproduise pas. Votre satisfaction est notre priorité.

Nous restons à votre entière disposition pour tout complément d'information.

Cordialement,
[Signature]`
  },
  {
    id: 'annonce-nouveaute',
    name: 'Annonce de Nouveauté',
    category: 'customer-service',
    description: 'Annonce de nouvelle fonctionnalité ou produit',
    subject: '🎉 Nouveauté : [Fonctionnalité/Produit]',
    tone: 'friendly',
    language: 'fr',
    variables: ['Nom', 'Fonctionnalité/Produit', 'Bénéfice'],
    content: `Bonjour [Nom],

Nous sommes ravis de vous annoncer le lancement de [Fonctionnalité/Produit] !

Cette nouveauté vous permettra de [Bénéfice] et améliore considérablement votre expérience.

Principales améliorations :
• [Point 1]
• [Point 2]
• [Point 3]

Vous pouvez dès maintenant découvrir cette nouveauté dans votre espace client.

Bon découverte !

L'équipe [Entreprise]`
  },
  {
    id: 'email-bienvenue',
    name: 'Email de Bienvenue',
    category: 'customer-service',
    description: 'Accueil d\'un nouveau client',
    subject: '👋 Bienvenue chez [Entreprise] !',
    tone: 'friendly',
    language: 'fr',
    variables: ['Nom', 'Entreprise', 'Produit/Service'],
    content: `Bonjour [Nom],

Bienvenue dans la famille [Entreprise] ! 🎉

Nous sommes ravis de vous compter parmi nos clients. Voici quelques ressources pour bien démarrer avec [Produit/Service] :

📚 Guide de démarrage rapide : [lien]
🎥 Tutoriels vidéo : [lien]
💬 Support client : [email/téléphone]

Notre équipe est à votre disposition pour vous accompagner à chaque étape.

N'hésitez pas à nous contacter si vous avez la moindre question !

Excellente journée,
L'équipe [Entreprise]`
  },
  {
    id: 'demande-feedback',
    name: 'Demande de Feedback',
    category: 'customer-service',
    description: 'Sollicitation d\'avis client',
    subject: 'Votre avis nous intéresse - [Produit/Service]',
    tone: 'friendly',
    language: 'fr',
    variables: ['Nom', 'Produit/Service'],
    content: `Bonjour [Nom],

Cela fait maintenant [durée] que vous utilisez [Produit/Service] et nous aimerions connaître votre ressenti.

Pourriez-vous prendre 2 minutes pour répondre à ces 3 questions ?

1. Êtes-vous satisfait(e) de [Produit/Service] ? (1-10)
2. Qu'est-ce que vous appréciez le plus ?
3. Que pourrions-nous améliorer ?

Votre feedback est essentiel pour nous améliorer continuellement.

Merci pour votre temps !

Cordialement,
[Signature]`
  },
  {
    id: 'excuse-retard',
    name: 'Excuse pour Retard',
    category: 'customer-service',
    description: 'Excuses professionnelles pour un retard',
    subject: 'Excuses pour le retard - [Livraison/Projet]',
    tone: 'professional',
    language: 'fr',
    variables: ['Nom', 'Livraison/Projet', 'Raison', 'Nouvelle Date'],
    content: `Bonjour [Nom],

Je vous prie de bien vouloir accepter mes sincères excuses pour le retard concernant [Livraison/Projet].

En raison de [Raison], nous n'avons malheureusement pas pu respecter la date initialement prévue.

Voici notre nouveau calendrier :
Nouvelle date de livraison : [Nouvelle Date]

Pour compenser ce désagrément, nous [geste commercial si applicable].

Nous mettons tout en œuvre pour éviter que cela se reproduise.

Merci pour votre compréhension.

Cordialement,
[Signature]`
  },

  // ==================== MARKETING (5) ====================
  {
    id: 'newsletter-mensuelle',
    name: 'Newsletter Mensuelle',
    category: 'marketing',
    description: 'Newsletter d\'entreprise avec actualités et conseils',
    subject: '📬 [Mois] - Votre newsletter [Entreprise]',
    tone: 'friendly',
    language: 'fr',
    variables: ['Mois', 'Entreprise', 'Titre Principal', 'Contenu', 'CTA'],
    content: `Bonjour,

🎉 Bienvenue dans votre newsletter de [Mois] !

[Titre Principal]

[Contenu - Résumé des actualités, conseils, nouveautés]

📊 Chiffre du mois : [Statistique impressionnante]

💡 Astuce : [Conseil pratique pour vos lecteurs]

🔗 [CTA] : [Lien d'action]

À très bientôt,
L'équipe [Entreprise]

---
Vous recevez cet email car vous êtes inscrit à notre newsletter.
[Lien de désinscription]`
  },
  {
    id: 'lancement-produit',
    name: 'Lancement de Produit',
    category: 'marketing',
    description: 'Annonce de lancement d\'un nouveau produit/service',
    subject: '🚀 Découvrez [Produit] - Disponible maintenant !',
    tone: 'friendly',
    language: 'fr',
    variables: ['Produit', 'Problème Résolu', 'Bénéfice', 'Prix', 'Offre Lancement'],
    content: `Bonjour,

Nous sommes ravis de vous présenter [Produit] ! 🎉

Le problème :
Vous en aviez assez de [Problème Résolu] ? Nous aussi.

La solution :
[Produit] vous permet de [Bénéfice] en toute simplicité.

✨ Principales fonctionnalités :
• [Feature 1]
• [Feature 2]
• [Feature 3]

🎁 Offre de lancement exclusive :
[Offre Lancement] - Valable jusqu'au [Date]

Prix : [Prix] (au lieu de [Prix Normal])

👉 [Bouton CTA : Découvrir maintenant]

Des questions ? Notre équipe est là pour vous aider !

À bientôt,
L'équipe [Entreprise]`
  },
  {
    id: 'campagne-promotionnelle',
    name: 'Campagne Promotionnelle',
    category: 'marketing',
    description: 'Email de promotion avec offre limitée',
    subject: '⚡ [Pourcentage]% de réduction - Offre flash [Durée]',
    tone: 'friendly',
    language: 'fr',
    variables: ['Pourcentage', 'Durée', 'Produit/Service', 'Code Promo', 'Date Fin'],
    content: `Bonjour,

🔥 OFFRE FLASH - [Durée] seulement !

Profitez de [Pourcentage]% de réduction sur [Produit/Service].

Cette offre exceptionnelle se termine le [Date Fin] à minuit.

🎯 Comment en profiter ?
1. Ajoutez vos produits au panier
2. Utilisez le code : [Code Promo]
3. Validez votre commande

💰 Exemple :
[Produit] : [Prix Normal] → [Prix Réduit]

⏰ Plus que [Temps Restant] pour en profiter !

👉 [Bouton CTA : J'en profite maintenant]

Offre non cumulable, valable dans la limite des stocks disponibles.

L'équipe [Entreprise]`
  },
  {
    id: 'cold-email-b2c',
    name: 'Cold Email B2C',
    category: 'marketing',
    description: 'Premier contact client grand public personnalisé',
    subject: '[Prénom], découvrez comment [Bénéfice]',
    tone: 'friendly',
    language: 'fr',
    variables: ['Prénom', 'Bénéfice', 'Produit', 'Preuve Sociale', 'CTA'],
    content: `Bonjour [Prénom],

J'ai remarqué que vous vous intéressez à [domaine/sujet].

Laissez-moi vous présenter [Produit] - la solution qui permet de [Bénéfice].

🌟 Ce que nos clients adorent :
[Preuve Sociale - témoignage, nombre de clients, résultat]

"[Citation client satisfait]" - [Nom Client]

✅ En 3 minutes, vous pourrez :
• [Avantage 1]
• [Avantage 2]
• [Avantage 3]

🎁 Offre spéciale pour vous :
[CTA] - Essai gratuit de 14 jours, sans carte bancaire

Vous avez des questions ? Répondez simplement à cet email, je serai ravi de vous aider !

À très bientôt,
[Signature]

P.S. : Plus de [Nombre] personnes utilisent déjà [Produit] chaque jour !`
  },
  {
    id: 'proposition-partenariat',
    name: 'Proposition de Partenariat Marketing',
    category: 'marketing',
    description: 'Proposition de collaboration marketing entre marques',
    subject: 'Opportunité de partenariat - [Votre Marque] x [Leur Marque]',
    tone: 'professional',
    language: 'fr',
    variables: ['Leur Marque', 'Votre Marque', 'Synergie', 'Audience', 'Proposition'],
    content: `Bonjour,

Je suis [Nom], [Fonction] chez [Votre Marque].

J'admire beaucoup ce que vous faites chez [Leur Marque], notamment [réalisation spécifique].

Je vous contacte car j'ai identifié une belle opportunité de collaboration entre nos deux marques :

🤝 La synergie :
[Synergie - points communs, valeurs partagées, audience similaire]

📊 Nos audiences :
• [Votre Marque] : [Audience - taille, démographie]
• [Leur Marque] : [Audience]

💡 Ma proposition :
[Proposition - co-marketing, bundle produits, webinar commun, etc.]

📈 Bénéfices mutuels :
• Augmentation de la visibilité (+[X]% portée estimée)
• Acquisition de nouveaux clients
• Renforcement de la crédibilité

Seriez-vous intéressé(e) par un appel de 20 minutes pour en discuter ?

Je suis disponible [créneaux] cette semaine.

Au plaisir d'échanger,
[Signature]`
  },

  // ==================== RH / RECRUTEMENT (5) ====================
  {
    id: 'candidature-spontanee',
    name: 'Candidature Spontanée',
    category: 'hr',
    description: 'Candidature spontanée professionnelle',
    subject: 'Candidature spontanée - [Poste]',
    tone: 'professional',
    language: 'fr',
    variables: ['Nom Recruteur', 'Entreprise', 'Poste', 'Compétences'],
    content: `Bonjour [Nom Recruteur],

Votre entreprise [Entreprise] a retenu toute mon attention par [raison spécifique].

Fort(e) de [X années] d'expérience en [domaine], je souhaiterais mettre mes compétences au service de votre équipe, notamment en [Poste].

Mes principales qualifications :
• [Compétences 1]
• [Compétences 2]
• [Compétences 3]

Mon CV ci-joint détaille mon parcours. Je serais ravi(e) d'échanger avec vous sur les opportunités au sein de [Entreprise].

Dans l'attente de votre retour.

Cordialement,
[Signature]`
  },
  {
    id: 'relance-apres-entretien',
    name: 'Relance après Entretien',
    category: 'hr',
    description: 'Relance professionnelle post-entretien',
    subject: 'Suite à notre entretien du [Date]',
    tone: 'professional',
    language: 'fr',
    variables: ['Nom Recruteur', 'Poste', 'Date'],
    content: `Bonjour [Nom Recruteur],

Je vous remercie pour l'entretien du [Date] concernant le poste de [Poste].

Cet échange a renforcé mon intérêt pour rejoindre votre équipe. Le projet [détail discuté] m'enthousiasme particulièrement.

Avez-vous des informations complémentaires à me communiquer concernant la suite du processus de recrutement ?

Je reste à votre disposition pour tout complément d'information.

Cordialement,
[Signature]`
  },
  {
    id: 'acceptation-offre',
    name: 'Acceptation d\'Offre',
    category: 'hr',
    description: 'Acceptation formelle d\'une offre d\'emploi',
    subject: 'Acceptation de votre offre - [Poste]',
    tone: 'professional',
    language: 'fr',
    variables: ['Nom Recruteur', 'Poste', 'Date Début'],
    content: `Bonjour [Nom Recruteur],

C'est avec un grand plaisir que j'accepte votre proposition pour le poste de [Poste].

Je confirme ma prise de fonction le [Date Début] comme convenu.

Je m'engage à vous faire parvenir l'ensemble des documents administratifs nécessaires d'ici [date].

Je suis très enthousiaste à l'idée de rejoindre votre équipe et de contribuer aux succès de l'entreprise.

Je vous remercie pour votre confiance.

Cordialement,
[Signature]`
  },
  {
    id: 'demission',
    name: 'Lettre de Démission',
    category: 'hr',
    description: 'Démission professionnelle et courtoise',
    subject: 'Démission - [Votre Nom]',
    tone: 'formal',
    language: 'fr',
    variables: ['Nom Manager', 'Poste Actuel', 'Préavis'],
    content: `Bonjour [Nom Manager],

Par la présente, je vous informe de ma décision de démissionner de mon poste de [Poste Actuel].

Conformément à mon contrat, je respecterai un préavis de [Préavis], avec une date de départ effective au [date].

Cette décision, mûrement réfléchie, s'inscrit dans le cadre d'un projet professionnel personnel.

Je tiens à vous remercier pour la confiance que vous m'avez accordée et les opportunités d'apprentissage dont j'ai bénéficié.

Je m'engage à assurer une transition optimale de mes dossiers en cours.

Cordialement,
[Signature]`
  },
  {
    id: 'demande-reference',
    name: 'Demande de Référence',
    category: 'hr',
    description: 'Demande de lettre de recommandation',
    subject: 'Demande de lettre de recommandation',
    tone: 'professional',
    language: 'fr',
    variables: ['Nom', 'Période Collaboration', 'Nouveau Poste'],
    content: `Bonjour [Nom],

J'espère que vous allez bien.

Je suis actuellement en processus de recrutement pour un poste de [Nouveau Poste] et je me permets de vous solliciter pour une lettre de recommandation.

Notre collaboration de [Période Collaboration] a été très enrichissante et votre témoignage sur mon travail serait d'une grande valeur.

Si vous acceptez, je peux vous fournir les points spécifiques à mettre en avant si nécessaire.

Je comprends que cela représente un investissement de temps et vous en remercie sincèrement par avance.

Cordialement,
[Signature]`
  }
];

// Fonction helper pour obtenir les templates par catégorie
export function getTemplatesByCategory(category: DefaultTemplate['category']) {
  return defaultTemplates.filter(t => t.category === category);
}

// Fonction helper pour obtenir un template par ID
export function getTemplateById(id: string) {
  return defaultTemplates.find(t => t.id === id);
}

// Fonction pour remplacer les variables dans un template
export function fillTemplate(template: DefaultTemplate, variables: Record<string, string>): string {
  let filledContent = template.content;
  let filledSubject = template.subject;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\[${key}\\]`, 'g');
    filledContent = filledContent.replace(regex, value);
    filledSubject = filledSubject.replace(regex, value);
  });
  
  return filledContent;
}
