import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService, User } from '@/services/api';
import { toast } from 'sonner';
import { UserPlus, Users } from 'lucide-react';

export default function AdminPanel() {
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerRole, setRegisterRole] = useState<'admin' | 'médico'>('médico');
  const [isRegistering, setIsRegistering] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const fetchedUsers = await apiService.getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 
        (language === 'es' ? 'Error al cargar usuarios' : 'Error loading users'));
    } finally {
      setIsLoadingUsers(false);
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
        role: registerRole
      });
      
      toast.success(language === 'es' 
        ? 'Usuario registrado exitosamente' 
        : 'User registered successfully');
      
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterName('');
      setRegisterRole('médico');
      loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 
        (language === 'es' ? 'Error al registrar usuario' : 'Error registering user'));
    } finally {
      setIsRegistering(false);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await apiService.updateUserStatus(userId, !currentStatus);
      toast.success(language === 'es' 
        ? 'Estado actualizado exitosamente' 
        : 'Status updated successfully');
      loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 
        (language === 'es' ? 'Error al actualizar estado' : 'Error updating status'));
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
              {language === 'es' ? 'Creación de Usuario' : 'User Creation'}
            </CardTitle>
          </div>
          <CardDescription>
            {language === 'es' 
              ? 'Complete el formulario para crear una nueva cuenta de usuario'
              : 'Fill out the form to create a new user account'}
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
            <div className="space-y-2">
              <Label htmlFor="register-role">
                {language === 'es' ? 'Rol' : 'Role'}
              </Label>
              <Select value={registerRole} onValueChange={(value: 'admin' | 'médico') => setRegisterRole(value)}>
                <SelectTrigger id="register-role">
                  <SelectValue placeholder={language === 'es' ? 'Seleccione un rol' : 'Select a role'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="médico">
                    {language === 'es' ? 'Médico' : 'Doctor'}
                  </SelectItem>
                  <SelectItem value="admin">
                    {language === 'es' ? 'Administrador' : 'Administrator'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isRegistering}>
              {isRegistering 
                ? (language === 'es' ? 'Registrando...' : 'Registering...') 
                : (language === 'es' ? 'Registrar Usuario' : 'Register User')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>
              {language === 'es' ? 'Gestión de Usuarios' : 'User Management'}
            </CardTitle>
          </div>
          <CardDescription>
            {language === 'es' 
              ? 'Lista de todos los usuarios del sistema'
              : 'List of all system users'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <p className="text-muted-foreground text-center py-4">
              {language === 'es' ? 'Cargando usuarios...' : 'Loading users...'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'es' ? 'Nombre' : 'Name'}</TableHead>
                  <TableHead>{language === 'es' ? 'Email' : 'Email'}</TableHead>
                  <TableHead>{language === 'es' ? 'Rol' : 'Role'}</TableHead>
                  <TableHead>{language === 'es' ? 'Estado' : 'Status'}</TableHead>
                  <TableHead className="text-right">{language === 'es' ? 'Acciones' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      {language === 'es' ? 'No hay usuarios registrados' : 'No users registered'}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'default' : 'destructive'}>
                          {user.is_active 
                            ? (language === 'es' ? 'Activo' : 'Active')
                            : (language === 'es' ? 'Inactivo' : 'Inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Label htmlFor={`status-${user.id}`} className="text-sm">
                            {language === 'es' ? 'Activo' : 'Active'}
                          </Label>
                          <Switch
                            id={`status-${user.id}`}
                            checked={user.is_active}
                            onCheckedChange={() => handleToggleUserStatus(user.id, user.is_active)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
