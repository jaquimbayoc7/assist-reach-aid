import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Globe, Activity, Brain, Users } from 'lucide-react';
import disabilityHero from '@/assets/disability-hero.jpg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiService } from '@/services/api';

export default function LoginLanding() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  // Register form
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const { user, login } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success(t('success'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    
    try {
      await apiService.registerDoctor({
        email: registerEmail,
        password: registerPassword,
        full_name: registerName,
        role: 'médico'
      });
      
      toast.success('Registro exitoso. Por favor inicie sesión.');
      setShowRegister(false);
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterName('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al registrarse');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">DisabilityProfile</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  <span className={language === 'en' ? 'font-bold' : ''}>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('es')}>
                  <span className={language === 'es' ? 'font-bold' : ''}>Español</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showRegister} onOpenChange={setShowRegister}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  {language === 'es' ? 'Registrarse' : 'Sign Up'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {language === 'es' ? 'Registro de Médico' : 'Doctor Registration'}
                  </DialogTitle>
                  <DialogDescription>
                    {language === 'es' 
                      ? 'Complete el formulario para crear su cuenta médica' 
                      : 'Fill out the form to create your medical account'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">
                      {language === 'es' ? 'Nombre Completo' : 'Full Name'}
                    </Label>
                    <Input
                      id="register-name"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">{t('email')}</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">{t('password')}</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isRegistering}>
                    {isRegistering 
                      ? (language === 'es' ? 'Registrando...' : 'Registering...') 
                      : (language === 'es' ? 'Registrarse' : 'Sign Up')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            {language === 'es' 
              ? 'Sistema Inteligente de Perfilamiento de Discapacidad'
              : 'Intelligent Disability Profiling System'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {language === 'es'
              ? 'Herramienta avanzada para profesionales de la salud que facilita la evaluación y predicción de barreras en personas con discapacidad mediante inteligencia artificial.'
              : 'Advanced tool for healthcare professionals that facilitates the assessment and prediction of barriers in people with disabilities using artificial intelligence.'}
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-start gap-3">
              <Brain className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">
                  {language === 'es' ? 'IA Predictiva' : 'Predictive AI'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'es' 
                    ? 'Modelos híbridos de aprendizaje automático'
                    : 'Hybrid machine learning models'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">
                  {language === 'es' ? 'Gestión de Pacientes' : 'Patient Management'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'es' 
                    ? 'Historiales completos y seguimiento'
                    : 'Complete records and tracking'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <img 
              src={disabilityHero} 
              alt="Physical disability support and assessment"
              className="rounded-xl shadow-lg w-full object-cover max-h-64"
            />
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              {language === 'es' ? 'Acceso Médico' : 'Medical Access'}
            </CardTitle>
            <CardDescription>
              {language === 'es'
                ? 'Ingrese sus credenciales para acceder al sistema'
                : 'Enter your credentials to access the system'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('loading') : t('login')}
              </Button>
              
              <p className="text-sm text-center text-muted-foreground">
                {language === 'es'
                  ? '¿No tiene cuenta? Use el botón Registrarse arriba'
                  : "Don't have an account? Use the Sign Up button above"}
              </p>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            {language === 'es' 
              ? 'Desarrollado por: Ing. Julián Andrés Quimbayo Castro'
              : 'Developed by: Eng. Julián Andrés Quimbayo Castro'}
          </p>
        </div>
      </footer>
    </div>
  );
}
