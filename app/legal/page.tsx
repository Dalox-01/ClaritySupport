'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Scale, Building2, FileText, AlertCircle, Copyright, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LegalPage() {
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
            <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
            <Scale className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Mentions Légales
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Informations légales et conditions d'utilisation
          </p>
        </motion.div>

        {/* Sections */}
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Éditeur */}
          <Card className="p-6 border-2">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Éditeur du site</h2>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <p><strong>Nom :</strong> ClaritySupport</p>
                  <p><strong>Type :</strong> Service SaaS de gestion d'emails assistée par IA</p>
                  <p><strong>Contact :</strong> clarityteamfr@gmail.com</p>
                  <p><strong>Site web :</strong> https://www.claritysupport.app</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Hébergement */}
          <Card className="p-6 border-2">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Hébergement</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Application web :</p>
                    <p>Vercel Inc.</p>
                    <p>340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                    <p className="text-sm">https://vercel.com</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Base de données :</p>
                    <p>Supabase Inc.</p>
                    <p>970 Toa Payoh North, #07-04, Singapore 318992</p>
                    <p className="text-sm">https://supabase.com</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Propriété intellectuelle */}
          <Card className="p-6 border-2">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Copyright className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Propriété intellectuelle</h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p className="leading-relaxed">
                    L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, mise en page, code source) 
                    est la propriété exclusive de ClaritySupport, sauf mention contraire.
                  </p>
                  <p className="leading-relaxed">
                    Toute reproduction, distribution, modification, adaptation, retransmission ou publication, 
                    même partielle, de ces différents éléments est strictement interdite sans l'accord exprès 
                    par écrit de ClaritySupport.
                  </p>
                  <p className="leading-relaxed font-semibold text-gray-900 dark:text-white">
                    © 2025 ClaritySupport - Tous droits réservés
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Conditions d'utilisation */}
          <Card className="p-6 border-2">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Conditions d'utilisation</h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Accès au service</h3>
                    <p className="leading-relaxed">
                      L'accès à ClaritySupport nécessite la création d'un compte via Google ou Microsoft OAuth. 
                      Vous êtes responsable de la confidentialité de vos identifiants.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Utilisation acceptable</h3>
                    <p className="leading-relaxed">Vous vous engagez à :</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                      <li>Utiliser le service de manière légale et éthique</li>
                      <li>Ne pas tenter de contourner les mesures de sécurité</li>
                      <li>Ne pas utiliser le service pour du spam ou du phishing</li>
                      <li>Respecter les droits de propriété intellectuelle</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Données personnelles</h3>
                    <p className="leading-relaxed">
                      Le traitement de vos données personnelles est détaillé dans notre{' '}
                      <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                        Politique de Confidentialité
                      </Link>.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4. Abonnements et paiements</h3>
                    <p className="leading-relaxed">
                      Les abonnements sont gérés via Stripe. Les paiements sont sécurisés et conformes aux normes PCI-DSS. 
                      Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Responsabilité */}
          <Card className="p-6 border-2">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Limitation de responsabilité</h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <p className="leading-relaxed">
                    ClaritySupport met tout en œuvre pour assurer la disponibilité et la sécurité du service, 
                    mais ne peut garantir :
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Une disponibilité 100% sans interruption</li>
                    <li>L'absence totale de bugs ou d'erreurs</li>
                    <li>La précision absolue des réponses générées par l'IA</li>
                  </ul>
                  <p className="leading-relaxed font-semibold text-gray-900 dark:text-white mt-4">
                    Important : Les réponses générées par l'IA doivent toujours être vérifiées avant envoi. 
                    Vous restez responsable du contenu des emails envoyés depuis votre compte.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Droit applicable */}
          <Card className="p-6 border-2">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Droit applicable</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Les présentes mentions légales sont régies par le droit français. 
              En cas de litige, et à défaut d'accord amiable, les tribunaux français seront seuls compétents.
            </p>
          </Card>

          {/* RGPD */}
          <Card className="p-6 border-2 bg-blue-50 dark:bg-blue-950/20">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Conformité RGPD</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              ClaritySupport est conforme au Règlement Général sur la Protection des Données (RGPD). 
              Pour toute question concernant vos données personnelles ou pour exercer vos droits :
            </p>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
              <Mail className="w-5 h-5" />
              <a href="mailto:clarityteamfr@gmail.com" className="hover:underline">
                clarityteamfr@gmail.com
              </a>
            </div>
          </Card>

          {/* Modification */}
          <Card className="p-6 border-2 border-orange-200 dark:border-orange-800">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Modifications</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              ClaritySupport se réserve le droit de modifier ces mentions légales à tout moment. 
              Les utilisateurs seront informés des modifications importantes par email. 
              La version en vigueur est toujours celle accessible sur cette page.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              Dernière mise à jour : 12 novembre 2025
            </p>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
