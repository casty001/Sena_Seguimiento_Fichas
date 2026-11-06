import React, { useState } from 'react';
import { Aprendiz, BitacoraItem, ExcelSheetData } from '../types';
import { ITEM_LABELS } from '../data/seedData';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Printer,
  Check,
  ShieldAlert,
  Table,
  Calendar,
  Clock,
  Building2,
  FileCheck,
  Layers,
  Eye,
  FileCheck2,
  Hash
} from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BitacoraItem | null;
  aprendiz: Aprendiz;
  isInstructorView: boolean;
  onApprove: (itemId: string) => void;
  onReject: (itemId: string, observaciones: string) => void;
}

// Convert 0 -> A, 1 -> B, 25 -> Z, 26 -> AA
const getColumnLetter = (colIndex: number): string => {
  let temp = colIndex;
  let letter = '';
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
};

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  item,
  aprendiz,
  isInstructorView,
  onApprove,
  onReject,
}) => {
  if (!isOpen || !item) return null;

  const [feedback, setFeedback] = useState<string>(
    item.archivo?.observacionesInstructor || ''
  );
  const [showRejectForm, setShowRejectForm] = useState(false);

  // View modes: 'spreadsheet' (real Excel grid) or 'formato' (SENA F-023 layout)
  const isBitacora = item.tipo === 'bitacora';
  const isExcelFile =
    isBitacora ||
    item.archivo?.formato === 'excel' ||
    (item.archivo?.nombre ? item.archivo.nombre.endsWith('.xlsx') || item.archivo.nombre.endsWith('.xls') || item.archivo.nombre.endsWith('.csv') : false);

  const [viewMode, setViewMode] = useState<'spreadsheet' | 'formato'>(
    isExcelFile ? 'spreadsheet' : 'formato'
  );

  // Multi-sheet workbook support
  const excelData: ExcelSheetData | undefined = item.archivo?.excelDetalles;
  const availableSheets: string[] =
    excelData?.hojasDisponibles && excelData.hojasDisponibles.length > 0
      ? excelData.hojasDisponibles
      : [excelData?.nombreHoja || 'Bitácora Quincenal F-023'];

  const [selectedSheet, setSelectedSheet] = useState<string>(
    availableSheets[0] || 'Hoja 1'
  );

  // Selected cell for interactive formula bar
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
    coord: string;
    value: string;
  }>({
    row: 1,
    col: 1,
    coord: 'B2',
    value: '',
  });

  const meta = ITEM_LABELS[item.id] || {
    label: item.label,
    fullTitle: item.label,
    tipo: item.tipo,
  };
  const empresa = aprendiz.empresa;

  // Determine rows to render for the spreadsheet grid
  let activeRows: Array<Array<string | number>> = [];
  if (excelData?.hojasMap && excelData.hojasMap[selectedSheet]) {
    activeRows = excelData.hojasMap[selectedSheet];
  } else if (excelData?.filas && excelData.filas.length > 0) {
    activeRows = excelData.filas;
  } else if (item.archivo?.actividades && item.archivo.actividades.length > 0) {
    // Generate spreadsheet rows from activities if filas array was not provided
    activeRows = [
      ['SERVICIO NACIONAL DE APRENDIZAJE SENA', '', '', 'FORMATO GFPI-F-023'],
      ['BITÁCORA QUINCENAL DE ETAPA PRODUCTIVA', '', '', `VERSIÓN 04 - ${item.id}`],
      ['Aprendiz:', aprendiz.nombre, 'Documento:', `C.C. ${aprendiz.documento}`],
      ['Ficha:', aprendiz.fichaNumero, 'Programa:', aprendiz.programa],
      ['Empresa:', empresa?.razonSocial || 'Empresa Co-formadora', 'Período:', item.archivo?.periodoQuincenal || `Quincena ${item.numero || 1}`],
      ['No.', 'DESCRIPCIÓN DE ACTIVIDAD REALIZADA', 'EVIDENCIA DE APRENDIZAJE', 'HORAS'],
      ...item.archivo.actividades.map((act, idx) => [
        idx + 1,
        act,
        'Registro y evidencias técnicas validadas',
        Math.round((item.archivo?.horasPeriodo || 80) / item.archivo!.actividades!.length),
      ]),
      ['TOTAL HORAS:', '', '', `${item.archivo?.horasPeriodo || 80} Horas`],
    ];
  } else {
    activeRows = [
      ['SERVICIO NACIONAL DE APRENDIZAJE SENA', 'GFPI-F-023'],
      ['Aprendiz:', aprendiz.nombre],
      ['Archivo subido:', item.archivo?.nombre || 'Reporte.xlsx'],
      ['Estado:', item.estado.toUpperCase()],
    ];
  }

  // Calculate max columns to render grid properly
  const maxCols = Math.max(
    ...activeRows.map((r) => (Array.isArray(r) ? r.length : 0)),
    4
  );

  const handleApprove = () => {
    onApprove(item.id);
    onClose();
  };

  const handleReject = () => {
    if (!feedback.trim()) {
      alert(
        'Por favor ingrese el motivo o las observaciones del rechazo para que el aprendiz pueda corregir.'
      );
      return;
    }
    onReject(item.id, feedback);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Top Header: File metadata and close */}
        <div className="bg-[#00324D] text-white px-5 py-3 flex items-center justify-between shrink-0 border-b border-slate-700">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0 ${
                isExcelFile ? 'bg-[#107c41]' : 'bg-[#39A900]'
              }`}
            >
              {isExcelFile ? <FileSpreadsheet className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-white">
                  {isExcelFile ? 'Visor de Hoja de Cálculo Excel' : 'Visor de Soporte Oficial'}
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-xs text-emerald-300 font-mono font-bold truncate max-w-xs sm:max-w-md bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  {item.archivo?.nombre || `${item.id}_Reporte.xlsx`}
                </span>
                {item.archivo?.tamano && (
                  <span className="text-[10px] text-slate-300 font-mono">
                    ({item.archivo.tamano})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                Mostrando el archivo cargado por el aprendiz · Radicado: {item.archivo?.fechaCarga || 'Hoy'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            {item.archivo?.dataUrl && (
              <a href={item.archivo.dataUrl} download={item.archivo.nombre}
                 className="text-xs px-2 py-1 rounded bg-[#39A900] text-white hover:bg-green-700">
                Descargar archivo
              </a>
            )}
            <button
              onClick={() => window.print()}
              title="Imprimir documento"
              className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Cerrar visor"
              className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher Subheader (Spreadsheet vs Formato Oficial) */}
        {isExcelFile && (
          <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-300 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('spreadsheet')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  viewMode === 'spreadsheet'
                    ? 'bg-[#107c41] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Hoja de Cálculo Real (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('formato')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  viewMode === 'formato'
                    ? 'bg-[#00324D] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Formato Oficial F-023</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                {activeRows.length} filas renderizadas · {maxCols} columnas
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                {item.archivo?.horasPeriodo || 80}h reportadas
              </span>
            </div>
          </div>
        )}

        {/* Excel Formula Bar (Only in spreadsheet view) */}
        {isExcelFile && viewMode === 'spreadsheet' && (
          <div className="bg-slate-50 border-b border-slate-300 px-4 py-1.5 flex items-center gap-2 text-xs font-mono shrink-0">
            <div className="w-14 bg-white border border-slate-300 rounded px-2 py-0.5 text-center font-bold text-slate-700 shadow-2xs">
              {selectedCell.coord}
            </div>
            <span className="font-bold text-slate-400 italic px-1 select-none">fx</span>
            <div className="flex-1 bg-white border border-slate-300 rounded px-3 py-0.5 text-slate-800 text-[11px] truncate shadow-2xs">
              {selectedCell.value || (activeRows[0] ? String(activeRows[0][0] || '') : '')}
            </div>
          </div>
        )}

        {/* Status notification banner if rejected */}
        {item.estado === 'rechazado' && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-start gap-2.5 text-rose-900 text-xs shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] text-rose-700 block">
                Observación del Instructor para Corrección:
              </span>
              <span>
                {item.archivo?.observacionesInstructor ||
                  'Se requiere corregir las firmas o completar las evidencias técnicas.'}
              </span>
            </div>
          </div>
        )}

        {item.estado === 'aprobado' && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex items-center gap-2 text-emerald-900 text-xs shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              Reporte de Bitácora Aprobado y Validado Institucionalmente
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-700">
              Contabilizado para la regla de certificación de 16 ítems.
            </span>
          </div>
        )}

        {/* Document Content Viewport */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-200/70 flex justify-center">
          
          {/* MODE 1: REAL SPREADSHEET GRID VIEW */}
          {isExcelFile && viewMode === 'spreadsheet' ? (
            <div className="w-full bg-white shadow-md border border-slate-300 rounded-sm overflow-x-auto flex flex-col justify-between">
              
              <div className="min-w-[650px] overflow-x-auto">
                <table className="w-full border-collapse text-xs select-none">
                  {/* Table Column Letters Header (A, B, C, D...) */}
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-600 font-mono text-[11px] font-bold">
                      <th className="w-12 py-1.5 px-2 bg-slate-200/90 text-slate-500 border-r border-slate-300 text-center select-none">
                        #
                      </th>
                      {Array.from({ length: maxCols }, (_, c) => (
                        <th
                          key={c}
                          className="py-1.5 px-3 border-r border-slate-300 text-center font-bold tracking-wider hover:bg-slate-200 transition-colors"
                        >
                          {getColumnLetter(c)}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Table Rows with Row Numbers (1, 2, 3...) and Cells */}
                  <tbody className="divide-y divide-slate-200 font-sans">
                    {activeRows.map((row, rowIdx) => {
                      const isHeaderRow = rowIdx === 0 || rowIdx === 5;
                      return (
                        <tr
                          key={rowIdx}
                          className={`hover:bg-sky-50/50 transition-colors ${
                            isHeaderRow ? 'bg-slate-50/80 font-semibold' : ''
                          }`}
                        >
                          {/* Row Number */}
                          <td className="w-12 py-1.5 px-2 bg-slate-100 text-slate-500 font-mono text-[10px] text-center border-r border-slate-300 select-none font-bold">
                            {rowIdx + 1}
                          </td>

                          {/* Row Cells */}
                          {Array.from({ length: maxCols }, (_, colIdx) => {
                            const cellVal = row && row[colIdx] !== undefined ? String(row[colIdx]) : '';
                            const coord = `${getColumnLetter(colIdx)}${rowIdx + 1}`;
                            const isSelected = selectedCell.coord === coord;

                            return (
                              <td
                                key={colIdx}
                                onClick={() =>
                                  setSelectedCell({
                                    row: rowIdx + 1,
                                    col: colIdx + 1,
                                    coord,
                                    value: cellVal,
                                  })
                                }
                                className={`py-1.5 px-2.5 border-r border-slate-200 text-slate-800 text-[11px] truncate max-w-[260px] cursor-cell transition-all ${
                                  isSelected
                                    ? 'bg-sky-100/70 ring-2 ring-[#107c41] ring-inset font-medium'
                                    : ''
                                } ${isHeaderRow ? 'text-slate-900 font-bold' : ''}`}
                                title={cellVal || undefined}
                              >
                                {cellVal || <span className="text-transparent">.</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Sheet Tab Bar (Excel style) */}
              <div className="bg-slate-100 border-t border-slate-300 px-4 py-2 flex items-center justify-between text-xs font-sans shrink-0">
                <div className="flex items-center gap-1 overflow-x-auto">
                  {availableSheets.map((sheet, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => {
                        setSelectedSheet(sheet);
                        setSelectedCell({
                          row: 1,
                          col: 1,
                          coord: 'A1',
                          value: '',
                        });
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 font-semibold rounded-t border-t border-x transition-colors cursor-pointer text-xs ${
                        selectedSheet === sheet
                          ? 'bg-white text-slate-900 border-slate-300 shadow-2xs font-bold text-[#107c41]'
                          : 'text-slate-600 hover:bg-slate-200 border-transparent'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#107c41]" />
                      <span>{sheet}</span>
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
                  Libro de Excel SENA F-023 · Válido para Etapa Productiva
                </div>
              </div>

            </div>
          ) : (
            /* MODE 2: SENA OFFICIAL F-023 FORM PRINTABLE VIEW (OR CERTIFICATE VIEW) */
            <div className="w-full max-w-3xl bg-white shadow-md border border-slate-300 rounded-sm overflow-hidden text-slate-800 text-xs font-sans">
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Header Formato F-023 */}
                <div className="border border-slate-400 grid grid-cols-12 divide-x divide-slate-400">
                  <div className="col-span-3 p-3 flex flex-col items-center justify-center text-center bg-slate-50">
                    <div className="w-10 h-10 rounded-full bg-[#39A900] text-white font-black flex items-center justify-center text-lg mb-1">
                      S
                    </div>
                    <span className="font-black tracking-wider text-[11px] text-slate-900">SENA</span>
                    <span className="text-[9px] text-slate-500 font-semibold leading-tight">
                      Dirección de Formación Profesional
                    </span>
                  </div>
                  <div className="col-span-6 p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                      Sistema Integrado de Gestión
                    </span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5">
                      {isBitacora
                        ? 'FORMATO DE SEGUIMIENTO Y EVALUACIÓN ETAPA PRODUCTIVA'
                        : 'SOPORTE REGISTRAL PARA CERTIFICACIÓN'}
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium">
                      {meta.fullTitle}
                    </span>
                  </div>
                  <div className="col-span-3 p-2 text-[10px] space-y-1 bg-slate-50 divide-y divide-slate-300 font-mono">
                    <div className="pb-1">
                      <span className="text-slate-500">CÓDIGO:</span>{' '}
                      <span className="font-bold">{isBitacora ? 'GFPI-F-023' : 'SENA-CERT-01'}</span>
                    </div>
                    <div className="py-1">
                      <span className="text-slate-500">VERSIÓN:</span> <span className="font-bold">04</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-slate-500">FECHA:</span>{' '}
                      <span className="font-bold">
                        {item.archivo?.fechaCarga || new Date().toISOString().split('T')[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 1: Datos Generales */}
                <div>
                  <div className="bg-[#00324D] text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-2">
                    1. INFORMACIÓN GENERAL DEL APRENDIZ Y PROGRAMA
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 border border-slate-200 rounded-sm">
                    <div>
                      <span className="text-slate-500 block text-[10px]">NOMBRE DEL APRENDIZ:</span>
                      <span className="font-bold text-slate-900">{aprendiz.nombre}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">DOCUMENTO DE IDENTIDAD:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        C.C. {aprendiz.documento}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">FICHA DE CARACTERIZACIÓN:</span>
                      <span className="font-bold text-emerald-800 font-mono">{aprendiz.fichaNumero}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block text-[10px]">PROGRAMA DE FORMACIÓN:</span>
                      <span className="font-bold text-slate-900">{aprendiz.programa}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">CORREO INSTITUCIONAL:</span>
                      <span className="font-mono text-slate-800">{aprendiz.email}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Datos de la Empresa Co-formadora */}
                {empresa && (
                  <div>
                    <div className="bg-[#00324D] text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-2">
                      2. DATOS DE LA EMPRESA CO-FORMADORA
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 border border-slate-200 rounded-sm">
                      <div>
                        <span className="text-slate-500 block text-[10px]">RAZÓN SOCIAL:</span>
                        <span className="font-bold text-slate-900">{empresa.razonSocial}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">NIT:</span>
                        <span className="font-mono text-slate-900">{empresa.nit}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">CIUDAD:</span>
                        <span className="text-slate-900">{empresa.ciudad}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">DIRECCIÓN:</span>
                        <span className="text-slate-900">{empresa.direccion}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">TUTOR / JEFE INMEDIATO:</span>
                        <span className="font-bold text-slate-900">{empresa.tutorNombre}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">MODALIDAD:</span>
                        <span className="text-emerald-800 font-medium">{empresa.modalidad}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 3: Periodo y Horas */}
                {isBitacora && (
                  <div>
                    <div className="bg-[#00324D] text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-2">
                      3. PERÍODO REPORTADO Y CONTROL HORARIO
                    </div>
                    <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 border border-slate-200 rounded-sm font-mono text-center">
                      <div className="border-r border-slate-200">
                        <span className="text-slate-500 block text-[10px] font-sans">
                          PERÍODO QUINCENAL:
                        </span>
                        <span className="font-bold text-slate-900">
                          {item.archivo?.periodoQuincenal || `Quincena ${item.numero || 1}`}
                        </span>
                      </div>
                      <div className="border-r border-slate-200">
                        <span className="text-slate-500 block text-[10px] font-sans">
                          HORAS DEL PERÍODO:
                        </span>
                        <span className="font-bold text-emerald-800 text-sm">
                          {item.archivo?.horasPeriodo || 80} Horas
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-sans">
                          HORAS ACUMULADAS:
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {item.archivo?.horasAcumuladas || (item.numero || 1) * 80} / 880 h
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 4: Actividades Ejecutadas y Subidas por el Aprendiz */}
                <div>
                  <div className="bg-[#00324D] text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>4. ACTIVIDADES REGISTRADAS EN EL ARCHIVO CARGADO</span>
                    <span className="font-mono text-[9px] text-emerald-300">
                      Archivo: {item.archivo?.nombre}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-sm">
                    <p className="text-slate-600 mb-2 font-medium">
                      Actividades extraídas directamente de la hoja de cálculo subida por el aprendiz:
                    </p>
                    <div className="space-y-2">
                      {item.archivo?.actividades && item.archivo.actividades.length > 0 ? (
                        item.archivo.actividades.map((act, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 bg-white p-2.5 rounded border border-slate-200"
                          >
                            <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                              Actividad {idx + 1}
                            </span>
                            <span className="text-slate-800 leading-snug">{act}</span>
                          </div>
                        ))
                      ) : (
                        <div className="italic text-slate-500 bg-white p-3 rounded border border-slate-200">
                          Sin actividades detalladas. Revisa la pestaña de Hoja de Cálculo Real.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 5: Firmas y Sellos Institucionales */}
                <div className="mt-8 pt-4 border-t-2 border-slate-300">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-4 tracking-wider text-center">
                    VALIDEZ Y CONFORMIDAD DE LAS PARTES
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-center">
                    {/* Firma Aprendiz */}
                    <div className="flex flex-col items-center">
                      <div className="h-16 flex items-end justify-center w-full border-b border-slate-400 pb-1">
                        <span className="font-serif italic text-base text-slate-800 select-none font-bold">
                          {aprendiz.nombre}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 mt-1">{aprendiz.nombre}</span>
                      <span className="text-slate-500 text-[10px]">C.C. {aprendiz.documento}</span>
                      <span className="text-emerald-700 text-[9px] font-semibold mt-0.5">
                        Firma Digital del Aprendiz (Radicada)
                      </span>
                    </div>

                    {/* Firma Tutor Empresarial */}
                    <div className="flex flex-col items-center">
                      <div className="h-16 flex items-end justify-center w-full border-b border-slate-400 pb-1">
                        {item.archivo?.firmadoTutor ? (
                          <div className="text-center">
                            <span className="font-serif italic text-base text-blue-900 select-none font-bold">
                              {empresa?.tutorNombre || 'Tutor Empresarial'}
                            </span>
                            <div className="text-[9px] text-blue-700 font-mono">
                              [Sello Digital Empresa Co-formadora]
                            </div>
                          </div>
                        ) : (
                          <span className="text-rose-600 font-bold text-xs uppercase bg-rose-50 px-2 py-1 rounded">
                            Firma Pendiente o No Válida
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 mt-1">
                        {empresa?.tutorNombre || 'Tutor Empresarial'}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {empresa?.tutorCargo || 'Jefe Inmediato'} · {empresa?.razonSocial}
                      </span>
                      <span
                        className={`text-[9px] font-semibold mt-0.5 ${
                          item.archivo?.firmadoTutor ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {item.archivo?.firmadoTutor
                          ? 'Aval y Aprobación Empresarial'
                          : 'Requiere firma del tutor'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer: Action Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Estado en matriz:</span>
            {item.estado === 'aprobado' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                <Check className="w-3.5 h-3.5" /> Aprobado (X)
              </span>
            )}
            {item.estado === 'rechazado' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100/80 px-2.5 py-1 rounded-md">
                <ShieldAlert className="w-3.5 h-3.5" /> Rechazado (Corregir)
              </span>
            )}
            {item.estado === 'pendiente' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5" /> Pendiente de Revisión
              </span>
            )}
            {item.estado === 'none' && (
              <span className="text-xs text-slate-400 italic">No ha sido cargado aún</span>
            )}
          </div>

          {/* Instructor Review Actions */}
          {isInstructorView && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {showRejectForm ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Escriba el motivo de rechazo y corrección requerida..."
                    className="text-xs border border-rose-300 rounded-md px-3 py-2 text-slate-800 w-full sm:w-80 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
                  />
                  <button
                    onClick={handleReject}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Confirmar Rechazo
                  </button>
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs rounded-md transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Rechazar / Corregir</span>
                  </button>

                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#39A900] hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aprobar (Marcar X Verde)</span>
                  </button>
                </>
              )}
            </div>
          )}

          {!isInstructorView && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Cerrar Visor
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
