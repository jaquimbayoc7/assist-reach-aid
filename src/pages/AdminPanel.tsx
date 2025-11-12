import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

export default function AdminPanel() {
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { language } = useLanguage();

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
      
      toast.success(language === 'es' 
        ? 'Médico registrado exitosamente' 
        : 'Doctor registered successfully');
      
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterName('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 
        (language === 'es' ? 'Error al registrar médico' : 'Error registering doctor'));
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'es' ? 'Panel de Administración' : 'Admin Panel'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === 'es' 
            ? 'Gestione médicos y configuración del sistema'
            : 'Manage doctors and system configuration'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <CardTitle>
              {language === 'es' ? 'Registrar Nuevo Médico' : 'Register New Doctor'}
            </CardTitle>
          </div>
          <CardDescription>
            {language === 'es' 
              ? 'Complete el formulario para crear una cuenta de médico'
              : 'Fill out the form to create a doctor account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">
                {language === 'es' ? 'Nombre Completo' : 'Full Name'}
              </Label>
              <Input
                id="register-name"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder={language === 'es' ? 'Dr. Juan Pérez' : 'Dr. John Doe'}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email">
                {language === 'es' ? 'Correo Electrónico' : 'Email'}
              </Label>
              <Input
                id="register-email"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="doctor@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">
                {language === 'es' ? 'Contraseña' : 'Password'}
              </Label>
              <Input
                id="register-password"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isRegistering}>
              {isRegistering 
                ? (language === 'es' ? 'Registrando...' : 'Registering...') 
                : (language === 'es' ? 'Registrar Médico' : 'Register Doctor')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
