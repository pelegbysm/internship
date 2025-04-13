export class ThemeService {
  // הוסף static לנכסים אלה
  static readonly THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
  } as const;  // הוסף as const כדי לשפר את הטיפוסים

  private static readonly THEME_PREFERENCE_KEY = 'theme-preference';

  // הוסף טיפוס מפורש לשיטות סטטיות
  static setTheme(theme: 'light' | 'dark'): void {
    if (theme === this.THEMES.DARK) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    localStorage.setItem(this.THEME_PREFERENCE_KEY, theme);
  }

  // הוסף טיפוס מפורש להחזרת ערך
  static getCurrentTheme(): 'light' | 'dark' {
    return document.body.classList.contains('dark') 
      ? this.THEMES.DARK 
      : this.THEMES.LIGHT;
  }

  static getSavedTheme(): 'light' | 'dark' | null {
    return localStorage.getItem(this.THEME_PREFERENCE_KEY) as 'light' | 'dark' | null;
  }

  static applyPreferredTheme(): void {
    const savedTheme = this.getSavedTheme();
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? this.THEMES.DARK : this.THEMES.LIGHT);
    }
  }

  static toggleTheme(): 'light' | 'dark' {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === this.THEMES.DARK ? this.THEMES.LIGHT : this.THEMES.DARK;
    this.setTheme(newTheme);
    return newTheme;
  }
}