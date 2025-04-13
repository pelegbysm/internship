export interface Task{
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    priority: 'low' | 'avg' | 'high';
    status: 'pending' | 'in the making' | 'done';
    location?: {
        latitude: number;
        longitude: number;
        address: string;
    };
    tags: string[];
    reminderSet: boolean;
}

export const sampleTasks: Task[] = [
    {
      id: '1',
      title: 'להשלים את פרויקט ה-Ionic',
      description: 'סיים את פרויקט המשימות ב-Ionic והוסף לתיק העבודות',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      priority: 'high',
      status: 'in the making',
      tags: ['פיתוח', 'תיק עבודות'],
      reminderSet: true
    },
    {
      id: '2',
      title: 'פגישת רשת מקצועית',
      description: 'להשתתף באירוע נטוורקינג לפיתוח קריירה',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 
      priority: 'avg',
      status: 'pending',
      location: {
        latitude: 32.0853,
        longitude: 34.7818,
        address: 'רוטשילד 22, תל אביב'
      },
      tags: ['קריירה', 'נטוורקינג'],
      reminderSet: false
    }
  ];