import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { patientService } from '@/services/patients';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

interface AnalyticsData {
  totalPatients: number;
  patientsWithPredictions: number;
  profileDistribution: { perfil: string; cantidad: number }[];
  categoryData: {
    name: string;
    Leve: number;
    Moderada: number;
    Grave: number;
    Completa: number;
  }[];
  averageProfile: number;
  averageGlobalLevel: number;
}

export default function Analytics() {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Error al cargar estadísticas. Mostrando datos locales...');
      // Fallback: cargar todos los pacientes y calcular localmente
      loadLocalAnalytics();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalAnalytics = async () => {
    try {
      const patients = await patientService.getPatients();
      const patientsWithPredictions = patients.filter(p => p.prediction_profile !== null);

      const profileDistribution = Array.from({ length: 10 }, (_, i) => {
        const profile = i + 1;
        const count = patientsWithPredictions.filter(p => p.prediction_profile === profile).length;
        return {
          perfil: `Perfil ${profile}`,
          cantidad: count,
        };
      }).filter(item => item.cantidad > 0);

      const categoryData = [
        {
          name: 'Categoría Física',
          Leve: patientsWithPredictions.filter(p => p.cat_fisica === 'Leve').length,
          Moderada: patientsWithPredictions.filter(p => p.cat_fisica === 'Moderada').length,
          Grave: patientsWithPredictions.filter(p => p.cat_fisica === 'Grave').length,
          Completa: patientsWithPredictions.filter(p => p.cat_fisica === 'Completa').length,
        },
        {
          name: 'Categoría Psicosocial',
          Leve: patientsWithPredictions.filter(p => p.cat_psicosocial === 'Leve').length,
          Moderada: patientsWithPredictions.filter(p => p.cat_psicosocial === 'Moderada').length,
          Grave: patientsWithPredictions.filter(p => p.cat_psicosocial === 'Grave').length,
          Completa: patientsWithPredictions.filter(p => p.cat_psicosocial === 'Completa').length,
        },
      ];

      setAnalytics({
        totalPatients: patients.length,
        patientsWithPredictions: patientsWithPredictions.length,
        profileDistribution,
        categoryData,
        averageProfile: patientsWithPredictions.length > 0
          ? patientsWithPredictions.reduce((sum, p) => sum + (p.prediction_profile || 0), 0) / patientsWithPredictions.length
          : 0,
        averageGlobalLevel: patientsWithPredictions.length > 0
          ? patientsWithPredictions.reduce((sum, p) => sum + p.nivel_global, 0) / patientsWithPredictions.length
          : 0,
      });
    } catch (error) {
      console.error('Error loading local analytics:', error);
    }
  };

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

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
        <h1 className="text-3xl font-bold">{t('analytics')}</h1>
        <p className="text-muted-foreground mt-2">
          Análisis detallado de predicciones y tendencias
        </p>
      </div>

      {!analytics || analytics.patientsWithPredictions === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin datos disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No hay predicciones realizadas aún. Realiza predicciones para ver el análisis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Gráfica 1: Distribución de Perfiles de Predicción */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Perfiles de Predicción</CardTitle>
              <p className="text-sm text-muted-foreground">
                Cantidad de pacientes por perfil de barrera
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.profileDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ perfil, cantidad, percent }) => 
                      `${perfil}: ${cantidad} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="cantidad"
                  >
                    {analytics.profileDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfica 2: Comparación de Categorías Física vs Psicosocial */}
          <Card>
            <CardHeader>
              <CardTitle>Categorías Física vs Psicosocial</CardTitle>
              <p className="text-sm text-muted-foreground">
                Comparación de severidad entre ambas categorías
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Leve" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="Moderada" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="Grave" fill="hsl(var(--chart-3))" />
                  <Bar dataKey="Completa" fill="hsl(var(--chart-4))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Estadísticas adicionales */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Resumen Estadístico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Pacientes</p>
                  <p className="text-2xl font-bold">{analytics.totalPatients}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Con Predicciones</p>
                  <p className="text-2xl font-bold">{analytics.patientsWithPredictions}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Perfil Promedio</p>
                  <p className="text-2xl font-bold">{analytics.averageProfile.toFixed(1)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Nivel Global Promedio</p>
                  <p className="text-2xl font-bold">{analytics.averageGlobalLevel.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
