'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <motion.header 
        className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-gray-800 dark:bg-black/80"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">ClaritySupport</span>
          </Link>
          
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
      </motion.header>

      {/* Contenu */}
      <section className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 pt-24 sm:py-20 sm:pt-28">
        {/* En-tête */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Politique de Confidentialité
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Dernière mise à jour : 12 novembre 2025
          </p>
        </motion.div>

        {/* Sections */}
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Introduction */}
          <Card className="p-6 border-2">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Introduction</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  ClaritySupport s&apos;engage à protéger votre vie privée et vos données personnelles. 
                  Cette politique explique comment nous collectons, utilisons et protégeons vos informations 
                  lorsque vous utilisez notre plateforme de gestion d&apos;emails assistée par IA.
                </p>
              </div>
            </div>
          </Card>

          {/* Données collectées */}
          <Card className="p-6 border-2">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Données collectées</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Informations de compte</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Nom et prénom</li>
                      <li>Adresse email</li>
                      <li>Photo de profil (optionnelle)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Données emails</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Contenu des emails (traités localement)</li>
                      <li>Métadonnées (expéditeur, destinataire, date)</li>
                      <li>Pièces jointes</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Données d&apos;utilisation</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Statistiques d&apos;utilisation</li>
                      <li>Préférences de configuration IA</li>
                      <li>Historique des réponses générées</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Utilisation des données */}
          <Card className="p-6 border-2">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Utilisation des données</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  Nous utilisons vos données uniquement pour :
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li>Fournir et améliorer nos services</li>
                  <li>Générer des réponses automatiques via IA</li>
                  <li>Analyser et catégoriser vos emails</li>
                  <li>Vous contacter concernant votre compte</li>
                  <li>Assurer la sécurité de la plateforme</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Sécurité */}
          <Card className="p-6 border-2">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Sécurité</h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p className="leading-relaxed">
                    Nous mettons en œuvre des mesures de sécurité strictes :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Chiffrement</strong> : Toutes les données sont chiffrées en transit (HTTPS) et au repos (AES-256)</li>
                    <li><strong>Authentification</strong> : OAuth 2.0 sécurisé via Google/Microsoft</li>
                    <li><strong>Isolation</strong> : Vos données sont strictement isolées des autres utilisateurs</li>
                    <li><strong>Conformité RGPD</strong> : Respect total du règlement européen</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Partage des données */}
          <Card className="p-6 border-2">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Partage des données</h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p className="leading-relaxed font-semibold text-gray-900 dark:text-white">
                    Nous ne vendons JAMAIS vos données personnelles.
                  </p>
                  <p className="leading-relaxed">
                    Vos données peuvent être partagées uniquement avec :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>OpenAI</strong> : Pour le traitement IA (vos emails sont anonymisés)</li>
                    <li><strong>Supabase</strong> : Hébergement sécurisé de la base de données</li>
                    <li><strong>Vercel</strong> : Hébergement de l&apos;application</li>
                  </ul>
                  <p className="leading-relaxed text-sm italic">
                    Ces partenaires sont contractuellement tenus de protéger vos données et ne peuvent les utiliser 
                    que pour fournir nos services.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Vos droits */}
          <Card className="p-6 border-2 bg-blue-50 dark:bg-blue-950/20">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Vos droits (RGPD)</h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p className="leading-relaxed">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Droit d&apos;accès</strong> : Obtenir une copie de vos données</li>
                <li><strong>Droit de rectification</strong> : Corriger vos données inexactes</li>
                <li><strong>Droit à l&apos;effacement</strong> : Supprimer votre compte et vos données</li>
                <li><strong>Droit à la portabilité</strong> : Recevoir vos données dans un format exploitable</li>
                <li><strong>Droit d&apos;opposition</strong> : Vous opposer au traitement de vos données</li>
              </ul>
              <p className="leading-relaxed pt-3">
                Pour exercer vos droits, contactez-nous à : <strong>clarityteamfr@gmail.com</strong>
              </p>
            </div>
          </Card>

          {/* Cookies */}
          <Card className="p-6 border-2">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Cookies</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Nous utilisons uniquement des cookies essentiels pour l&apos;authentification et le fonctionnement 
              de la plateforme. Aucun cookie de tracking publicitaire n&apos;est utilisé.
            </p>
          </Card>

          {/* Contact */}
          <Card className="p-6 border-2 border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Nous contacter</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
            </p>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
              <Mail className="w-5 h-5" />
              <a href="mailto:clarityteamfr@gmail.com" className="hover:underline">
                clarityteamfr@gmail.com
              </a>
            </div>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
