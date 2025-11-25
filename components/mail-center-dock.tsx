// Composant: MailCenter Dock Navigation
// Barre de navigation en bas de l'écran (style macOS)

'use client';

import { Inbox, ShoppingCart, CheckCircle, BarChart3 } from 'lucide-react';
import Dock, { type DockItemData } from '@/components/ui/dock/Dock';

type MailCenterDockProps = {
  currentView: 'inbox' | 'boutique' | 'validation' | 'stats';
  onViewChange: (view: 'inbox' | 'boutique' | 'validation' | 'stats') => void;
};

export default function MailCenterDock({ currentView, onViewChange }: MailCenterDockProps) {
  const items: DockItemData[] = [
    {
      icon: <Inbox size={20} />,
      label: 'Inbox',
      onClick: () => onViewChange('inbox'),
      className: currentView === 'inbox' ? 'dock-item-active' : '',
    },
    {
      icon: <ShoppingCart size={20} />,
      label: 'Boutique',
      onClick: () => onViewChange('boutique'),
      className: currentView === 'boutique' ? 'dock-item-active' : '',
    },
    {
      icon: <CheckCircle size={20} />,
      label: 'Validation',
      onClick: () => onViewChange('validation'),
      className: currentView === 'validation' ? 'dock-item-active' : '',
    },
    {
      icon: <BarChart3 size={20} />,
      label: 'Stats',
      onClick: () => onViewChange('stats'),
      className: currentView === 'stats' ? 'dock-item-active' : '',
    },
  ];

  return (
    <Dock
      items={items}
      panelHeight={68}
      baseItemSize={50}
      magnification={70}
      distance={200}
    />
  );
}
