import React, { useEffect, useState } from 'react';
import { IonIcon, IonItem, IonLabel, IonToggle } from '@ionic/react';
import { moon, sunny } from 'ionicons/icons';
import { ThemeService } from '../services/ThemeServices';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const currentTheme = ThemeService.getCurrentTheme();
    setIsDarkMode(currentTheme === ThemeService.THEMES.DARK);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // אם לא הוגדרה העדפת משתמש
      if (!localStorage.getItem('theme-preference')) {
        const newTheme = e.matches ? ThemeService.THEMES.DARK : ThemeService.THEMES.LIGHT;
        ThemeService.setTheme(newTheme);
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const handleToggleChange = () => {
    const newTheme = ThemeService.toggleTheme();
    setIsDarkMode(newTheme === ThemeService.THEMES.DARK);
  };
  
  return (
    <IonItem lines="none" className="theme-toggle-item">
      <IonIcon 
        slot="start" 
        icon={sunny} 
        className={isDarkMode ? 'theme-icon dimmed' : 'theme-icon active'} 
      />
      <IonLabel>מצב כהה</IonLabel>
      <IonToggle 
        checked={isDarkMode} 
        onIonChange={handleToggleChange} 
        slot="end"
      />
      <IonIcon 
        slot="end" 
        icon={moon} 
        className={isDarkMode ? 'theme-icon active' : 'theme-icon dimmed'} 
      />
    </IonItem>
  );
};

export default ThemeToggle;