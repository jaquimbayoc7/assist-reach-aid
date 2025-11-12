import { Users, Activity, TrendingUp, Target } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { t } = useLanguage();

  // Mock data - replace with actual API calls
  const metrics = [
    {
      title: t('totalPatients'),
      value: '547',
      icon: Users,
      trend: { value: '12% from last month', isPositive: true },
    },
    {
      title: t('activeCases'),
      value: '339',
      icon: Activity,
      trend: { value: '8% from last month', isPositive: true },
    },
    {
      title: t('predictionsToday'),
      value: '147',
      icon: TrendingUp,
      trend: { value: '5% from yesterday', isPositive: true },
    },
    {
      title: t('successRate'),
      value: '89.75%',
      icon: Target,
      trend: { value: '2% from last month', isPositive: true },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your disability assessment activities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('recentPatients')}</CardTitle>
            <Button variant="ghost" size="sm">
              {t('viewAll')}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center py-8">
                {t('noPatientsYet')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('predictionHistory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center py-8">
                {t('addFirstPatient')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
