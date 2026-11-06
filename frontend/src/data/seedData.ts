
import { Aprendiz, BitacoraItem, Ficha, Instructor } from '../types';

export const ITEM_KEYS = [
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
  'B7', 'B8', 'B9', 'B10', 'B11', 'B12',
  'carnet', 'cedula', 'ape', 'tyt'
] as const;

export const ITEM_LABELS: Record<string, {
  label: string;
  fullTitle: string;
  tipo: 'bitacora' | 'soporte';
}> = {
  B1: { label: 'B1', fullTitle: 'Bitácora Quincenal 01', tipo: 'bitacora' },
  B2: { label: 'B2', fullTitle: 'Bitácora Quincenal 02', tipo: 'bitacora' },
  B3: { label: 'B3', fullTitle: 'Bitácora Quincenal 03', tipo: 'bitacora' },
  B4: { label: 'B4', fullTitle: 'Bitácora Quincenal 04', tipo: 'bitacora' },
  B5: { label: 'B5', fullTitle: 'Bitácora Quincenal 05', tipo: 'bitacora' },
  B6: { label: 'B6', fullTitle: 'Bitácora Quincenal 06', tipo: 'bitacora' },
  B7: { label: 'B7', fullTitle: 'Bitácora Quincenal 07', tipo: 'bitacora' },
  B8: { label: 'B8', fullTitle: 'Bitácora Quincenal 08', tipo: 'bitacora' },
  B9: { label: 'B9', fullTitle: 'Bitácora Quincenal 09', tipo: 'bitacora' },
  B10: { label: 'B10', fullTitle: 'Bitácora Quincenal 10', tipo: 'bitacora' },
  B11: { label: 'B11', fullTitle: 'Bitácora Quincenal 11', tipo: 'bitacora' },
  B12: { label: 'B12', fullTitle: 'Bitácora Quincenal 12', tipo: 'bitacora' },
  carnet: {
    label: 'Carnet',
    fullTitle: 'Copia Carnet Institucional SENA',
    tipo: 'soporte'
  },
  cedula: {
    label: 'C.C.',
    fullTitle: 'Cédula de Ciudadanía al 150%',
    tipo: 'soporte'
  },
  ape: {
    label: 'APE',
    fullTitle: 'Certificado Registro APE (Agencia Pública de Empleo)',
    tipo: 'soporte'
  },
  tyt: {
    label: 'TyT',
    fullTitle: 'Certificado Presentación Pruebas Saber TyT',
    tipo: 'soporte'
  }
};

export const INITIAL_INSTRUCTORS: Instructor[] = [
  {
    id: 'inst-1',
    nombre: 'Ing. Hernán Darío Velásquez',
    documento: '71294810',
    email: 'hdvelasquez@sena.edu.co',
    telefono: '315 892 4102',
    regional: 'Regional Antioquia',
    centro: 'Centro de Teleinformática y Producción Industrial (CTPI)',
    fichasAsignadas: ['ficha-1', 'ficha-2']
  },
  {
    id: 'inst-2',
    nombre: 'Ing. Claudia Patricia Morales',
    documento: '52849102',
    email: 'cpmorales@sena.edu.co',
    telefono: '310 445 9012',
    regional: 'Regional Distrito Capital',
    centro: 'Centro de Gestión de Mercados, Logística y Tecnologías de la Información',
    fichasAsignadas: ['ficha-3']
  }
];

export const INITIAL_FICHAS: Ficha[] = [
  {
    id: 'ficha-1',
    numero: '2847431',
    programa: 'Análisis y Desarrollo de Software (ADSO)',
    codigoPrograma: '228106',
    regional: 'Regional Antioquia',
    centro: 'Centro de Formación en Diseño, Confección y Moda / CTPI',
    fechaInicioLectiva: '2024-04-15',
    fechaFinLectiva: '2025-04-14',
    fechaInicioPractica: '2025-04-15',
    fechaFinPractica: '2025-10-15',
    instructorId: 'inst-1',
    instructorNombre: 'Ing. Hernán Darío Velásquez',
    totalAprendices: 5
  },
  {
    id: 'ficha-2',
    numero: '2712950',
    programa: 'Gestión de Redes de Datos',
    codigoPrograma: '228107',
    regional: 'Regional Antioquia',
    centro: 'Centro de Teleinformática y Producción Industrial',
    fechaInicioLectiva: '2024-02-01',
    fechaFinLectiva: '2025-02-01',
    fechaInicioPractica: '2025-02-02',
    fechaFinPractica: '2025-08-02',
    instructorId: 'inst-1',
    instructorNombre: 'Ing. Hernán Darío Velásquez',
    totalAprendices: 1
  }
];

