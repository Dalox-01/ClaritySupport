'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useAnimationFrame, useTransform } from 'framer-motion';
import { Star, X, Send, MessageSquareQuote, User } from 'lucide-react';
import { toast } from 'sonner';

const REVIEWS = [
  {
    id: 1,
    name: "Sophie_M",
    avatar: "https://images.unsplash.com/photo-1490750967868-58cb75069ed6?auto=format&fit=crop&q=80&w=150&h=150",
    content: "Franchement, j'étais sceptique sur l'IA, mais là... ça m'a sauvé mon Black Friday. Ça répond mieux que moi quand je suis fatiguée 😅",
    rating: 5
  },
  {
    id: 2,
    name: "TomDuWeb",
    avatar: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&q=80&w=150&h=150",
    content: "Configuré en 5 min. Mes clients captent même pas que c'est un robot. Le truc pour les réponses automatiques, c'est une tuerie.",
    rating: 5
  },
  {
    id: 3,
    name: "Julie L.",
    avatar: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=150&h=150",
    content: "Ça fait le taf. Je gagne facile 2h par jour. Juste dommage qu'on puisse pas encore personnaliser plus les couleurs des mails, mais le support m'a dit que ça arrivait.",
    rating: 4
  },
  {
    id: 4,
    name: "Marc_Dropship",
    avatar: "https://images.unsplash.com/photo-1508138221679-760a23a2285b?auto=format&fit=crop&q=80&w=150&h=150",
    content: "L'outil est propre. J'ai eu un petit souci de config au début, réglé en 10 min avec leur équipe. Depuis ça tourne tout seul.",
    rating: 4
  },
  {
    id: 5,
    name: "Emma32",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=150&h=150",
    content: "J'avais peur que ça fasse trop 'robot' mais en fait c'est super naturel. Mes clientes sont contentes d'avoir une réponse le dimanche soir !",
    rating: 5
  },
  {
    id: 6,
    name: "Alexandre B.",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150&h=150",
    content: "Validé. Le ROI est là. Rien que pour la gestion des 'Où est ma commande ?', ça vaut le coup.",
    rating: 5
  }
];

export function ReviewsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Animation logic for smooth marquee
  const x = useMotionValue(0);
  const xPercent = useTransform(x, (v) => `${v}%`);
  
  // Vitesse ajustée pour le mode pourcentage (0.01 est très rapide)
  const fastSpeed = 0.0025; 
  const slowSpeed = 0.0005; 
  
  // Transition plus réactive (stiffness plus élevé)
  const speed = useSpring(fastSpeed, { stiffness: 200, damping: 40 });

  useEffect(() => {
    speed.set(isHovered ? slowSpeed : fastSpeed);
  }, [isHovered, speed]);

  useAnimationFrame((time, delta) => {
    let newX = x.get() - (speed.get() * delta);
    if (newX <= -50) {
      newX = 0;
    }
    x.set(newX);
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    content: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'envoi (à remplacer par un vrai appel API)
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success("Avis envoyé avec succès !", {
      description: "Merci pour votre retour. Il sera traité par notre équipe."
    });

    setIsSubmitting(false);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', rating: 5, content: '' });
  };

  return (
    <section className="relative overflow-hidden bg-gray-50 py-24 dark:bg-[#0A0E27]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 mb-6"
          >
            <MessageSquareQuote className="h-4 w-4" />
            Témoignages
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
          >
            Ils ont transformé leur{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              support client
            </span>
          </motion.h2>
        </div>

        {/* Marquee Container */}
        <div 
          className="relative -mx-4 flex overflow-hidden sm:-mx-6 lg:-mx-8"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-gray-50 to-transparent dark:from-[#0A0E27]" />
          <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-gray-50 to-transparent dark:from-[#0A0E27]" />

          <motion.div
            className="flex gap-6 px-4"
            style={{ x: xPercent }}
          >
            {[...REVIEWS, ...REVIEWS].map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className="w-[350px] flex-shrink-0"
              >
                <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-blue-500/20 dark:bg-slate-900/95">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-blue-100 dark:border-blue-900">
                      <img 
                        src={review.avatar} 
                        alt={review.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{review.name}</h3>
                      </div>
                    </div>                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>

                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    &quot;{review.content}&quot;
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-gray-900 shadow-lg ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:ring-blue-300 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700 dark:hover:ring-blue-500"
          >
            <Send className="h-4 w-4 text-blue-500" />
            Donner mon avis
          </motion.button>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Votre avis compte pour nous. Il sera lu par notre équipe produit.
          </p>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
            >
              <div className="relative p-6 sm:p-8">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Partagez votre expérience</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Dites-nous ce que vous pensez de ClaritySupport.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Note</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({...formData, rating: star})}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              star <= formData.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Votre avis</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.content}
                      onChange={e => setFormData({...formData, content: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="Qu'est-ce qui vous plaît le plus dans ClaritySupport ?"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-70"
                    >
                      {isSubmitting ? 'Envoi en cours...' : 'Envoyer mon avis'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
