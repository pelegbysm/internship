import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonBadge,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonActionSheet,
  IonToast,
  IonToggle
} from '@ionic/react';
import { 
  pencilOutline, 
  trashOutline, 
  ellipsisHorizontal,
  ellipsisVertical,
  locationOutline,
  timeOutline,
  alertCircleOutline,
  pricetag,
  shareOutline,
  notificationsOutline,
  checkmarkDoneOutline,
  closeOutline
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router';
import { useTasks } from '../contexts/TaskCont';
import { Task } from '../models/task';
import { NotificationService } from '../services/NotificationService';
import MapView from '../components/MapView';
import './TaskDetail.css';

interface RouteParams {
  id: string;
}

const TaskDetail: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { getTaskById, updateTask, deleteTask } = useTasks();
  
  const [task, setTask] = useState<Task | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  useEffect(() => {
    const taskData = getTaskById(id);
    if (taskData) {
      setTask(taskData);
    } else {
      history.push('/home');
    }
  }, [id, getTaskById, history]);
  
  if (!task) {
    return null;
  }
  
  const handleEdit = () => {
    history.push(`/task/edit/${id}`);
  };
  
  const handleDelete = () => {
    deleteTask(id);
    setToastMessage('המשימה נמחקה בהצלחה');
    setShowToast(true);
    setTimeout(() => {
      history.push('/home');
    }, 1500);
  };
  
  const handleStatusChange = (newStatus: Task['status']) => {
    if (task) {
      const updatedTask = { ...task, status: newStatus };
      updateTask(updatedTask);
      setTask(updatedTask);
      setToastMessage('סטטוס המשימה עודכן בהצלחה');
      setShowToast(true);
    }
  };

  const handleToggleReminder = async () => {
    if (task) {
      const updatedTask = { ...task, reminderSet: !task.reminderSet };
      updateTask(updatedTask);
      setTask(updatedTask);

      if (updatedTask.reminderSet) {
        setToastMessage('תזכורת הופעלה למשימה זו');
        await NotificationService.scheduleTaskReminder(updatedTask);
      } else {
        setToastMessage('תזכורת בוטלה למשימה זו');
        await NotificationService.cancelTaskReminder(task.id);
      }
      
      setShowToast(true);
    }
  };
  
  const formattedDate = (date: Date) => {
    return new Date(date).toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'avg': return 'warning';
      case 'low': return 'success';
      default: return 'medium';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'ממתינה';
      case 'in the making': return 'בתהליך';
      case 'done': return 'הושלמה';
      default: return status;
    }
  };
  
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'גבוהה';
      case 'avg': return 'בינונית';
      case 'low': return 'נמוכה';
      default: return priority;
    }
  };

  // בדיקה האם המשימה עברה את מועד היעד
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>פרטי משימה</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowActionSheet(true)}>
              <IonIcon icon={ellipsisVertical} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <div className="task-header">
          <h1>{task.title}</h1>
          <IonBadge className="status-badge" color={task.status === 'done' ? 'success' : task.status === 'in the making' ? 'warning' : 'medium'}>
            {getStatusText(task.status)}
          </IonBadge>
        </div>
        
        <IonCard>
          <IonCardContent>
            <div className="task-description">
              {task.description}
            </div>
          </IonCardContent>
        </IonCard>
        
        <IonGrid className="task-info-grid">
          <IonRow>
            <IonCol size="6">
              <div className="info-item">
                <IonIcon icon={alertCircleOutline} color={getPriorityColor(task.priority)} />
                <div className="info-label">עדיפות</div>
                <div className="info-value">{getPriorityText(task.priority)}</div>
              </div>
            </IonCol>
            
            <IonCol size="6">
              <div className="info-item">
                <IonIcon icon={timeOutline} color={isOverdue ? 'danger' : ''} />
                <div className="info-label">תאריך יעד</div>
                <div className={`info-value ${isOverdue ? 'overdue-date' : ''}`}>
                {formattedDate(task.dueDate)}
                {isOverdue && <span className="overdue-badge">איחור</span>}
                </div>
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <div className="info-item reminder-item">
                <IonIcon icon={notificationsOutline} color={task.reminderSet ? 'warning' : 'medium'} />
                <div className="info-label">תזכורת</div>
                <div className="toggle-container">
                  <IonToggle 
                    checked={task.reminderSet} 
                    onIonChange={handleToggleReminder}
                    disabled={task.status === 'done' || isOverdue}
                  />
                </div>
              </div>
            </IonCol>
          </IonRow>
          
          {task.location && (
            <IonRow>
              <IonCol size="12">
                <div className="location-section">
                  <div className="info-item location-header">
                    <IonIcon icon={locationOutline} color="tertiary" />
                    <div className="info-label">מיקום</div>
                    <div className="info-value">{task.location.address}</div>
                  </div>
                  
                  <div className="map-container">
                    <MapView 
                      latitude={task.location.latitude} 
                      longitude={task.location.longitude}
                      address={task.location.address}
                    />
                  </div>
                </div>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
        
        {task.tags.length > 0 && (
          <div className="tags-section">
            <h2>תגיות</h2>
            <div className="tags-container">
              {task.tags.map(tag => (
                <IonChip key={tag} color="primary">
                  <IonIcon icon={pricetag} />
                  <IonLabel>{tag}</IonLabel>
                </IonChip>
              ))}
            </div>
          </div>
        )}
        
        <div className="actions-section">
          <h2>פעולות מהירות</h2>
          <div className="quick-actions">
            {task.status !== 'done' && (
              <IonButton 
                expand="block" 
                color="success" 
                onClick={() => handleStatusChange('done')}
              >
                <IonIcon slot="start" icon={checkmarkDoneOutline} />
                סמן כבוצע
              </IonButton>
            )}
            
            {task.status === 'pending' && (
              <IonButton 
                expand="block" 
                color="warning" 
                onClick={() => handleStatusChange('in the making')}
              >
                <IonIcon slot="start" icon={ellipsisHorizontal} />
                התחל טיפול
              </IonButton>
            )}
            
            {task.status === 'done' && (
              <IonButton 
                expand="block" 
                color="medium" 
                onClick={() => handleStatusChange('in the making')}
              >
                <IonIcon slot="start" icon={ellipsisHorizontal} />
                החזר לטיפול
              </IonButton>
            )}
          </div>
        </div>
        
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleEdit} color="primary">
            <IonIcon icon={pencilOutline} />
          </IonFabButton>
        </IonFab>
        
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={[
            {
              text: 'עריכה',
              icon: pencilOutline,
              handler: handleEdit
            },
            {
              text: 'שיתוף',
              icon: shareOutline,
              handler: () => {
                setToastMessage('שיתוף משימות יהיה זמין בגרסה הבאה');
                setShowToast(true);
              }
            },
            {
              text: 'מחיקה',
              icon: trashOutline,
              role: 'destructive',
              handler: handleDelete
            },
            {
              text: 'ביטול',
              icon: closeOutline,
              role: 'cancel'
            }
          ]}
        />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={1500}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default TaskDetail;