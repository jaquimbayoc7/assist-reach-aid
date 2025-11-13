import { Users, TrendingUp, Target, Calendar } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { patientService, type Patient } from '@/services/patients';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular métricas reales
  const totalPatients = patients.length;
  
  const patientsWithPredictions = patients.filter(p => p.prediction_profile !== null);
  
  // Calcular tasa de éxito (promedio de perfiles de predicción)
  const successRate = patientsWithPredictions.length > 0
    ? (patientsWithPredictions.reduce((sum, p) => sum + (p.prediction_profile || 0), 0) / patientsWithPredictions.length * 10).toFixed(2)
    : '0.00';

  // Predicciones de hoy (filtrar por última actualización - simplificado)
  const today = new Date().toISOString().split('T')[0];
  const predictionsToday = patientsWithPredictions.length; // Simplificado - necesitaría fecha de predicción

  // Últimos 5 pacientes
  const recentPatients = [...patients].reverse().slice(0, 5);

  // Historial de predicciones (pacientes con predicción)
  const predictionHistory = patientsWithPredictions.reverse().slice(0, 10);

  const metrics = [
    {
      title: t('totalPatients'),
      value: totalPatients.toString(),
      icon: Users,
    },
    {
      title: t('predictionsToday'),
      value: predictionsToday.toString(),
      icon: TrendingUp,
    },
    {
      title: t('successRate'),
      value: `${successRate}%`,
      icon: Target,
    },
  ];

  const getProfileColor = (profile: number | null): string => {
    if (!profile) return 'bg-muted';
    if (profile <= 3) return 'bg-green-500';
    if (profile <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your disability assessment activities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('recentPatients')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/patients')}>
              {t('viewAll')}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t('noPatientsYet')}
                </p>
              ) : (
                recentPatients.map((patient) => (
                  <div 
                    key={patient.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/patients')}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{patient.nombre_apellidos}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.edad} años - {patient.genero}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {new Date(patient.fecha_nacimiento).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('predictionHistory')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/predictions')}>
              {t('viewAll')}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictionHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t('addFirstPatient')}
                </p>
              ) : (
                predictionHistory.map((patient) => (
                  <div 
                    key={patient.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/predictions')}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{patient.nombre_apellidos}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {patient.prediction_description || 'Sin descripción'}
                      </p>
                    </div>
                    <Badge 
                      className={`${getProfileColor(patient.prediction_profile)} text-white`}
                    >
                      Perfil {patient.prediction_profile}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
