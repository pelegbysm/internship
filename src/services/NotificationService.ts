import { LocalNotifications } from '@capacitor/local-notifications';
import { Task } from '../models/task';

export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    const permStatus = await LocalNotifications.requestPermissions();
    return permStatus.display === 'granted';
  }

  static async scheduleTaskReminder(task: Task): Promise<void> {
    if (!task.reminderSet || !task.dueDate) {
      return;
    }

    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.warn('אין הרשאה להתראות');
        return;
      }

   
      await this.cancelTaskReminder(task.id);

     
      const dueDate = new Date(task.dueDate);
      const notificationTime = new Date(dueDate);
      notificationTime.setHours(notificationTime.getHours() - 1);

    
      if (notificationTime.getTime() <= Date.now()) {
        console.log('זמן ההתראה כבר עבר');
        return;
      }

 
      const title = 'תזכורת משימה';
      const body = `המשימה "${task.title}" מתוכננת לשעה ${dueDate.toLocaleTimeString('he-IL', { 
        hour: '2-digit', 
        minute: '2-digit'
      })}`;

      
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: this.generateNotificationId(task.id),
            schedule: { at: notificationTime },
            sound: 'beep.wav',
            actionTypeId: 'TASK_REMINDER',
            extra: {
              taskId: task.id
            }
          }
        ]
      });

      console.log(`התראה תוזמנה למשימה: ${task.id}, בתאריך: ${notificationTime.toLocaleString()}`);
    } catch (error) {
      console.error('שגיאה בתזמון התראה:', error);
    }
  }


  static async cancelTaskReminder(taskId: string): Promise<void> {
    try {
      const notificationId = this.generateNotificationId(taskId);
      
   
      const pendingNotifications = await LocalNotifications.getPending();
      
      
      const taskNotification = pendingNotifications.notifications.find(
        notification => notification.id === notificationId
      );
      
      if (taskNotification) {
        await LocalNotifications.cancel({
          notifications: [{ id: notificationId }]
        });
        console.log(`התראה בוטלה למשימה: ${taskId}`);
      }
    } catch (error) {
      console.error('שגיאה בביטול התראה:', error);
    }
  }

 
  private static generateNotificationId(taskId: string): number {
   
    let notificationId = 0;
    for (let i = 0; i < taskId.length; i++) {
      notificationId += taskId.charCodeAt(i);
    }
    
    
    return notificationId + 1000;
  }

 
  static async updateAllTaskReminders(tasks: Task[]): Promise<void> {
   
    const tasksWithReminders = tasks.filter(
      task => task.reminderSet && 
      task.dueDate && 
      new Date(task.dueDate).getTime() > Date.now()
    );

    for (const task of tasksWithReminders) {
      await this.scheduleTaskReminder(task);
    }

    console.log(`עודכנו התראות ל-${tasksWithReminders.length} משימות`);
  }
}