function buildBitacora(
  id: string,
  num: number,
  horasAcumuladas: number,
  aprendizNombre: string,
  empresaNombre: string,
  tutorNombre: string,
  cargoTutor: string,
  periodo: string,
  actividades: string[],
  estado: 'aprobado' | 'pendiente' | 'rechazado' | 'none',
  obsInstructor?: string
): BitacoraItem {
  if (estado === 'none') {
    return {
      id,
      label: id,
      tipo: 'bitacora',
      numero: num,
      estado: 'none'
    };
  }

  return {
    id,
    label: id,
    tipo: 'bitacora',
    numero: num,
    estado,
    archivo: {
      nombre: `Bitacora_${num}_${aprendizNombre.replace(/\s+/g, '_')}.pdf`,
      tamano: '1.4 MB',
      fechaCarga: '2025-06-15',
      fechaRevision:
        estado === 'aprobado' || estado === 'rechazado'
          ? '2025-06-18'
          : undefined,
      periodoQuincenal: periodo,
      horasPeriodo: 80,
      horasAcumuladas,
      actividades,
      competencias: [
        'Construir componentes de software de acuerdo con la arquitectura y especificaciones del cliente',
        'Verificar componentes de software mediante pruebas automatizadas y control de calidad'
      ],
      tutorEmpresa: tutorNombre,
      cargoTutor,
      firmadoAprendiz: true,
      firmadoTutor: estado !== 'rechazado',
      observacionesAprendiz:
        `Cumplimiento satisfactorio del plan quincenal de trabajo en ${empresaNombre}.`,
      observacionesInstructor:
        obsInstructor ||
        (estado === 'aprobado'
          ? 'Bitácora revisada y avalada. Actividades alineadas con el plan formativo de ADSO.'
          : undefined)
    }
  };
}

function buildSoporte(
  id: 'carnet' | 'cedula' | 'ape' | 'tyt',
  aprendizNombre: string,
  estado: 'aprobado' | 'pendiente' | 'rechazado' | 'none',
  obsInstructor?: string
): BitacoraItem {
  const meta = ITEM_LABELS[id];

  if (estado === 'none') {
    return {
      id,
      label: meta.label,
      tipo: 'soporte',
      estado: 'none'
    };
  }

  return {
    id,
    label: meta.label,
    tipo: 'soporte',
    estado,
    archivo: {
      nombre: `${id.toUpperCase()}_${aprendizNombre.replace(/\s+/g, '_')}.pdf`,
      tamano: '840 KB',
      fechaCarga: '2025-05-10',
      fechaRevision:
        estado !== 'pendiente' ? '2025-05-12' : undefined,
      tipoDocumento: meta.fullTitle,
      actividades: [
        `Verificación de documento reglamentario: ${meta.fullTitle}`
      ],
      firmadoAprendiz: true,
      firmadoTutor: true,
      observacionesInstructor:
        obsInstructor ||
        (estado === 'aprobado'
          ? 'Documento institucional válido y legible verificado.'
          : undefined)
    }
  };
}

// APRENDIZ 1: CARLOS MARIO RESTREPO
// 16/16 documentos aprobados.
const itemsCarlos: Record<string, BitacoraItem> = {};

for (let i = 1; i <= 12; i++) {
  const key = `B${i}`;

  itemsCarlos[key] = buildBitacora(
    key,
    i,
    i * 80,
    'Carlos Mario Restrepo',
    'Bancolombia S.A.',
    'Ing. Esteban Restrepo',
    'Líder Técnico de Arquitectura Cloud',
    `Quincena ${i} - Etapa Productiva`,
    [
      'Implementación de microservicios backend con Java Spring Boot y API Gateway.',
      'Diseño de pruebas unitarias con JUnit y Mockito alcanzando 85% de cobertura.',
      'Participación activa en ceremonias Scrum y despliegues en AWS EKS.'
    ],
    'aprobado'
  );
}

itemsCarlos['carnet'] = buildSoporte(
  'carnet', 'Carlos Mario Restrepo', 'aprobado'
);
itemsCarlos['cedula'] = buildSoporte(
  'cedula', 'Carlos Mario Restrepo', 'aprobado'
);
itemsCarlos['ape'] = buildSoporte(
  'ape', 'Carlos Mario Restrepo', 'aprobado'
);
itemsCarlos['tyt'] = buildSoporte(
  'tyt', 'Carlos Mario Restrepo', 'aprobado'
);

