import React, { useEffect } from 'react';
import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { setupIonicReact } from '@ionic/react';
import { LocalNotifications } from '@capacitor/local-notifications';
import AppRouting from './AppRouting';
import { TaskProvider } from './contexts/TaskCont';
import { ThemeService } from './services/ThemeServices';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';
import './theme/theme.css';

// אתחול Ionic React - חשוב לעשות זאת לפני רינדור האפליקציה
setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    ThemeService.applyPreferredTheme();
    
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      document.documentElement.style.setProperty('--app-font-size', `${savedFontSize}px`);
    }
    
    const savedFontFamily = localStorage.getItem('fontFamily');
    if (savedFontFamily && savedFontFamily !== 'default') {
      document.documentElement.style.setProperty('--ion-font-family', savedFontFamily);
    }
    
    const savedPrimaryColor = localStorage.getItem('primaryColor');
    if (savedPrimaryColor && savedPrimaryColor !== 'default') {
      const colorMappings: { [key: string]: string[] } = {
        'purple': ['#8c54ff', '140, 84, 255', '#ffffff', '255, 255, 255', '#7b4ae0', '#9865ff'],
        'green': ['#28ba62', '40, 186, 98', '#ffffff', '255, 255, 255', '#23a356', '#3ec172'],
        'pink': ['#e92e7f', '233, 46, 127', '#ffffff', '255, 255, 255', '#cd2870', '#eb438b'],
        'orange': ['#ff9f0a', '255, 159, 10', '#000000', '0, 0, 0', '#e08c09', '#ffa923']
      };
      
      const colorValues = colorMappings[savedPrimaryColor];
      if (colorValues) {
        document.documentElement.style.setProperty('--ion-color-primary', colorValues[0]);
        document.documentElement.style.setProperty('--ion-color-primary-rgb', colorValues[1]);
        document.documentElement.style.setProperty('--ion-color-primary-contrast', colorValues[2]);
        document.documentElement.style.setProperty('--ion-color-primary-contrast-rgb', colorValues[3]);
        document.documentElement.style.setProperty('--ion-color-primary-shade', colorValues[4]);
        document.documentElement.style.setProperty('--ion-color-primary-tint', colorValues[5]);
      }
    }
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        const taskId = notification.notification.extra?.taskId;
        if (taskId) {
          window.location.href = `/task/${taskId}`;
        }
      });
    };
    
    setupNotifications();
    
    return () => {
      LocalNotifications.removeAllListeners();
    };
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <TaskProvider>
          <AppRouting />
        </TaskProvider>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;