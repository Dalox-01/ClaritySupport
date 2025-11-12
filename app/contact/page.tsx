'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Send, CheckCircle2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        toast.success('Message envoyé avec succès !');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        toast.error(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      toast.error('Impossible d\'envoyer le message');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation - Style identique à la page home */}
      <motion.header 
        className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-gray-800 dark:bg-black/80"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <motion.span
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="hidden sm:inline"
              >
                IA mailcenter
              </motion.span>
            </Link>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Retour à l'accueil</span>
                <span className="sm:hidden">Retour</span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Section Contact */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 pt-24 sm:py-20 sm:pt-28">
        <div className="max-w-2xl mx-auto">
          {/* En-tête */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Contactez-nous
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Une question, une suggestion ou besoin d'aide ? Nous sommes là pour vous répondre.
            </p>
          </motion.div>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
            >
              <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                <div className="pt-6 p-3 xxs:p-4 xs:p-6">
                  <div className="flex flex-col items-center text-center space-y-2 xxs:space-y-3 xs:space-y-4">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                      transition={{ duration: 0.6 }}
                    >
                      <CheckCircle2 className="h-10 w-10 xxs:h-12 xxs:w-12 xs:h-16 xs:w-16 text-green-500" />
                    </motion.div>
                    <h2 className="text-lg xxs:text-xl xs:text-2xl font-bold text-gray-900 dark:text-white">
                      Message envoyé !
                    </h2>
                    <p className="text-xs xxs:text-sm xs:text-base text-muted-foreground px-2 xxs:px-4">
                      ✅ Merci pour votre message. Je vous répondrai dans les plus brefs délais.
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button onClick={() => setSubmitted(false)} variant="outline" size="sm" className="text-[10px] xxs:text-xs xs:text-sm h-8 xxs:h-9">
                        Envoyer un autre message
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-2">
                <CardHeader className="p-3 xxs:p-4 xs:p-6">
                  <CardTitle className="text-base xxs:text-lg xs:text-xl">Formulaire de contact</CardTitle>
                  <CardDescription className="text-[10px] xxs:text-xs xs:text-sm">
                    Remplissez le formulaire ci-dessous et je reviendrai vers vous rapidement.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 xxs:p-4 xs:p-6">
                  <form onSubmit={handleSubmit} className="space-y-3 xxs:space-y-4 xs:space-y-6">
                    {/* Nom et Prénom */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xxs:gap-3 xs:gap-4">
                      <div className="space-y-1 xxs:space-y-1.5 xs:space-y-2">
                        <Label htmlFor="firstName" className="text-[10px] xxs:text-xs xs:text-sm">Prénom *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          placeholder="Jean"
                          className="text-xs xxs:text-sm xs:text-base h-8 xxs:h-9 xs:h-10"
                        />
                      </div>
                      <div className="space-y-1 xxs:space-y-1.5 xs:space-y-2">
                        <Label htmlFor="lastName" className="text-[10px] xxs:text-xs xs:text-sm">Nom *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          placeholder="Dupont"
                          className="text-xs xxs:text-sm xs:text-base h-8 xxs:h-9 xs:h-10"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1 xxs:space-y-1.5 xs:space-y-2">
                      <Label htmlFor="email" className="text-[10px] xxs:text-xs xs:text-sm">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="jean.dupont@exemple.fr"
                        className="text-xs xxs:text-sm xs:text-base h-8 xxs:h-9 xs:h-10"
                      />
                    </div>

                    {/* Sujet */}
                    <div className="space-y-1 xxs:space-y-1.5 xs:space-y-2">
                      <Label htmlFor="subject" className="text-[10px] xxs:text-xs xs:text-sm">Sujet *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="Question sur les fonctionnalités"
                        className="text-xs xxs:text-sm xs:text-base h-8 xxs:h-9 xs:h-10"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-1 xxs:space-y-1.5 xs:space-y-2">
                      <Label htmlFor="message" className="text-[10px] xxs:text-xs xs:text-sm">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Décrivez votre demande en détail..."
                        rows={6}
                        className="resize-none text-xs xxs:text-sm xs:text-base"
                      />
                    </div>

                    {/* Bouton d'envoi */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        className="w-full text-xs xxs:text-sm xs:text-base h-9 xxs:h-10 sm:h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white" 
                        size="lg"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="mr-2 h-3.5 w-3.5 xxs:h-4 xxs:w-4 xs:h-5 xs:w-5 animate-spin" />
                            <span>Envoi en cours...</span>
                          </>
                        ) : (
                          <>
                            <Send className="mr-1 xxs:mr-1.5 xs:mr-2 h-3.5 w-3.5 xxs:h-4 xxs:w-4 xs:h-5 xs:w-5" />
                            <span>Envoyer le message</span>
                          </>
                        )}
                      </Button>
                    </motion.div>

                    <p className="text-[10px] xxs:text-xs text-center text-muted-foreground">
                      * Champs obligatoires
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Informations de contact supplémentaires */}
          <motion.div 
            className="mt-4 xxs:mt-6 xs:mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-[10px] xxs:text-xs xs:text-sm text-muted-foreground px-2 xxs:px-4">
              Vous pouvez également me contacter directement par email à{' '}
              <button
                onClick={() => {
                  navigator.clipboard.writeText('clarityteamfr@gmail.com');
                  toast.success('Email copié dans le presse-papier !');
                }}
                className="font-semibold text-primary hover:underline cursor-pointer"
              >
                clarityteamfr@gmail.com
              </button>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