// APRENDIZ 2: LAURA SOFÍA GÓMEZ
// Bitácoras inicialmente vacías.
const itemsLaura: Record<string, BitacoraItem> = {};

for (let i = 1; i <= 12; i++) {
  itemsLaura[`B${i}`] = buildBitacora(
    `B${i}`,
    i,
    0,
    'Laura Sofia Gomez',
    'MercadoLibre Colombia',
    'Ing. Roberto Silva',
    'Tech Lead Full Stack',
    `Quincena ${i} - Etapa Productiva`,
    [],
    'none'
  );
}

itemsLaura['carnet'] = buildSoporte(
  'carnet', 'Laura Sofia Gomez', 'aprobado'
);
itemsLaura['cedula'] = buildSoporte(
  'cedula', 'Laura Sofia Gomez', 'aprobado'
);
itemsLaura['ape'] = buildSoporte(
  'ape', 'Laura Sofia Gomez', 'none'
);
itemsLaura['tyt'] = buildSoporte(
  'tyt', 'Laura Sofia Gomez', 'none'
);

// APRENDIZ 3: JUAN DAVID MARTÍNEZ
// Etapa lectiva; sin documentos aprobados.
const itemsJuan: Record<string, BitacoraItem> = {};

for (let i = 1; i <= 12; i++) {
  itemsJuan[`B${i}`] = buildBitacora(
    `B${i}`,
    i,
    0,
    'Juan David Martinez',
    'Ecopetrol S.A.',
    'Dra. Patricia Cárdenas',
    'Gerente TI',
    `Quincena ${i}`,
    [],
    'none'
  );
}

itemsJuan['carnet'] = buildSoporte(
  'carnet', 'Juan David Martinez', 'none'
);
itemsJuan['cedula'] = buildSoporte(
  'cedula', 'Juan David Martinez', 'none'
);
itemsJuan['ape'] = buildSoporte(
  'ape', 'Juan David Martinez', 'none'
);
itemsJuan['tyt'] = buildSoporte(
  'tyt', 'Juan David Martinez', 'none'
);

// APRENDIZ 4: VALENTINA MORALES
// Cuatro bitácoras aprobadas, quinta pendiente.
const itemsValentina: Record<string, BitacoraItem> = {};

for (let i = 1; i <= 4; i++) {
  itemsValentina[`B${i}`] = buildBitacora(
    `B${i}`,
    i,
    i * 80,
    'Valentina Morales',
    'Globant Colombia',
    'Ing. Camilo Rojas',
    'Staff Software Engineer',
    `Quincena ${i}`,
    [
      'Construcción de interfaces de usuario accesibles con Tailwind CSS y Vue 3.',
      'Integración con servicios GraphQL y control de estado reactivo.'
    ],
    'aprobado'
  );
}

itemsValentina['B5'] = buildBitacora(
  'B5',
  5,
  400,
  'Valentina Morales',
  'Globant Colombia',
  'Ing. Camilo Rojas',
  'Staff Software Engineer',
  'Quincena 5',
  [
    'Pruebas E2E con Cypress y reporte de bugs en Jira.'
  ],
  'pendiente'
);

for (let i = 6; i <= 12; i++) {
  itemsValentina[`B${i}`] = buildBitacora(
    `B${i}`,
    i,
    0,
    'Valentina Morales',
    'Globant Colombia',
    'Ing. Camilo Rojas',
    'Staff Software Engineer',
    `Quincena ${i}`,
    [],
    'none'
  );
}

itemsValentina['carnet'] = buildSoporte(
  'carnet', 'Valentina Morales', 'aprobado'
);
itemsValentina['cedula'] = buildSoporte(
  'cedula', 'Valentina Morales', 'aprobado'
);
itemsValentina['ape'] = buildSoporte(
  'ape', 'Valentina Morales', 'none'
);
itemsValentina['tyt'] = buildSoporte(
  'tyt', 'Valentina Morales', 'none'
);

// APRENDIZ 5: ANDRÉS FELIPE CASTRO
// Doce bitácoras aprobadas y dos soportes aprobados.
const itemsAndres: Record<string, BitacoraItem> = {};

for (let i = 1; i <= 12; i++) {
  itemsAndres[`B${i}`] = buildBitacora(
    `B${i}`,
    i,
    i * 80,
    'Andres Felipe Castro',
    'Grupo SURA',
    'Dra. Marcela Echeverri',
    'Directora de Transformación Digital',
    `Quincena ${i}`,
    [
      'Modelado y migración de bases de datos PostgreSQL a entornos Docker.',
      'Optimización de consultas complejas y generación de reportes analíticos.'
    ],
    'aprobado'
  );
}

