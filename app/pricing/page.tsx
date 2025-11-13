'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SegmentType, PRICING_SEGMENTS } from '@/lib/constants/pricing';
import PricingSegmentSelector from '@/components/pricing/PricingSegmentSelector';
import PricingPlans from '@/components/pricing/PricingPlans';

export default function PricingPage() {
  const [activeSegment, setActiveSegment] = useState<SegmentType>('shopify');

  const currentPlans =
    PRICING_SEGMENTS.find((s) => s.id === activeSegment)?.plans || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 py-16 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Tarification Simple & Transparente
            </span>
          </motion.h1>
          
          <motion.p
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Choisissez le plan parfait pour votre activité. 
            <br className="hidden sm:block" />
            Changez ou annulez à tout moment, sans engagement.
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-gray-600"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Essai gratuit 14 jours</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Annulation en 1 clic</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Segment Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <PricingSegmentSelector
            activeSegment={activeSegment}
            onSegmentChange={setActiveSegment}
          />
        </motion.div>

        {/* Pricing Plans with 3D rotation */}
        <PricingPlans plans={currentPlans} segmentId={activeSegment} />

        {/* FAQ / Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-200 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
              Des questions sur nos offres ?
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Notre équipe est disponible pour vous aider à choisir le plan idéal pour votre activité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                Contacter un conseiller
              </button>
              <button className="px-8 py-3 bg-white border-2 border-purple-600 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-300">
                Voir la FAQ
              </button>
            </div>
          </div>
        </motion.div>

        {/* Garantie satisfaction */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-12 text-center text-gray-600"
        >
          <p className="text-sm">
            🛡️ Garantie satisfait ou remboursé 30 jours • 🔒 Paiement sécurisé • 🇫🇷 Support en français
          </p>
        </motion.div>
      </div>
    </div>
  );
}
