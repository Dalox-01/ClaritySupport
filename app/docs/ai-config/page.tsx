'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Thermometer, Hash, Target, Zap, Database, Brain, Settings, Shield, Activity, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function AIConfigDocumentation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/mail-center">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Fiches Techniques - Configuration IA
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Guide complet des paramètres de configuration de l'intelligence artificielle
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        
        {/* Section 1: Modèles & Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 border-blue-200 dark:border-blue-900">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold">Modèles & Performance</h2>
            </div>

            <div className="space-y-6">
              {/* Température */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-lg">Température</h3>
                  <Badge variant="outline">0.0 - 2.0</Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <strong>Rôle :</strong> Contrôle la créativité vs la précision des réponses de l'IA.
                </p>
                <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>0.0 - 0.3 :</strong> Très précis et déterministe. Idéal pour SAV technique, FAQ, réponses factuelles.</li>
                  <li><strong>0.4 - 0.7 :</strong> Équilibré. Bon compromis pour le support client général.</li>
                  <li><strong>0.8 - 1.2 :</strong> Plus créatif. Utile pour personnaliser les réponses, ton amical.</li>
                  <li><strong>1.3 - 2.0 :</strong> Très créatif mais moins prévisible. À éviter pour le support client.</li>
                </ul>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 <strong>Recommandation :</strong> Utilisez 0.6-0.7 pour un support client professionnel et fiable.
                  </p>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-lg">Tokens Maximum</h3>
                  <Badge variant="outline">100 - 8000</Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <strong>Rôle :</strong> Limite la longueur maximale de la réponse générée.
                </p>
                <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>100-300 tokens :</strong> Réponses courtes et concises (~75-200 mots)</li>
                  <li><strong>300-800 tokens :</strong> Réponses moyennes détaillées (~200-600 mots)</li>
                  <li><strong>800-2000 tokens :</strong> Réponses longues et complètes (~600-1500 mots)</li>
                  <li><strong>2000+ tokens :</strong> Réponses très détaillées (guides, explications techniques)</li>
                </ul>
                <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    💡 <strong>Recommandation :</strong> 500-1000 tokens suffisent pour 90% des cas de support client.
                  </p>
                </div>
              </div>

              {/* Top P */}
              <div className="border-l-4 border-cyan-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-cyan-500" />
                  <h3 className="font-semibold text-lg">Top P (Nucleus Sampling)</h3>
                  <Badge variant="outline">0.0 - 1.0</Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <strong>Rôle :</strong> Contrôle la diversité du vocabulaire utilisé par l'IA.
                </p>
                <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>0.1 - 0.5 :</strong> Vocabulaire restreint, réponses très cohérentes et prévisibles</li>
                  <li><strong>0.6 - 0.9 :</strong> Bon équilibre entre cohérence et variété lexicale</li>
                  <li><strong>0.9 - 1.0 :</strong> Vocabulaire très varié, réponses plus originales</li>
                </ul>
                <div className="mt-3 p-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg">
                  <p className="text-xs text-cyan-700 dark:text-cyan-300">
                    💡 <strong>Recommandation :</strong> Laisser à 1.0 dans la plupart des cas. Ajustez la température plutôt que Top P.
                  </p>
                </div>
              </div>

              {/* Pénalités */}
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-lg">Pénalités de Fréquence et Présence</h3>
                  <Badge variant="outline">-2.0 - 2.0</Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <strong>Rôle :</strong> Évitent les répétitions dans les réponses.
                </p>
                <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Frequency Penalty :</strong> Pénalise les mots déjà utilisés en fonction de leur fréquence</li>
                  <li><strong>Presence Penalty :</strong> Pénalise les mots déjà utilisés, peu importe leur fréquence</li>
                  <li><strong>Valeur positive (0.1-1.0) :</strong> Encourage la diversité, évite les répétitions</li>
                  <li><strong>Valeur négative :</strong> Autorise plus de répétitions (rare)</li>
                  <li><strong>0.0 :</strong> Aucune pénalité</li>
                </ul>
                <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    💡 <strong>Recommandation :</strong> 0.3-0.5 pour frequency penalty, 0.0-0.2 pour presence penalty.
                  </p>
                </div>
              </div>

              {/* Cache Intelligent */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-lg">Cache Intelligent</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <strong>Rôle :</strong> Met en cache les réponses pour accélérer les requêtes similaires.
                </p>
                <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>TTL (Time To Live) :</strong> Durée de conservation du cache en secondes (ex: 3600 = 1h)</li>
                  <li><strong>Cache Sémantique :</strong> Compare le sens des questions, pas juste le texte exact</li>
                  <li><strong>Avantages :</strong> Réduction des coûts API, réponses instantanées, cohérence</li>
                </ul>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 <strong>Recommandation :</strong> Activez avec TTL de 1-6h pour FAQ et questions récurrentes.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Section 2: Prompts & Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 border-purple-200 dark:border-purple-900">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold">Prompts & Style de Réponse</h2>
            </div>

            <div className="space-y-6">
              {/* Humanisation */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">Niveau d'Humanisation</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <strong>Rôle :</strong> Définit à quel point les réponses semblent naturelles et humaines.
                </p>
                <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Robotique :</strong> Réponses techniques, directes, sans fioritures</li>
                  <li><strong>Peu humain :</strong> Réponses claires mais formelles</li>
                  <li><strong>Équilibré :</strong> Ton professionnel avec une touche personnelle</li>
                  <li><strong>Humain :</strong> Empathique, naturel, conversationnel</li>
                  <li><strong>Très humain :</strong> Très chaleureux, émotions marquées, langage fluide</li>
                </ul>
              </div>

              {/* Longueur de réponse */}
              <div className="border-l-4 border-pink-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">Longueur de Réponse</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <strong>Rôle :</strong> Guide pour la verbosité des réponses (indépendant de Max Tokens).
                </p>
                <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Très court :</strong> 1-2 phrases maximum</li>
                  <li><strong>Court :</strong> 2-4 phrases, essentiel uniquement</li>
                  <li><strong>Normal :</strong> 1 paragraphe structuré</li>
                  <li><strong>Détaillé :</strong> 2-3 paragraphes avec explications</li>
                  <li><strong>Complet :</strong> Guide détaillé, étapes, exemples</li>
                </ul>
              </div>

              {/* Formalité */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">Niveau de Formalité</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <strong>Rôle :</strong> Ton général des réponses (tutoiement vs vouvoiement, formules).
                </p>
                <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Très formel :</strong> Vouvoiement systématique, langage soutenu</li>
                  <li><strong>Formel :</strong> Professionnel classique</li>
                  <li><strong>Neutre :</strong> Équilibré, adaptable</li>
                  <li><strong>Casual :</strong> Décontracté, tutoiement possible</li>
                  <li><strong>Très casual :</strong> Très amical, langage courant</li>
                </ul>
              </div>

              {/* Ton émotionnel */}
              <div className="border-l-4 border-cyan-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">Ton Émotionnel</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <strong>Rôle :</strong> Émotion dominante à transmettre dans les réponses.
                </p>
                <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                  <li><strong>Neutre :</strong> Factuel, objectif</li>
                  <li><strong>Empathique :</strong> Compréhension, écoute active</li>
                  <li><strong>Enthousiaste :</strong> Positif, énergique, motivant</li>
                  <li><strong>Rassurant :</strong> Apaisant, sécurisant, confiant</li>
                  <li><strong>Apologétique :</strong> Désolé, présenteexcuses, responsabilité</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Section 3: Tests & Analyse */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 border-pink-200 dark:border-pink-900">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-bold">Tests & Analyse</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Playground de Test :</strong> Testez vos configurations en temps réel avant de les appliquer.
              </p>
              <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300 list-disc list-inside">
                <li>Entrez un message client réel pour voir la réponse générée</li>
                <li>Analysez les métriques : confiance, latence, tokens utilisés, coût</li>
                <li>Mode Debug affiche les paramètres exacts envoyés à l'API</li>
                <li>Comparez différentes configurations pour optimiser vos résultats</li>
              </ul>
            </div>
          </Card>
        </motion.div>

        {/* Section 4: Sécurité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 border-red-200 dark:border-red-900">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold">Sécurité & RGPD</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Clé API :</strong> Votre clé OpenAI est stockée de manière sécurisée côté serveur. 
                Elle n'est jamais exposée dans le navigateur.
              </p>
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                <p className="text-sm text-red-700 dark:text-red-300">
                  ⚠️ <strong>Important :</strong> Toutes les configurations sont sauvegardées localement et synchronisées 
                  de manière sécurisée. Les données sensibles sont chiffrées.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
          <p>
            Pour plus d'informations, consultez la{' '}
            <a href="https://platform.openai.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              documentation officielle OpenAI
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