itemsAndres['carnet'] = buildSoporte(
  'carnet', 'Andres Felipe Castro', 'aprobado'
);
itemsAndres['cedula'] = buildSoporte(
  'cedula', 'Andres Felipe Castro', 'aprobado'
);
itemsAndres['ape'] = buildSoporte(
  'ape', 'Andres Felipe Castro', 'none'
);
itemsAndres['tyt'] = buildSoporte(
  'tyt', 'Andres Felipe Castro', 'pendiente'
);

// APRENDIZ 6: CAMILA ANDREA TORRES
// 16/16 documentos aprobados.
const itemsCamila: Record<string, BitacoraItem> = {};

for (let i = 1; i <= 12; i++) {
  itemsCamila[`B${i}`] = buildBitacora(
    `B${i}`,
    i,
    i * 80,
    'Camila Andrea Torres',
    'Carvajal Tecnología',
    'Ing. Mauricio Osorio',
    'Gerente de Desarrollo de Software',
    `Quincena ${i}`,
    [
      'Desarrollo de módulos de facturación electrónica DIAN bajo estándar UBL 2.1.',
      'Automatización de pruebas unitarias y de integración.'
    ],
    'aprobado'
  );
}

itemsCamila['carnet'] = buildSoporte(
  'carnet', 'Camila Andrea Torres', 'aprobado'
);
itemsCamila['cedula'] = buildSoporte(
  'cedula', 'Camila Andrea Torres', 'aprobado'
);
itemsCamila['ape'] = buildSoporte(
  'ape', 'Camila Andrea Torres', 'aprobado'
);
itemsCamila['tyt'] = buildSoporte(
  'tyt', 'Camila Andrea Torres', 'aprobado'
);

