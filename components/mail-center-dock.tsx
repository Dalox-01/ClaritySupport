// Composant: MailCenter Dock Navigation
// Barre de navigation en bas de l'écran (style macOS)

'use client';

import { Inbox, ShoppingCart, CheckCircle, BarChart3, Home } from 'lucide-react';
import Dock, { type DockItemData } from '@/components/ui/dock/Dock';
import { useRouter } from 'next/navigation';

type MailCenterDockProps = {
  currentView: 'inbox' | 'shops' | 'pending' | 'analytics' | 'sent' | 'rules' | 'favorites' | 'archives';
  onViewChange: (view: 'inbox' | 'shops' | 'pending' | 'analytics') => void;
  isLightMode?: boolean;
};

export function MailCenterDock({ currentView, onViewChange, isLightMode = false }: MailCenterDockProps) {
  const router = useRouter();
  const items: DockItemData[] = [
    {
      icon: <Home size={20} />,
      label: 'Accueil',
      onClick: () => router.push('/'),
      className: '',
    },
    {
      icon: <Inbox size={20} />,
      label: 'Inbox',
      onClick: () => onViewChange('inbox'),
      className: currentView === 'inbox' ? 'dock-item-active' : '',
    },
    {
      icon: <ShoppingCart size={20} />,
      label: 'Boutique',
      onClick: () => onViewChange('shops'),
      className: currentView === 'shops' ? 'dock-item-active' : '',
    },
    {
      icon: <CheckCircle size={20} />,
      label: 'Validation',
      onClick: () => onViewChange('pending'),
      className: currentView === 'pending' ? 'dock-item-active' : '',
    },
    {
      icon: <BarChart3 size={20} />,
      label: 'Stats',
      onClick: () => onViewChange('analytics'),
      className: currentView === 'analytics' ? 'dock-item-active' : '',
    },
  ];

  return (
    <Dock
      items={items}
      panelHeight={68}
      baseItemSize={50}
      magnification={70}
      distance={200}
      isLightMode={isLightMode}
    />
  );
}
