'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: 'welcome',
    title: '👋 Bienvenue sur MailWizard !',
    content: 'Bienvenue sur MailWizard, votre assistant IA pour générer des emails professionnels en quelques secondes. Laissez-moi vous faire une visite guidée !',
    position: 'bottom',
  },
  {
    target: '[data-tour="email-type"]',
    title: '📧 Type d&apos;email',
    content: 'Choisissez parmi 6 types d&apos;emails : Candidature, Relance, Prospection, Support client, Réponse client, et Négociation.',
    position: 'right',
  },
  {
    target: '[data-tour="tone"]',
    title: '🎯 Ton et Style',
    content: 'Personnalisez le ton (Professionnel, Cordial, Direct) et le style d&apos;écriture (Formel, Créatif, Technique, Commercial) de votre email.',
    position: 'right',
  },
  {
    target: '[data-tour="context"]',
    title: '📝 Contexte',
    content: 'Décrivez le contexte de votre email. Plus vous donnez de détails, meilleur sera le résultat !',
    position: 'right',
  },
  {
    target: '[data-tour="generate"]',
    title: '✨ Génération',
    content: 'Cliquez ici pour générer votre email. L&apos;IA créera un email complet et professionnel basé sur vos paramètres.',
    position: 'top',
  },
  {
    target: '[data-tour="result"]',
    title: '📄 Résultat',
    content: 'Votre email apparaîtra ici. Vous pourrez le modifier, le sauvegarder, le copier ou l&apos;envoyer directement via Gmail.',
    position: 'left',
  },
  {
    target: '[data-tour="chat"]',
    title: '💬 Assistant IA',
    content: 'Utilisez le chat IA pour affiner votre email en temps réel. Demandez des modifications, changez le ton, raccourcissez, etc.',
    position: 'bottom',
  },
  {
    target: '[data-tour="usage"]',
    title: '📊 Utilisation',
    content: 'Suivez votre utilisation mensuelle ici. Plan gratuit : 10 emails/mois. Plan Starter : 500 emails/mois. Plan Pro : 5000 emails/mois !',
    position: 'right',
  },
  {
    target: 'finish',
    title: '🎉 C&apos;est parti !',
    content: 'Vous êtes prêt ! Commencez à générer des emails professionnels en quelques secondes. Besoin d&apos;aide ? Consultez la section Support.',
    position: 'bottom',
  },
];

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('mailwiz-tour-completed');
    if (!hasSeenTour) {
      // Attendre un peu avant de démarrer le tour
      setTimeout(() => setIsActive(true), 1000);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const step = tourSteps[currentStep];
    if (step.target === 'welcome' || step.target === 'finish') {
      // Centrer la carte pour les étapes spéciales
      setPosition({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200,
      });
      return;
    }

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      let top = rect.top + scrollTop;
      let left = rect.left + scrollLeft;

      // Ajuster la position selon le côté souhaité
      switch (step.position) {
        case 'right':
          top += rect.height / 2 - 100;
          left += rect.width + 20;
          break;
        case 'left':
          top += rect.height / 2 - 100;
          left -= 420;
          break;
        case 'top':
          top -= 220;
          left += rect.width / 2 - 200;
          break;
        case 'bottom':
        default:
          top += rect.height + 20;
          left += rect.width / 2 - 200;
          break;
      }

      setPosition({ top, left });

      // Scroll vers l'élément
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Highlight l'élément
      element.classList.add('tour-highlight');
      return () => {
        element.classList.remove('tour-highlight');
      };
    }
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem('mailwiz-tour-completed', 'true');
    setIsActive(false);
  };

  const skipTour = () => {
    localStorage.setItem('mailwiz-tour-completed', 'true');
    setIsActive(false);
  };

  if (!isActive) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 tour-overlay" onClick={skipTour} />

      {/* Tour Card */}
      <Card
        className="fixed z-50 w-96 shadow-2xl tour-card"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">
                Étape {currentStep + 1} sur {tourSteps.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={skipTour}
              className="h-6 w-6 -mt-1 -mr-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm mb-6 leading-relaxed">{step.content}</p>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>

            <div className="flex gap-1">
              {tourSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    idx === currentStep ? 'bg-primary w-4' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {currentStep === tourSteps.length - 1 ? 'Terminer' : 'Suivant'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 45 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3) !important;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
}
