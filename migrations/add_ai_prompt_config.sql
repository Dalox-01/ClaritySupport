-- Migration: Ajouter colonne ai_prompt_config à la table users
-- Cette colonne stocke la configuration complète des prompts IA (créativité, ton, style, do/don't lists, etc.)

-- Ajouter la colonne JSONB pour stocker AIPromptConfig
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ai_prompt_config JSONB DEFAULT NULL;

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_users_ai_prompt_config ON users USING GIN (ai_prompt_config);

-- Commentaire sur la colonne
COMMENT ON COLUMN users.ai_prompt_config IS 'Configuration des prompts IA: créativité (0-1), ton, style, longueur, do/don''t lists, signature, etc.';

-- Exemple de structure attendue (pour documentation):
/*
{
  "tone": "professionnel" | "amical" | "formel" | "décontracté" | "enthousiaste" | "empathique",
  "style": "concis" | "détaillé" | "narratif" | "technique" | "commercial" | "éducatif",
  "length": "court" | "moyen" | "long",
  "creativity": 0.0 - 1.0,  // 0 = précis/brut, 1 = créatif
  "language": "fr" | "en",
  "companyName": "string",
  "customInstructions": "string",
  "doList": ["string"],      // Ce qu'on doit faire
  "dontList": ["string"],    // Ce qu'on ne doit pas faire
  "signature": "string",
  "examples": [              // Exemples de paires question/réponse
    {
      "input": "string",
      "output": "string"
    }
  ],
  "categoryTemplates": {     // Prompts spécifiques par catégorie
    "support_ticket": "string",
    "sales_inquiry": "string",
    // ... autres catégories
  }
}
*/
