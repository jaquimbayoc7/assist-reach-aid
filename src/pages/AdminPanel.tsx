import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService, User } from '@/services/api';
import { toast } from 'sonner';
import { UserPlus, Users, Copy, Check, UserCheck, UserX } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function AdminPanel() {
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerRole, setRegisterRole] = useState<'admin' | 'médico'>('médico');
  const [isRegistering, setIsRegistering] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string, name: string}>({ email: '', password: '', name: '' });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
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
      const credentials = {
        email: registerEmail,
        password: registerPassword,
        name: registerName
      };

      await apiService.registerDoctor({
        email: registerEmail,
        password: registerPassword,
        full_name: registerName,
        role: registerRole
      });
      
      toast.success(language === 'es' 
        ? 'Usuario registrado exitosamente' 
        : 'User registered successfully');
      
      setCreatedCredentials(credentials);
      setShowCredentialsModal(true);
      
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

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
      }
      toast.success(language === 'es' ? 'Copiado al portapapeles' : 'Copied to clipboard');
    } catch (error) {
      toast.error(language === 'es' ? 'Error al copiar' : 'Error copying');
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

  // Calculate metrics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const inactiveUsers = users.filter(u => !u.is_active).length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const doctorUsers = users.filter(u => u.role === 'médico').length;

  // Data for pie charts
  const roleDistributionData = [
    { name: language === 'es' ? 'Administradores' : 'Administrators', value: adminUsers, color: 'hsl(var(--primary))' },
    { name: language === 'es' ? 'Médicos' : 'Doctors', value: doctorUsers, color: 'hsl(var(--chart-2))' }
  ];

  const statusDistributionData = [
    { name: language === 'es' ? 'Activos' : 'Active', value: activeUsers, color: 'hsl(var(--success))' },
    { name: language === 'es' ? 'Inactivos' : 'Inactive', value: inactiveUsers, color: 'hsl(var(--destructive))' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'es' ? 'Panel de Administración' : 'Admin Panel'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === 'es' 
            ? 'Gestione usuarios y visualice métricas del sistema'
            : 'Manage users and view system metrics'}
        </p>
      </div>

      {/* User Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title={language === 'es' ? 'Total Usuarios' : 'Total Users'}
          value={totalUsers}
          icon={Users}
        />
        <MetricCard
          title={language === 'es' ? 'Usuarios Activos' : 'Active Users'}
          value={activeUsers}
          icon={UserCheck}
        />
        <MetricCard
          title={language === 'es' ? 'Usuarios Inactivos' : 'Inactive Users'}
          value={inactiveUsers}
          icon={UserX}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'es' ? 'Distribución por Rol' : 'Role Distribution'}
            </CardTitle>
            <CardDescription>
              {language === 'es' 
                ? 'Usuarios organizados por tipo de rol' 
                : 'Users organized by role type'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalUsers > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={roleDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                {language === 'es' ? 'No hay datos disponibles' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'es' ? 'Estado de Usuarios' : 'User Status'}
            </CardTitle>
            <CardDescription>
              {language === 'es' 
                ? 'Usuarios activos vs inactivos' 
                : 'Active vs inactive users'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalUsers > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                {language === 'es' ? 'No hay datos disponibles' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>
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
                : (language === 'es' ? 'Crear Usuario' : 'Create User')}
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
              ? 'Visualice y gestione todos los usuarios del sistema'
              : 'View and manage all system users'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'es' ? 'No hay usuarios registrados' : 'No users registered'}
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' 
                            ? (language === 'es' ? 'Administrador' : 'Administrator')
                            : (language === 'es' ? 'Médico' : 'Doctor')}
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
                          <Label htmlFor={`user-status-${user.id}`} className="text-sm">
                            {user.is_active 
                              ? (language === 'es' ? 'Desactivar' : 'Deactivate')
                              : (language === 'es' ? 'Activar' : 'Activate')}
                          </Label>
                          <Switch
                            id={`user-status-${user.id}`}
                            checked={user.is_active}
                            onCheckedChange={() => handleToggleUserStatus(user.id, user.is_active)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credentials Modal */}
      <Dialog open={showCredentialsModal} onOpenChange={setShowCredentialsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'es' ? 'Usuario Creado Exitosamente' : 'User Created Successfully'}
            </DialogTitle>
            <DialogDescription>
              {language === 'es' 
                ? 'Guarde estas credenciales de forma segura. No podrá verlas nuevamente.'
                : 'Save these credentials securely. You will not be able to see them again.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>{language === 'es' ? 'Nombre' : 'Name'}</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-mono">{createdCredentials.name}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'es' ? 'Correo Electrónico' : 'Email'}</Label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-md">
                  <p className="font-mono">{createdCredentials.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(createdCredentials.email, 'email')}
                >
                  {copiedEmail ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'es' ? 'Contraseña' : 'Password'}</Label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-md">
                  <p className="font-mono">{createdCredentials.password}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(createdCredentials.password, 'password')}
                >
                  {copiedPassword ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setShowCredentialsModal(false)}>
              {language === 'es' ? 'Entendido' : 'Got it'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
