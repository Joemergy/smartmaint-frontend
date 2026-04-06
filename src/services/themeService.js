// Servicio para aplicar temas dinámicos

const THEME_STORAGE_KEY = 'smartmaint_theme';
const LANGUAGE_STORAGE_KEY = 'smartmaint_language';

export const applyTheme = (tema = 'claro') => {
  const root = document.documentElement;
  
  if (tema === 'oscuro') {
    root.setAttribute('data-theme', 'dark');
    document.body.style.backgroundColor = '#1a1a1a';
    document.body.style.color = '#ffffff';
  } else if (tema === 'automatico') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    if (prefersDark) {
      document.body.style.backgroundColor = '#1a1a1a';
      document.body.style.color = '#ffffff';
    } else {
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#1e293b';
    }
  } else {
    // claro
    root.setAttribute('data-theme', 'light');
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#1e293b';
  }
  
  localStorage.setItem(THEME_STORAGE_KEY, tema);
};

export const applyLanguage = (idioma = 'es') => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, idioma);
  document.documentElement.lang = idioma;
  // Futuro: Cargar archivos de traducción
};

export const loadThemeFromStorage = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'claro';
  applyTheme(savedTheme);
  return savedTheme;
};

export const loadLanguageFromStorage = () => {
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'es';
  applyLanguage(savedLanguage);
  return savedLanguage;
};
