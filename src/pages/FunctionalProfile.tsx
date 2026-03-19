import { useState, useEffect } from 'react';
import { FileText, Send, Loader2, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { patientService, Patient } from '@/services/patients';
import { toast } from 'sonner';

export default function FunctionalProfile() {
  const { language } = useLanguage();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportPatientId, setReportPatientId] = useState<string | null>(null);

  const es = language === 'es';

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } catch {
      toast.error(es ? 'Error al cargar pacientes' : 'Error loading patients');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === Number(selectedPatientId));

  const getProfileLabel = (profile: number | null) => {
    if (profile === null) return es ? 'Sin predicción' : 'No prediction';
    const labels: Record<number, { es: string; en: string }> = {
      0: { es: 'Perfil 0 - Barreras Bajas/Focalizadas', en: 'Profile 0 - Low/Focused Barriers' },
      1: { es: 'Perfil 1 - Barreras Moderadas/Mixtas', en: 'Profile 1 - Moderate/Mixed Barriers' },
      2: { es: 'Perfil 2 - Barreras Altas/Generalizadas', en: 'Profile 2 - High/Generalized Barriers' },
    };
    return labels[profile]?.[es ? 'es' : 'en'] || `${es ? 'Perfil' : 'Profile'} ${profile}`;
  };

  const getProfileColor = (profile: number | null) => {
    if (profile === null) return 'bg-muted text-muted-foreground';
    const colors: Record<number, string> = {
      0: 'bg-green-500 text-white',
      1: 'bg-yellow-500 text-white',
      2: 'bg-red-500 text-white',
    };
    return colors[profile] || 'bg-muted text-muted-foreground';
  };

  const getGeneratedReport = () => {
    const rp = patients.find(p => p.id === Number(reportPatientId));
    return rp ? generateMockReport(rp) : null;
  };

  const handleGenerate = async () => {
    if (!selectedPatient) return;

    setIsGenerating(true);
    setReportPatientId(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      setReportPatientId(selectedPatientId);
      toast.success(es ? 'Perfil funcional generado exitosamente' : 'Functional profile generated successfully');
    } catch {
      toast.error(es ? 'Error al generar el perfil' : 'Error generating profile');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockReport = (patient: Patient): string => {
    const profileDesc = patient.prediction_profile !== null
      ? getProfileLabel(patient.prediction_profile)
      : (es ? 'No disponible' : 'Not available');

    if (es) {
      return `═══════════════════════════════════════════════
PERFIL FUNCIONAL - CLASIFICACIÓN ICF
Resolución 113 de 2020 - Colombia
═══════════════════════════════════════════════

PACIENTE: ${patient.nombre_apellidos}
EDAD: ${patient.edad} años | GÉNERO: ${patient.genero}
CAUSA DE DEFICIENCIA: ${patient.causa_deficiencia}
CATEGORÍA FÍSICA: ${patient.cat_fisica}
CATEGORÍA PSICOSOCIAL: ${patient.cat_psicosocial}

───────────────────────────────────────────────
PREDICCIÓN DE PERCEPCIÓN DE BARRERAS
───────────────────────────────────────────────
Perfil asignado: ${profileDesc}
${patient.prediction_description || 'Sin descripción de predicción disponible.'}

───────────────────────────────────────────────
CÓDIGOS ICF IDENTIFICADOS
───────────────────────────────────────────────

▸ Funciones Corporales:
  • b710 - Funciones relacionadas con la movilidad articular
  • b730 - Funciones relacionadas con la fuerza muscular
  • b280 - Sensación de dolor

▸ Actividades y Participación:
  • d450 - Andar (Nivel D4: ${patient.nivel_d4})
  • d510 - Lavarse (Nivel D5: ${patient.nivel_d5})
  • d540 - Vestirse (Nivel D5: ${patient.nivel_d5})
  • d640 - Realizar quehaceres domésticos (Nivel D6: ${patient.nivel_d6})
  • d310 - Comunicación - recibir mensajes hablados (Nivel D3: ${patient.nivel_d3})
  • d175 - Resolver problemas (Nivel D1: ${patient.nivel_d1})
  • d210 - Llevar a cabo tareas generales (Nivel D2: ${patient.nivel_d2})

▸ Factores Ambientales:
  • e310 - Apoyo de familiares cercanos
  • e580 - Servicios de salud
  • e150 - Productos y tecnología para uso personal

───────────────────────────────────────────────
RESOLUCIÓN 113 DE 2020 - RECOMENDACIONES
───────────────────────────────────────────────

Según la Resolución 113 de 2020 del Ministerio de Salud y Protección 
Social de Colombia, se recomienda:

1. REHABILITACIÓN INTEGRAL:
   Incluir al paciente en un programa de rehabilitación basado en 
   comunidad (RBC) que contemple las dimensiones de salud, educación, 
   medios de vida, participación social y empoderamiento.

2. CERTIFICACIÓN DE DISCAPACIDAD:
   Proceder con la certificación de discapacidad según los criterios 
   de la CIF, documentando los niveles funcionales reportados 
   (Nivel Global: ${patient.nivel_global}).

3. PLAN INDIVIDUAL DE ATENCIÓN:
   Diseñar un plan que aborde las barreras identificadas en el perfil 
   predictivo, priorizando las áreas con mayor nivel de dificultad.

4. SEGUIMIENTO PERIÓDICO:
   Establecer controles cada 3-6 meses para evaluar la evolución 
   del perfil funcional y ajustar intervenciones.

5. ARTICULACIÓN INTERSECTORIAL:
   Coordinar con entidades de salud, educación y trabajo para 
   garantizar la inclusión social efectiva del paciente.

═══════════════════════════════════════════════
Nota: Este reporte es generado como apoyo al profesional de salud.
La clasificación final debe ser validada clínicamente.
═══════════════════════════════════════════════`;
    }

    return `═══════════════════════════════════════════════
FUNCTIONAL PROFILE - ICF CLASSIFICATION
Resolution 113 of 2020 - Colombia
═══════════════════════════════════════════════

PATIENT: ${patient.nombre_apellidos}
AGE: ${patient.edad} years | GENDER: ${patient.genero}
DEFICIENCY CAUSE: ${patient.causa_deficiencia}
PHYSICAL CATEGORY: ${patient.cat_fisica}
PSYCHOSOCIAL CATEGORY: ${patient.cat_psicosocial}

───────────────────────────────────────────────
BARRIER PERCEPTION PREDICTION
───────────────────────────────────────────────
Assigned profile: ${profileDesc}
${patient.prediction_description || 'No prediction description available.'}

───────────────────────────────────────────────
IDENTIFIED ICF CODES
───────────────────────────────────────────────

▸ Body Functions:
  • b710 - Joint mobility functions
  • b730 - Muscle power functions
  • b280 - Sensation of pain

▸ Activities & Participation:
  • d450 - Walking (Level D4: ${patient.nivel_d4})
  • d510 - Washing oneself (Level D5: ${patient.nivel_d5})
  • d540 - Dressing (Level D5: ${patient.nivel_d5})
  • d640 - Doing housework (Level D6: ${patient.nivel_d6})
  • d310 - Communicating - receiving spoken messages (Level D3: ${patient.nivel_d3})
  • d175 - Solving problems (Level D1: ${patient.nivel_d1})
  • d210 - Undertaking general tasks (Level D2: ${patient.nivel_d2})

▸ Environmental Factors:
  • e310 - Support from close family members
  • e580 - Health services
  • e150 - Products and technology for personal use

───────────────────────────────────────────────
RESOLUTION 113 OF 2020 - RECOMMENDATIONS
───────────────────────────────────────────────

According to Resolution 113 of 2020 from the Colombian Ministry of 
Health and Social Protection:

1. COMPREHENSIVE REHABILITATION:
   Include the patient in a community-based rehabilitation (CBR) 
   program covering health, education, livelihoods, social 
   participation and empowerment.

2. DISABILITY CERTIFICATION:
   Proceed with disability certification per ICF criteria, 
   documenting reported functional levels 
   (Global Level: ${patient.nivel_global}).

3. INDIVIDUAL CARE PLAN:
   Design a plan addressing barriers identified in the predictive 
   profile, prioritizing areas with highest difficulty levels.

4. PERIODIC FOLLOW-UP:
   Schedule check-ups every 3-6 months to evaluate functional 
   profile evolution and adjust interventions.

5. INTERSECTORAL COORDINATION:
   Coordinate with health, education and employment entities to 
   ensure effective social inclusion.

═══════════════════════════════════════════════
Note: This report supports healthcare professionals. 
Final classification must be clinically validated.
═══════════════════════════════════════════════`;
  };

  const handleCopy = () => {
    const report = getGeneratedReport();
    if (report) {
      navigator.clipboard.writeText(report);
      toast.success(es ? 'Copiado al portapapeles' : 'Copied to clipboard');
    }
  };

  const handleDownload = () => {
    const report = getGeneratedReport();
    if (!report || !selectedPatient) return;
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perfil_funcional_${selectedPatient.nombre_apellidos.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(es ? 'Archivo descargado' : 'File downloaded');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {es ? 'Perfil Funcional ICF' : 'ICF Functional Profile'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {es
            ? 'Genera códigos ICF y recomendaciones según la Resolución 113 de 2020'
            : 'Generate ICF codes and recommendations per Resolution 113 of 2020'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left panel - Patient selection & info */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {es ? 'Seleccionar Paciente' : 'Select Patient'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{es ? 'Paciente' : 'Patient'}</Label>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger>
                    <SelectValue placeholder={es ? 'Seleccionar paciente...' : 'Select patient...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.nombre_apellidos} - {es ? 'Edad' : 'Age'}: {patient.edad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPatient && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">
                      {es ? 'Datos del Paciente' : 'Patient Data'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">{es ? 'Nombre' : 'Name'}</div>
                      <div className="font-medium">{selectedPatient.nombre_apellidos}</div>

                      <div className="text-muted-foreground">{es ? 'Edad' : 'Age'}</div>
                      <div className="font-medium">{selectedPatient.edad}</div>

                      <div className="text-muted-foreground">{es ? 'Género' : 'Gender'}</div>
                      <div className="font-medium">{selectedPatient.genero}</div>

                      <div className="text-muted-foreground">{es ? 'Causa' : 'Cause'}</div>
                      <div className="font-medium">{selectedPatient.causa_deficiencia}</div>

                      <div className="text-muted-foreground">{es ? 'Cat. Física' : 'Physical Cat.'}</div>
                      <div className="font-medium">{selectedPatient.cat_fisica}</div>

                      <div className="text-muted-foreground">{es ? 'Cat. Psicosocial' : 'Psychosocial Cat.'}</div>
                      <div className="font-medium">{selectedPatient.cat_psicosocial}</div>
                    </div>

                    <Separator />

                    <h4 className="font-semibold text-sm">
                      {es ? 'Niveles de Actividad' : 'Activity Levels'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">D1 {es ? '(Aprendizaje)' : '(Learning)'}</div>
                      <div className="font-medium">{selectedPatient.nivel_d1}</div>
                      <div className="text-muted-foreground">D2 {es ? '(Tareas)' : '(Tasks)'}</div>
                      <div className="font-medium">{selectedPatient.nivel_d2}</div>
                      <div className="text-muted-foreground">D3 {es ? '(Comunicación)' : '(Communication)'}</div>
                      <div className="font-medium">{selectedPatient.nivel_d3}</div>
                      <div className="text-muted-foreground">D4 {es ? '(Movilidad)' : '(Mobility)'}</div>
                      <div className="font-medium">{selectedPatient.nivel_d4}</div>
                      <div className="text-muted-foreground">D5 {es ? '(Autocuidado)' : '(Self-Care)'}</div>
                      <div className="font-medium">{selectedPatient.nivel_d5}</div>
                      <div className="text-muted-foreground">D6 {es ? '(Vida Dom.)' : '(Domestic)'}</div>
                      <div className="font-medium">{selectedPatient.nivel_d6}</div>
                      <div className="text-muted-foreground font-semibold">{es ? 'Nivel Global' : 'Global Level'}</div>
                      <div className="font-bold">{selectedPatient.nivel_global}</div>
                    </div>

                    <Separator />

                    <h4 className="font-semibold text-sm">
                      {es ? 'Predicción de Barreras' : 'Barrier Prediction'}
                    </h4>
                    <Badge className={getProfileColor(selectedPatient.prediction_profile)}>
                      {getProfileLabel(selectedPatient.prediction_profile)}
                    </Badge>
                    {selectedPatient.prediction_description && (
                      <p className="text-xs text-muted-foreground">
                        {selectedPatient.prediction_description}
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full gap-2 mt-4"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {es ? 'Generando perfil...' : 'Generating profile...'}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {es ? 'Generar Perfil Funcional' : 'Generate Functional Profile'}
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right panel - Generated report */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {es ? 'Reporte Generado' : 'Generated Report'}
                </CardTitle>
                {generatedReport && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-1" />
                      {es ? 'Copiar' : 'Copy'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-1" />
                      {es ? 'Descargar' : 'Download'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground text-sm">
                    {es
                      ? 'Analizando datos del paciente y generando códigos ICF...'
                      : 'Analyzing patient data and generating ICF codes...'}
                  </p>
                </div>
              ) : generatedReport ? (
                <ScrollArea className="h-[600px]">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground bg-muted p-4 rounded-lg">
                    {generatedReport}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {es
                      ? 'Selecciona un paciente y genera el perfil funcional para ver los códigos ICF y recomendaciones'
                      : 'Select a patient and generate the functional profile to see ICF codes and recommendations'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
