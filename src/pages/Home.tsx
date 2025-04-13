import React, { useState } from "react";
import {
  IonContent,
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
  IonSearchbar,
  IonChip,
  IonAvatar,
  IonGrid,
  IonRow,
  IonCol,
  IonToast
} from '@ionic/react';
import { add, ellipsisHorizontal, locationOutline, notificationsOutline } from 'ionicons/icons';
import { useTasks } from "../contexts/TaskCont";
import { useHistory } from "react-router";
import './Home.css';

const Home: React.FC = () => {
  const { tasks, filterTasks } = useTasks();
  const history = useHistory();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in the making' | 'done'>('all');
  const [searchText, setSearchText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'avg': return 'warning';
      case 'low': return 'success';
      default: return 'medium';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (searchText && !task.title.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    return true;
  });

  const navigateToTaskDetail = (id: string) => {
    history.push(`/task/${id}`);
  };

  const navigateToNewTask = () => {
    try {
      history.push('/task/new');
    } catch (error) {
      console.error("Navigation error:", error);
      setToastMessage('שגיאה בניווט למסך יצירת משימה חדשה');
      setShowToast(true);
    }
  };

  const toggleViewType = () => {
    setViewType(prev => prev === 'list' ? 'grid' : 'list');
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in the making').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>TaskMaster</IonTitle>
          <IonButton slot="end" fill="clear" onClick={toggleViewType}>
            <IonIcon icon={ellipsisHorizontal} slot="icon-only" />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-value">{pendingTasks}</div>
            <div className="stat-label">ממתינות</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{inProgressTasks}</div>
            <div className="stat-label">בתהליך</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{completedTasks}</div>
            <div className="stat-label">הושלמו</div>
          </div>
        </div>

        <IonSearchbar
          value={searchText}
          onIonChange={e => setSearchText(e.detail.value!)}
          placeholder="חפש משימות"
        />

        <IonSegment value={filter} onIonChange={e => setFilter(e.detail.value as any)}>
          <IonSegmentButton value="all">
            <IonLabel>הכל</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="pending">
            <IonLabel>ממתינות</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="in the making">
            <IonLabel>בתהליך</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="done">
            <IonLabel>הושלמו</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {viewType === 'list' ? (
          <IonList>
            {filteredTasks.map(task => (
              <IonItem key={task.id} button onClick={() => navigateToTaskDetail(task.id)}>
                <IonAvatar slot="start" className={`priority-indicator priority-${task.priority}`}>
                  <div className="priority-inner"></div>
                </IonAvatar>
                
                <IonLabel>
                  <h2>{task.title}</h2>
                  <p>{task.description.length > 60 
                    ? task.description.substring(0, 60) + '...' 
                    : task.description}</p>
                  
                  <div className="task-meta">
                    <span className="due-date">
                      {new Date(task.dueDate).toLocaleDateString('he-IL')}
                    </span>
                    
                    {task.location && (
                      <IonChip color="tertiary" outline>
                        <IonIcon icon={locationOutline} />
                        <IonLabel>יש מיקום</IonLabel>
                      </IonChip>
                    )}
                    
                    {task.reminderSet && (
                      <IonChip color="warning" outline>
                        <IonIcon icon={notificationsOutline} />
                        <IonLabel>תזכורת</IonLabel>
                      </IonChip>
                    )}
                  </div>
                </IonLabel>
                
                <IonBadge color={getPriorityColor(task.priority)} slot="end">
                  {task.status === 'pending' ? 'ממתין' : 
                  task.status === 'in the making' ? 'בתהליך' : 'הושלם'}
                </IonBadge>
              </IonItem>
            ))}
          </IonList>
        ) : (
          <IonGrid>
            <IonRow>
              {filteredTasks.map(task => (
                <IonCol size="12" size-md="6" size-lg="4" key={task.id}>
                  <IonItem button onClick={() => navigateToTaskDetail(task.id)} className="grid-item">
                    <div className="grid-item-content">
                      <div className="grid-item-header">
                        <div className={`priority-dot priority-${task.priority}`}></div>
                        <h2>{task.title}</h2>
                        <IonBadge color={getPriorityColor(task.priority)}>
                          {task.status === 'pending' ? 'ממתין' : 
                          task.status === 'in the making' ? 'בתהליך' : 'הושלם'}
                        </IonBadge>
                      </div>
                      <p className="grid-item-desc">{task.description.length > 100 
                        ? task.description.substring(0, 100) + '...' 
                        : task.description}</p>
                      
                      <div className="grid-item-footer">
                        <span className="due-date">
                          {new Date(task.dueDate).toLocaleDateString('he-IL')}
                        </span>
                        <div className="grid-item-badges">
                          {task.location && (
                            <IonIcon icon={locationOutline} color="tertiary" />
                          )}
                          {task.reminderSet && (
                            <IonIcon icon={notificationsOutline} color="warning" />
                          )}
                        </div>
                      </div>
                    </div>
                  </IonItem>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={navigateToNewTask}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;