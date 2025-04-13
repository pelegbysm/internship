import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonRadioGroup,
  IonListHeader,
  IonRadio,
  IonButton,
  IonIcon,
  IonItemDivider,
  IonRange,
  IonNote,
  IonAlert,
  IonToast
} from '@ionic/react';
import { 
  colorPaletteOutline, 
  notificationsOutline, 
  brushOutline,
  trashOutline,
  returnUpBackOutline,
  informationCircleOutline,
  saveOutline
} from 'ionicons/icons';
import ThemeToggle from '../components/ThemeToggle';
import { NotificationService } from '../services/NotificationService';
import { ThemeService } from '../services/ThemeServices';
import './Settings.css';

const Settings: React.FC = () => {
  const [fontFamily, setFontFamily] = useState<string>('default');
  const [fontSize, setFontSize] = useState<number>(16);
  const [primaryColor, setPrimaryColor] = useState<string>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [showResetAlert, setShowResetAlert] = useState<boolean>(false);
  const [showAboutAlert, setShowAboutAlert] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    // טעינת הגדרות קיימות
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize, 10));
    }

    const savedFontFamily = localStorage.getItem('fontFamily');
    if (savedFontFamily) {
      setFontFamily(savedFontFamily);
    }

    const savedPrimaryColor = localStorage.getItem('primaryColor');
    if (savedPrimaryColor) {
      setPrimaryColor(savedPrimaryColor);
    }

    NotificationService.requestPermission().then(permissionGranted => {
      setNotificationsEnabled(permissionGranted);
    });
  }, []);

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
  };

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family);
  };

  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
  };

  const applyPrimaryColor = (colorName: string) => {
    if (colorName === 'default') {
      resetPrimaryColor();
      return;
    }

    let color, rgb, contrast, contrastRgb, shade, tint;

    switch (colorName) {
      case 'purple':
        color = '#8c54ff';
        rgb = '140, 84, 255';
        contrast = '#ffffff';
        contrastRgb = '255, 255, 255';
        shade = '#7b4ae0';
        tint = '#9865ff';
        break;
      case 'green':
        color = '#28ba62';
        rgb = '40, 186, 98';
        contrast = '#ffffff';
        contrastRgb = '255, 255, 255';
        shade = '#23a356';
        tint = '#3ec172';
        break;
      case 'pink':
        color = '#e92e7f';
        rgb = '233, 46, 127';
        contrast = '#ffffff';
        contrastRgb = '255, 255, 255';
        shade = '#cd2870';
        tint = '#eb438b';
        break;
      case 'orange':
        color = '#ff9f0a';
        rgb = '255, 159, 10';
        contrast = '#000000';
        contrastRgb = '0, 0, 0';
        shade = '#e08c09';
        tint = '#ffa923';
        break;
      default:
        return;
    }

    document.documentElement.style.setProperty('--ion-color-primary', color);
    document.documentElement.style.setProperty('--ion-color-primary-rgb', rgb);
    document.documentElement.style.setProperty('--ion-color-primary-contrast', contrast);
    document.documentElement.style.setProperty('--ion-color-primary-contrast-rgb', contrastRgb);
    document.documentElement.style.setProperty('--ion-color-primary-shade', shade);
    document.documentElement.style.setProperty('--ion-color-primary-tint', tint);
  };

  const resetPrimaryColor = () => {
    document.documentElement.style.removeProperty('--ion-color-primary');
    document.documentElement.style.removeProperty('--ion-color-primary-rgb');
    document.documentElement.style.removeProperty('--ion-color-primary-contrast');
    document.documentElement.style.removeProperty('--ion-color-primary-contrast-rgb');
    document.documentElement.style.removeProperty('--ion-color-primary-shade');
    document.documentElement.style.removeProperty('--ion-color-primary-tint');
  };

  const applySettings = () => {
    // יישום גודל גופן
    document.documentElement.style.setProperty('--app-font-size', `${fontSize}px`);
    localStorage.setItem('fontSize', fontSize.toString());

    // יישום משפחת גופנים
    if (fontFamily === 'default') {
      document.documentElement.style.removeProperty('--ion-font-family');
    } else {
      document.documentElement.style.setProperty('--ion-font-family', fontFamily);
    }
    localStorage.setItem('fontFamily', fontFamily);

    // יישום צבע ראשי
    applyPrimaryColor(primaryColor);
    localStorage.setItem('primaryColor', primaryColor);

    // הצגת הודעת אישור
    setToastMessage('ההגדרות הוחלו בהצלחה');
    setShowToast(true);
  };

  const resetAllSettings = () => {
    // איפוס גודל גופן
    setFontSize(16);
    document.documentElement.style.removeProperty('--app-font-size');
    localStorage.removeItem('fontSize');

    // איפוס משפחת גופנים
    setFontFamily('default');
    document.documentElement.style.removeProperty('--ion-font-family');
    localStorage.removeItem('fontFamily');

    // איפוס צבע ראשי
    setPrimaryColor('default');
    resetPrimaryColor();
    localStorage.removeItem('primaryColor');

    // איפוס ערכת נושא
    ThemeService.setTheme(ThemeService.THEMES.LIGHT);

    setShowResetAlert(false);
    setToastMessage('כל ההגדרות אופסו לברירת המחדל');
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>הגדרות</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonListHeader>מראה</IonListHeader>
          
          <ThemeToggle />
          
          <IonItem>
            <IonIcon slot="start" icon={colorPaletteOutline} />
            <IonLabel>צבע ראשי</IonLabel>
            <IonSelect 
              value={primaryColor} 
              onIonChange={e => handlePrimaryColorChange(e.detail.value)}
              interface="popover"
            >
              <IonSelectOption value="default">ברירת מחדל</IonSelectOption>
              <IonSelectOption value="purple">סגול</IonSelectOption>
              <IonSelectOption value="green">ירוק</IonSelectOption>
              <IonSelectOption value="pink">ורוד</IonSelectOption>
              <IonSelectOption value="orange">כתום</IonSelectOption>
            </IonSelect>
          </IonItem>
          
          <IonItem>
            <IonIcon slot="start" icon={brushOutline} />
            <IonLabel>גופן</IonLabel>
            <IonSelect 
              value={fontFamily} 
              onIonChange={e => handleFontFamilyChange(e.detail.value)}
              interface="popover"
            >
              <IonSelectOption value="default">ברירת מחדל</IonSelectOption>
              <IonSelectOption value="'Rubik', sans-serif">רובייק</IonSelectOption>
              <IonSelectOption value="'Assistant', sans-serif">אסיסטנט</IonSelectOption>
              <IonSelectOption value="'Heebo', sans-serif">היבו</IonSelectOption>
              <IonSelectOption value="'Open Sans Hebrew', sans-serif">אופן סנס</IonSelectOption>
            </IonSelect>
          </IonItem>
          
          <IonItem>
            <IonIcon slot="start" icon={brushOutline} />
            <IonLabel>גודל גופן</IonLabel>
            <IonNote slot="end">{fontSize}px</IonNote>
          </IonItem>
          <IonItem lines="none" className="range-item">
            <IonRange 
              min={12} 
              max={20} 
              step={1} 
              value={fontSize}
              onIonChange={e => handleFontSizeChange(e.detail.value as number)}
            />
          </IonItem>

          <IonItemDivider>התראות</IonItemDivider>
          
          <IonItem>
            <IonIcon slot="start" icon={notificationsOutline} />
            <IonLabel>אפשר התראות</IonLabel>
            <IonToggle 
              checked={notificationsEnabled} 
              onIonChange={async e => {
                const enabled = e.detail.checked;
                if (enabled) {
                  const granted = await NotificationService.requestPermission();
                  setNotificationsEnabled(granted);
                } else {
                  setNotificationsEnabled(false);
                }
              }}
            />
          </IonItem>
          
          <IonItem>
            <IonButton 
              expand="block" 
              onClick={applySettings}
              color="primary"
              className="apply-button"
            >
              <IonIcon slot="start" icon={saveOutline} />
              החל הגדרות
            </IonButton>
          </IonItem>
          
          <IonItemDivider>אפשרויות נוספות</IonItemDivider>
          
          <IonItem button onClick={() => setShowResetAlert(true)}>
            <IonIcon slot="start" icon={returnUpBackOutline} color="warning" />
            <IonLabel color="warning">איפוס הגדרות</IonLabel>
          </IonItem>
          
          <IonItem button onClick={() => setShowAboutAlert(true)}>
            <IonIcon slot="start" icon={informationCircleOutline} />
            <IonLabel>אודות האפליקציה</IonLabel>
          </IonItem>
        </IonList>
        
        <IonAlert
          isOpen={showResetAlert}
          onDidDismiss={() => setShowResetAlert(false)}
          header="איפוס הגדרות"
          message="האם אתה בטוח שברצונך לאפס את כל ההגדרות לברירת המחדל?"
          buttons={[
            {
              text: 'ביטול',
              role: 'cancel',
              cssClass: 'secondary'
            },
            {
              text: 'איפוס',
              handler: resetAllSettings,
              cssClass: 'danger'
            }
          ]}
        />
        
        <IonAlert
          isOpen={showAboutAlert}
          onDidDismiss={() => setShowAboutAlert(false)}
          header="אודות TaskMaster"
          message="גרסה 1.0.0&#10;אפליקציית ניהול משימות שפותחה על ידי פרויקט TaskMaster.&#10;©️ 2025 כל הזכויות שמורות."
          buttons={['אישור']}
        />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Settings;