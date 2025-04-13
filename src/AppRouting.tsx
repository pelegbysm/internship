import React from 'react';
import { 
  IonRouterOutlet, 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel 
} from '@ionic/react';
import { Route, Redirect, Switch } from 'react-router-dom';

import Home from './pages/Home';
import Settings from './pages/Settings';
import TaskForm from './pages/TaskForm';
import TaskDetail from './pages/TaskDetail';

import { 
  homeOutline, 
  settingsOutline 
} from 'ionicons/icons';

const AppRouting: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Switch>
          <Route exact path="/" render={() => <Redirect to="/home" />} />
          <Route exact path="/home" component={Home} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/task/new" component={TaskForm} />
          <Route exact path="/task/edit/:id" component={TaskForm} />
          <Route exact path="/task/:id" component={TaskDetail} />
        </Switch>
      </IonRouterOutlet>
      
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={homeOutline} />
          <IonLabel>ראשי</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="settings" href="/settings">
          <IonIcon icon={settingsOutline} />
          <IonLabel>הגדרות</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default AppRouting;