export const INITIAL_APRENDICES: Aprendiz[] = [
  {
    id: 'apr-1',
    nombre: 'Carlos Mario Restrepo Álvarez',
    documento: '1020485912',
    email: 'cmrestrepo@misena.edu.co',
    telefono: '314 780 2314',
    fichaId: 'ficha-1',
    fichaNumero: '2847431',
    programa: 'Análisis y Desarrollo de Software (ADSO)',
    etapa: 'Práctica',
    items: itemsCarlos,
    empresa: {
      razonSocial: 'Bancolombia S.A.',
      nit: '890.903.938-8',
      direccion: 'Carrera 48 # 26 - 85, Torre Norte',
      ciudad: 'Medellín, Antioquia',
      tutorNombre: 'Ing. Esteban Restrepo V.',
      tutorCargo: 'Líder Técnico de Arquitectura Cloud',
      tutorTelefono: '312 456 7890',
      tutorEmail: 'erestrepo@bancolombia.com.co',
      fechaInicio: '2025-04-15',
      fechaFin: '2025-10-15',
      modalidad: 'Contrato de Aprendizaje',
      lat: 6.2295,
      lng: -75.5762
    },
    pazYSalvoGenerado: true,
    fechaPazYSalvo: '2025-10-18'
  },
  {
    id: 'apr-2',
    nombre: 'Laura Sofía Gómez Cárdenas',
    documento: '1033782941',
    email: 'lsgomez@misena.edu.co',
    telefono: '300 234 5678',
    fichaId: 'ficha-1',
    fichaNumero: '2847431',
    programa: 'Análisis y Desarrollo de Software (ADSO)',
    etapa: 'Práctica',
    items: itemsLaura,
    empresa: {
      razonSocial: 'MercadoLibre Colombia Ltda.',
      nit: '900.245.890-1',
      direccion: 'Carrera 17 # 93 - 09, Piso 8',
      ciudad: 'Bogotá D.C.',
      tutorNombre: 'Ing. Roberto Silva P.',
      tutorCargo: 'Tech Lead Full Stack',
      tutorTelefono: '311 987 6543',
      tutorEmail: 'roberto.silva@mercadolibre.com.co',
      fechaInicio: '2025-04-15',
      fechaFin: '2025-10-15',
      modalidad: 'Contrato de Aprendizaje',
      lat: 4.6784,
      lng: -74.0538
    }
  },
  {
    id: 'apr-3',
    nombre: 'Juan David Martínez Zuluaga',
    documento: '1017849301',
    email: 'jdmartinez@misena.edu.co',
    telefono: '318 654 3210',
    fichaId: 'ficha-1',
    fichaNumero: '2847431',
    programa: 'Análisis y Desarrollo de Software (ADSO)',
    etapa: 'Lectiva',
    items: itemsJuan,
    empresa: {
      razonSocial: 'Ecopetrol S.A.',
      nit: '860.002.403-5',
      direccion: 'Carrera 13 # 36 - 24',
      ciudad: 'Bogotá D.C.',
      tutorNombre: 'Dra. Patricia Cárdenas',
      tutorCargo: 'Gerente TI & Analítica',
      tutorTelefono: '316 543 2109',
      tutorEmail: 'patricia.cardenas@ecopetrol.com.co',
      fechaInicio: '2025-11-01',
      fechaFin: '2026-05-01',
      modalidad: 'Contrato de Aprendizaje',
      lat: 4.6248,
      lng: -74.0682
    }
  },
  {
    id: 'apr-4',
    nombre: 'Valentina Morales Henao',
    documento: '1028741093',
    email: 'vmorales@misena.edu.co',
    telefono: '312 901 2345',
    fichaId: 'ficha-1',
    fichaNumero: '2847431',
    programa: 'Análisis y Desarrollo de Software (ADSO)',
    etapa: 'Práctica',
    items: itemsValentina,
    empresa: {
      razonSocial: 'Globant Colombia S.A.S.',
      nit: '900.567.890-3',
      direccion: 'Calle 93B # 13 - 45, Edificio WeWork',
      ciudad: 'Bogotá D.C.',
      tutorNombre: 'Ing. Camilo Rojas',
      tutorCargo: 'Staff Software Engineer',
      tutorTelefono: '317 890 1234',
      tutorEmail: 'camilo.rojas@globant.com',
      fechaInicio: '2025-05-01',
      fechaFin: '2025-11-01',
      modalidad: 'Contrato de Aprendizaje',
      lat: 4.6792,
      lng: -74.0495
    }
  },
  {
    id: 'apr-5',
    nombre: 'Andrés Felipe Castro Muñoz',
    documento: '1090483920',
    email: 'afcastro@misena.edu.co',
    telefono: '310 123 4567',
    fichaId: 'ficha-1',
    fichaNumero: '2847431',
    programa: 'Análisis y Desarrollo de Software (ADSO)',
    etapa: 'Práctica',
    items: itemsAndres,
    empresa: {
      razonSocial: 'Grupo SURA S.A.',
      nit: '890.904.996-1',
      direccion: 'Carrera 43A # 5A - 113, Edificio One Plaza',
      ciudad: 'Medellín, Antioquia',
      tutorNombre: 'Dra. Marcela Echeverri',
      tutorCargo: 'Directora de Transformación Digital',
      tutorTelefono: '313 456 7891',
      tutorEmail: 'mecheverri@gruposura.com.co',
      fechaInicio: '2025-04-15',
      fechaFin: '2025-10-15',
      modalidad: 'Contrato de Aprendizaje',
      lat: 6.2085,
      lng: -75.5684
    }
  },
  {
    id: 'apr-6',
    nombre: 'Camila Andrea Torres Bedoya',
    documento: '1014983021',
    email: 'catorres@misena.edu.co',
    telefono: '315 678 9012',
    fichaId: 'ficha-2',
    fichaNumero: '2712950',
    programa: 'Gestión de Redes de Datos',
    etapa: 'Práctica',
    items: itemsCamila,
    empresa: {
      razonSocial: 'Carvajal Tecnología y Servicios S.A.S.',
      nit: '890.300.279-0',
      direccion: 'Calle 29 Norte # 6A - 40',
      ciudad: 'Cali, Valle del Cauca',
      tutorNombre: 'Ing. Mauricio Osorio',
      tutorCargo: 'Gerente de Desarrollo e Infraestructura',
      tutorTelefono: '314 321 0987',
      tutorEmail: 'mauricio.osorio@carvajal.com',
      fechaInicio: '2025-02-02',
      fechaFin: '2025-08-02',
      modalidad: 'Contrato de Aprendizaje',
      lat: 3.4716,
      lng: -76.5182
    },
    pazYSalvoGenerado: true,
    fechaPazYSalvo: '2025-08-05'
  }
];

export function countApprovedItems(
  items: Record<string, BitacoraItem>
): number {
  return ITEM_KEYS.reduce((acc, key) => {
    return items[key]?.estado === 'aprobado' ? acc + 1 : acc;
  }, 0);
}
