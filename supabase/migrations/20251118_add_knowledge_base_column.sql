-- Migration: Ajouter colonne knowledge_base à la table users
-- Date: 2025-11-18
-- Description: Stockage de la base de connaissances (produits, FAQ, règles métier) pour l'IA

-- Ajouter la colonne knowledge_base (JSONB)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS knowledge_base JSONB;

-- Commentaire explicatif
COMMENT ON COLUMN users.knowledge_base IS 'Base de connaissances (produits, FAQ, règles métier) utilisée par l''IA pour générer des réponses précises';

-- Index pour améliorer les performances des requêtes JSONB
CREATE INDEX IF NOT EXISTS idx_users_knowledge_base ON users USING GIN (knowledge_base);

-- Exemple de structure JSON attendue:
-- {
--   "products": [
--     {
--       "id": "prod-123",
--       "name": "Produit Exemple",
--       "description": "Description du produit",
--       "price": 49.99,
--       "features": ["Feature 1", "Feature 2"],
--       "faq": [{"question": "Comment utiliser ?", "answer": "..."}],
--       "commonIssues": [{"problem": "Bug X", "solution": "Solution Y"}]
--     }
--   ],
--   "companyInfo": {
--     "name": "Mon Entreprise",
--     "returnPolicy": "30 jours de retour",
--     "shippingPolicy": "Livraison gratuite > 50€",
--     "warrantyPolicy": "Garantie 2 ans"
--   },
--   "generalFAQ": [
--     {"question": "Quels modes de paiement ?", "answer": "CB, PayPal, virement"}
--   ],
--   "businessRules": [
--     "Retours acceptés sous 30 jours",
--     "Livraison gratuite > 50€",
--     "Garantie 2 ans sur tous les produits"
--   ]
-- }
