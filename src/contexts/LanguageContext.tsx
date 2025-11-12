import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    patients: 'Patients',
    predictions: 'Predictions',
    analytics: 'Analytics',
    userList: 'User List',
    settings: 'Settings',
    logout: 'Logout',
    
    // Auth
    login: 'Login',
    email: 'Email',
    password: 'Password',
    welcomeBack: 'Welcome Back',
    loginSubtitle: 'Enter your credentials to access your account',
    
    // Dashboard
    totalPatients: 'Total Patients',
    activeCases: 'Active Cases',
    predictionsToday: 'Predictions Today',
    successRate: 'Success Rate',
    recentPatients: 'Recent Patients',
    viewAll: 'View All',
    noPatientsYet: 'No patients yet',
    addFirstPatient: 'Add your first patient to get started',
    
    // Patients
    addPatient: 'Add Patient',
    patientList: 'Patient List',
    patientName: 'Patient Name',
    age: 'Age',
    gender: 'Gender',
    status: 'Status',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    viewDetails: 'View Details',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    
    // Predictions
    newPrediction: 'New Prediction',
    selectPatient: 'Select Patient',
    predictionHistory: 'Prediction History',
    runPrediction: 'Run Prediction',
    barrierType: 'Barrier Type',
    confidence: 'Confidence',
    date: 'Date',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  es: {
    // Navegación
    dashboard: 'Panel',
    patients: 'Pacientes',
    predictions: 'Predicciones',
    analytics: 'Análisis',
    userList: 'Listado de Usuarios',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
    
    // Autenticación
    login: 'Iniciar Sesión',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    welcomeBack: 'Bienvenido de Nuevo',
    loginSubtitle: 'Ingresa tus credenciales para acceder a tu cuenta',
    
    // Panel
    totalPatients: 'Total de Pacientes',
    activeCases: 'Casos Activos',
    predictionsToday: 'Predicciones Hoy',
    successRate: 'Tasa de Éxito',
    recentPatients: 'Pacientes Recientes',
    viewAll: 'Ver Todo',
    noPatientsYet: 'Aún no hay pacientes',
    addFirstPatient: 'Agrega tu primer paciente para comenzar',
    
    // Pacientes
    addPatient: 'Agregar Paciente',
    patientList: 'Lista de Pacientes',
    patientName: 'Nombre del Paciente',
    age: 'Edad',
    gender: 'Género',
    status: 'Estado',
    actions: 'Acciones',
    edit: 'Editar',
    delete: 'Eliminar',
    viewDetails: 'Ver Detalles',
    male: 'Masculino',
    female: 'Femenino',
    other: 'Otro',
    
    // Predicciones
    newPrediction: 'Nueva Predicción',
    selectPatient: 'Seleccionar Paciente',
    predictionHistory: 'Historial de Predicciones',
    runPrediction: 'Ejecutar Predicción',
    barrierType: 'Tipo de Barrera',
    confidence: 'Confianza',
    date: 'Fecha',
    
    // Común
    save: 'Guardar',
    cancel: 'Cancelar',
    search: 'Buscar',
    filter: 'Filtrar',
    export: 'Exportar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
