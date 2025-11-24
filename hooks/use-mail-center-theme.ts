'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { detectSegmentFromPlan, THEME_COLORS, type ThemeType, type ThemeColors } from '@/lib/theme-config';

export function useMailCenterTheme() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<ThemeType>('default');
  const [colors, setColors] = useState<ThemeColors>(THEME_COLORS.default);

  useEffect(() => {
    // Détecter le plan de l'utilisateur
    const userPlan = session?.user?.plan;
    const detectedTheme = detectSegmentFromPlan(userPlan);
    
    setTheme(detectedTheme);
    setColors(THEME_COLORS[detectedTheme]);
  }, [session?.user?.plan]);

  return {
    theme,
    colors,
    themeName: colors.name,
  };
}
