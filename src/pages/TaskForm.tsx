import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonToggle,
  IonChip,
  IonIcon,
  IonAlert,
  IonToast,
  IonRadioGroup,
  IonRadio,
  IonItemDivider,
  IonBadge,
  IonLoading
} from '@ionic/react';
import { 
  saveOutline, 
  closeOutline, 
  addOutline, 
  trashOutline, 
  mapOutline,
  pricetagOutline
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router';
import { useTasks } from '../contexts/TaskCont';
import { Task } from '../models/task';
import LocationModal from '../components/LocationModal';
import './TaskForm.css';

const TaskForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const history = useHistory();
  const { getTaskById, addTask, updateTask, deleteTask } = useTasks();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    dueDate: new Date(),
    priority: 'avg' as 'avg',
    status: 'pending' as 'pending',
    tags: [],
    reminderSet: false
  });

  useEffect(() => {
    if (!isNew && id) {
      const task = getTaskById(id);
      if (task) {
        setFormData({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          status: task.status,
          location: task.location,
          tags: task.tags,
          reminderSet: task.reminderSet
        });
      }
    }
  }, [id, isNew, getTaskById]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      dueDate: new Date(value)
    }));
  };

  const handleToggleChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setErrorMessage('יש להזין כותרת למשימה');
      setShowErrorToast(true);
      return;
    }
  
    try {
      setIsLoading(true);
  
      const taskToSave = {
        ...formData,
        dueDate: formData.dueDate instanceof Date ? formData.dueDate : new Date(formData.dueDate)
      };
  
      console.log('שומר משימה:', taskToSave);
  
      // כאן ההטמעה שלך:
      if (!id || id === 'new') {
        await addTask(taskToSave);
      } else {
        await updateTask({ ...taskToSave, id });
      }
  
      setShowSuccessToast(true);
  
      setTimeout(() => {
        window.location.href = '/home';
      }, 1000);
    } catch (error) {
      console.error('שגיאה בשמירת המשימה:', error);
      setErrorMessage('אירעה שגיאה בשמירת המשימה');
      setShowErrorToast(true);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteTask(id);
      window.location.href = '/home';
    } catch (error) {
      console.error('שגיאה במחיקת המשימה:', error);
      setErrorMessage('אירעה שגיאה במחיקת המשימה');
      setShowErrorToast(true);
      setIsLoading(false);
    }
  };

  const openLocationPicker = () => {
    setShowLocationModal(true);
  };

  const handleLocationSelect = (location: { latitude: number; longitude: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
  };

  const handleRemoveLocation = () => {
    setFormData(prev => {
      const newFormData = { ...prev };
      delete newFormData.location;
      return newFormData;
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>{isNew ? 'משימה חדשה' : 'עריכת משימה'}</IonTitle>
          {!isNew && (
            <IonButtons slot="end">
              <IonButton color="danger" onClick={() => setShowDeleteAlert(true)}>
                <IonIcon icon={trashOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <form className="task-form">
          <IonItem>
            <IonLabel position="stacked">כותרת</IonLabel>
            <IonInput
              name="title"
              value={formData.title}
              onIonChange={handleChange}
              placeholder="הוסף כותרת למשימה"
              required
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">תיאור</IonLabel>
            <IonTextarea
              name="description"
              value={formData.description}
              onIonChange={handleChange}
              placeholder="הוסף תיאור מפורט"
              rows={4}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">תאריך יעד</IonLabel>
            <IonDatetime
              presentation="date-time"
              value={typeof formData.dueDate === 'string' 
                ? formData.dueDate 
                : formData.dueDate.toISOString()}
              onIonChange={e => handleDateChange(e.detail.value as string)}
              min={new Date().toISOString()}
            />
          </IonItem>

          <IonItemDivider>רמת עדיפות</IonItemDivider>
          <IonRadioGroup 
            value={formData.priority} 
            onIonChange={e => handleChange({ target: { name: 'priority', value: e.detail.value } })}
          >
            <div className="priority-selector">
              <IonItem lines="none">
                <IonLabel>נמוכה</IonLabel>
                <IonRadio slot="start" value="low" />
              </IonItem>
              <IonItem lines="none">
                <IonLabel>בינונית</IonLabel>
                <IonRadio slot="start" value="avg" />
              </IonItem>
              <IonItem lines="none">
                <IonLabel>גבוהה</IonLabel>
                <IonRadio slot="start" value="high" />
              </IonItem>
            </div>
          </IonRadioGroup>

          <IonItemDivider>סטטוס</IonItemDivider>
          <IonRadioGroup 
            value={formData.status} 
            onIonChange={e => handleChange({ target: { name: 'status', value: e.detail.value } })}
          >
            <div className="status-selector">
              <IonItem lines="none">
                <IonLabel>ממתינה</IonLabel>
                <IonRadio slot="start" value="pending" />
              </IonItem>
              <IonItem lines="none">
                <IonLabel>בתהליך</IonLabel>
                <IonRadio slot="start" value="in the making" />
              </IonItem>
              <IonItem lines="none">
                <IonLabel>הושלמה</IonLabel>
                <IonRadio slot="start" value="done" />
              </IonItem>
            </div>
          </IonRadioGroup>

          <IonItem>
            <IonLabel>הגדר תזכורת</IonLabel>
            <IonToggle
              checked={formData.reminderSet}
              onIonChange={e => handleToggleChange('reminderSet', e.detail.checked)}
            />
          </IonItem>

          {formData.location ? (
            <IonItem className="location-item">
              <IonIcon icon={mapOutline} slot="start" color="tertiary" />
              <IonLabel>
                <h2>מיקום המשימה</h2>
                <p>{formData.location.address}</p>
              </IonLabel>
              <IonButton fill="clear" slot="end" onClick={openLocationPicker}>
                שנה
              </IonButton>
              <IonButton fill="clear" color="medium" slot="end" onClick={handleRemoveLocation}>
                הסר
              </IonButton>
            </IonItem>
          ) : (
            <IonItem button onClick={openLocationPicker}>
              <IonIcon icon={mapOutline} slot="start" />
              <IonLabel>הוסף מיקום למשימה</IonLabel>
            </IonItem>
          )}

          <div className="tags-container">
            <IonItemDivider>תגיות</IonItemDivider>
            <div className="tags-list">
              {formData.tags.map(tag => (
                <IonChip key={tag} color="primary" outline>
                  <IonLabel>{tag}</IonLabel>
                  <IonIcon icon={closeOutline} onClick={() => handleRemoveTag(tag)} />
                </IonChip>
              ))}
              
              {showTagInput ? (
                <div className="new-tag-input">
                  <IonInput
                    value={newTag}
                    placeholder="תגית חדשה"
                    onIonChange={e => setNewTag(e.detail.value!)}
                  />
                  <IonButton size="small" fill="clear" onClick={handleAddTag}>
                    <IonIcon icon={addOutline} />
                  </IonButton>
                  <IonButton size="small" fill="clear" color="medium" onClick={() => setShowTagInput(false)}>
                    <IonIcon icon={closeOutline} />
                  </IonButton>
                </div>
              ) : (
                <IonChip color="medium" onClick={() => setShowTagInput(true)}>
                  <IonIcon icon={addOutline} />
                  <IonLabel>הוסף תגית</IonLabel>
                </IonChip>
              )}
            </div>
          </div>

          <div className="form-footer">
            <IonButton expand="block" onClick={handleSubmit} color="primary">
              <IonIcon icon={saveOutline} slot="start" />
              {isNew ? 'הוסף משימה' : 'שמור שינויים'}
            </IonButton>
          </div>
        </form>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="מחיקת משימה"
          message="האם אתה בטוח שברצונך למחוק את המשימה הזו?"
          buttons={[
            {
              text: 'ביטול',
              role: 'cancel',
              cssClass: 'secondary',
            },
            {
              text: 'מחק',
              handler: handleDelete,
              cssClass: 'danger',
            }
          ]}
        />

        <IonToast
          isOpen={showSuccessToast}
          onDidDismiss={() => setShowSuccessToast(false)}
          message={isNew ? 'המשימה נוצרה בהצלחה!' : 'המשימה עודכנה בהצלחה!'}
          duration={1500}
          position="bottom"
          color="success"
        />

        <IonToast
          isOpen={showErrorToast}
          onDidDismiss={() => setShowErrorToast(false)}
          message={errorMessage}
          duration={2000}
          position="bottom"
          color="danger"
        />

        <IonLoading
          isOpen={isLoading}
          message="אנא המתן..."
        />

        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onLocationSelect={handleLocationSelect}
          initialLocation={formData.location}
        />
      </IonContent>
    </IonPage>
  );
};

export default TaskForm;