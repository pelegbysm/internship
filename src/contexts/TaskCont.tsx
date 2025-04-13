import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, sampleTasks } from '../models/task';
import { v4 as uuidv4 } from 'uuid';
import { NotificationService } from '../services/NotificationService';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  filterTasks: (status?: Task['status'], priority?: Task['priority'], tag?: string) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        const tasksWithDates = parsedTasks.map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate)
        }));
        setTasks(tasksWithDates);
      } catch (error) {
        console.error('Error parsing tasks from localStorage', error);
        setTasks(sampleTasks);
      }
    } else {
      setTasks(sampleTasks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const updateNotifications = async () => {
      await NotificationService.updateAllTaskReminders(tasks);
    };
    
    updateNotifications();
  }, [tasks]);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      await NotificationService.requestPermission();
    };
    
    requestNotificationPermission();
  }, []);

  const addTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
    try {
      const newTask: Task = { 
        ...task, 
        id: uuidv4() 
      };
      
      setTasks(prev => [...prev, newTask]);
      
      if (newTask.reminderSet) {
        await NotificationService.scheduleTaskReminder(newTask)
          .catch(error => {
            console.error('שגיאה בהגדרת תזכורת:', error);
          });
      }
      
      return newTask;
    } catch (error) {
      console.error('שגיאה ביצירת משימה:', error);
      throw error;
    }
  };
  
  const updateTask = async (updatedTask: Task): Promise<Task> => {
    try {
      const existingTask = tasks.find(task => task.id === updatedTask.id);
      if (!existingTask) {
        const error = new Error(`משימה עם מזהה ${updatedTask.id} לא נמצאה`);
        console.error(error);
        throw error;
      }
  
      let dueDate: Date;
      if (updatedTask.dueDate instanceof Date) {
        dueDate = updatedTask.dueDate;
      } else if (typeof updatedTask.dueDate === 'string') {
        dueDate = new Date(updatedTask.dueDate);
      } else {
        dueDate = new Date();
      }
  
      const taskToUpdate: Task = {
        ...updatedTask,
        dueDate: dueDate
      };
  
      console.log('מעדכן משימה:', taskToUpdate);
  
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskToUpdate.id ? taskToUpdate : task
        )
      );
  
      if (taskToUpdate.reminderSet) {
        await NotificationService.scheduleTaskReminder(taskToUpdate)
          .catch(err => {
            console.error('שגיאה בתזמון התראה:', err);
          });
      } else {
        await NotificationService.cancelTaskReminder(taskToUpdate.id)
          .catch(err => {
            console.error('שגיאה בביטול התראה:', err);
          });
      }
  
      return taskToUpdate;
    } catch (error) {
      console.error('שגיאה בעדכון משימה:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    const existingTask = tasks.find(task => task.id === id);
    if (!existingTask) {
      console.error(`משימה עם מזהה ${id} לא נמצאה למחיקה`);
      return;
    }

    setTasks(prev => prev.filter(task => task.id !== id));
    
    await NotificationService.cancelTaskReminder(id);
  };

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  const filterTasks = (status?: Task['status'], priority?: Task['priority'], tag?: string) => {
    return tasks.filter(task => {
      let match = true;
      if (status) match = match && task.status === status;
      if (priority) match = match && task.priority === priority;
      if (tag) match = match && task.tags.includes(tag);
      return match;
    });
  };

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      addTask, 
      updateTask, 
      deleteTask, 
      getTaskById,
      filterTasks
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};