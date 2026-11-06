export type Role = 'admin' | 'instructor' | 'aprendiz';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  nombre: string;
  role: Role;
  email: string;
  documento?: string;
  cargo?: string;
  aprendizId?: string;
  fichaId?: string;
  regional?: string;
  avatar?: string;
}

export type Etapa = 'Lectiva' | 'Práctica' | 'Certificado';

export type ItemEstado = 'none' | 'pendiente' | 'aprobado' | 'rechazado';

export interface ExcelSheetData {
  nombreHoja: string;
  hojasDisponibles?: string[];
  hojasMap?: Record<string, Array<Array<string | number>>>;
  totalFilas: number;
  totalColumnas: number;
  filas: Array<Array<string | number>>;
  semanaReportada?: string;
  horasReportadas?: number;
}

export interface ArchivoSimulado {
  nombre: string;
  tamano: string;
  fechaCarga: string;
  fechaRevision?: string;
  periodoQuincenal?: string;
  horasPeriodo?: number;
  horasAcumuladas?: number;
  actividades?: string[];
  competencias?: string[];
  observacionesAprendiz?: string;
  observacionesInstructor?: string;
  tutorEmpresa?: string;
  cargoTutor?: string;
  firmadoAprendiz?: boolean;
  firmadoTutor?: boolean;
  tipoDocumento?: string;
  formato?: 'excel' | 'pdf' | 'imagen';
  dataUrl?: string;
  excelDetalles?: ExcelSheetData;
}

export interface BitacoraItem {
  id: string; // 'B1'..'B12' | 'carnet' | 'cedula' | 'ape' | 'tyt'
  label: string;
  tipo: 'bitacora' | 'soporte';
  numero?: number;
  estado: ItemEstado;
  archivo?: ArchivoSimulado;
}

export interface EmpresaData {
  razonSocial: string;
  nit: string;
  direccion: string;
  ciudad: string;
  tutorNombre: string;
  tutorCargo: string;
  tutorTelefono: string;
  tutorEmail: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: 'Contrato de Aprendizaje' | 'Pasantía' | 'Vínculo Laboral' | 'Proyecto Productivo';
  lat: number;
  lng: number;
}

export interface Aprendiz {
  id: string;
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
  fichaId: string;
  fichaNumero: string;
  programa: string;
  etapa: Etapa;
  items: Record<string, BitacoraItem>;
  itemsAprobadosCount?: number;
  empresa?: EmpresaData;
  pazYSalvoGenerado?: boolean;
  fechaPazYSalvo?: string;
}

export interface Ficha {
  id: string;
  numero: string;
  programa: string;
  codigoPrograma: string;
  regional: string;
  centro: string;
  fechaInicioLectiva: string;
  fechaFinLectiva: string;
  fechaInicioPractica: string;
  fechaFinPractica: string;
  instructorId: string;
  instructorNombre: string;
  totalAprendices: number;
}

export interface Instructor {
  id: string;
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
  regional: string;
  centro: string;
  fichasAsignadas: string[];
}
