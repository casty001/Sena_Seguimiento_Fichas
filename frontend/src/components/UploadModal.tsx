import React, { useState, useRef } from 'react';
import { BitacoraItem, ExcelSheetData } from '../types';
import { ITEM_LABELS } from '../data/seedData';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Table,
  Check,
  FileType
} from 'lucide-react';

declare const XLSX: any;

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BitacoraItem | null;
  onSaveUpload: (
    itemId: string,
    data: {
      nombreArchivo: string;
      tamano?: string;
      formato?: 'excel' | 'pdf' | 'imagen';
      periodo: string;
      horas: number;
      actividades: string[];
      excelDetalles?: ExcelSheetData;
      dataUrl?: string;
    }
  ) => void;
  aprendizEmpresa?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  item,
  onSaveUpload,
  aprendizEmpresa = 'Empresa Co-formadora',
}) => {
  if (!isOpen || !item) return null;

  const isBitacora = item.tipo === 'bitacora';
  const meta = ITEM_LABELS[item.id] || {
    label: item.label,
    fullTitle: item.label,
    tipo: item.tipo,
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // NO default document! Must be explicitly selected by the user.
  const [selectedFile, setSelectedFile] = useState<{
    nombre: string;
    tamano: string;
    formato: 'excel' | 'pdf' | 'imagen';
    hojaNombre?: string;
  } | null>(null);

  const [parsedExcel, setParsedExcel] = useState<ExcelSheetData | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | undefined>(undefined);

  const [quincenaNum] = useState<number>(item.numero || 1);
  const [periodo, setPeriodo] = useState<string>(
    `Quincena ${item.numero || 1} - Período Productivo`
  );
  const [horas, setHoras] = useState<number>(80);
  const [actividades, setActividades] = useState<string>('');
  const [errorValidation, setErrorValidation] = useState<string>('');

  // Handle real file selection & parse with SheetJS
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const isExcel = ext === 'xlsx' || ext === 'xls' || ext === 'csv';
    const isPdf = ext === 'pdf';
    const isImage = ext === 'png' || ext === 'jpg' || ext === 'jpeg';

    if (isBitacora && !isExcel && !isPdf) {
      setErrorValidation('Las bitácoras deben subirse en formato Excel (.xlsx / .xls) o PDF.');
    } else {
      setErrorValidation('');
    }

    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb || 1} KB`;
    const detectedFormat: 'excel' | 'pdf' | 'imagen' = isExcel ? 'excel' : isImage ? 'imagen' : 'pdf';

    setSelectedFile({
      nombre: file.name,
      tamano: sizeStr,
      formato: detectedFormat,
      hojaNombre: isExcel ? 'Hoja 1' : undefined,
    });

    // Also read data URL for support documents / image previews
    const dataUrlReader = new FileReader();
    dataUrlReader.onload = () => {
      setFileDataUrl(dataUrlReader.result as string);
    };
    dataUrlReader.readAsDataURL(file);

    // Parse Excel with SheetJS
    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          if (typeof XLSX !== 'undefined') {
            const data = new Uint8Array(evt.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetNames = workbook.SheetNames || ['Hoja 1'];
            const firstSheetName = sheetNames[0] || 'Hoja 1';

            // Extract all sheets into a dictionary
            const hojasMap: Record<string, Array<Array<string | number>>> = {};
            sheetNames.forEach((sName: string) => {
              const ws = workbook.Sheets[sName];
              const raw: Array<Array<any>> = XLSX.utils.sheet_to_json(ws, { header: 1 });
              const cleaned: Array<Array<string | number>> = (raw || [])
                .filter((r) => r && r.length > 0 && r.some((c) => c !== null && c !== ''))
                .map((r) => r.map((c) => (c !== null && c !== undefined ? String(c) : '')));
              hojasMap[sName] = cleaned;
            });

            const currentRows = hojasMap[firstSheetName] || [];
            const maxCols = Math.max(...currentRows.map((r) => r.length), 4);

            const excelData: ExcelSheetData = {
              nombreHoja: firstSheetName,
              hojasDisponibles: sheetNames,
              hojasMap,
              totalFilas: currentRows.length,
              totalColumnas: maxCols,
              filas: currentRows,
              semanaReportada: periodo,
              horasReportadas: horas,
            };

            setParsedExcel(excelData);

            // Extract activities descriptions from the uploaded spreadsheet
            const extracted: string[] = [];
            currentRows.forEach((row) => {
              row.forEach((cell) => {
                const str = String(cell || '').trim();
                if (
                  str.length > 12 &&
                  !str.toLowerCase().includes('sena') &&
                  !str.toLowerCase().includes('nit') &&
                  !str.toLowerCase().includes('código') &&
                  !str.toLowerCase().includes('página') &&
                  !str.toLowerCase().includes('versión') &&
                  !str.toLowerCase().includes('formato') &&
                  !extracted.includes(str)
                ) {
                  extracted.push(str);
                }
              });
            });

            if (extracted.length > 0) {
              setActividades(extracted.slice(0, 6).join('\n'));
            } else {
              setActividades(
                `Reporte extraído exitosamente de "${file.name}" con ${currentRows.length} filas leídas.`
              );
            }
          } else {
            // SheetJS fallback
            setActividades(`Reporte quincenal adjunto: ${file.name}`);
          }
        } catch (err) {
          console.warn('Could not parse Excel binary, using metadata', err);
          setActividades(`Archivo cargado: ${file.name} (${sizeStr})`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setActividades(`Soporte de certificación adjuntado: ${file.name} (${sizeStr})`);
    }
  };

  // Helper: Use official SENA Excel Template with realistic rows
  const handleUseOfficialTemplate = () => {
    setErrorValidation('');
    const bitacoraNum = String(quincenaNum).padStart(2, '0');
    const templateFileName = `GFPI-F-023_Bitacora_${bitacoraNum}_ADSO_2847431.xlsx`;

    const sampleRows: Array<Array<string | number>> = [
      ['SERVICIO NACIONAL DE APRENDIZAJE SENA', '', '', 'FORMATO GFPI-F-023'],
      ['BITÁCORA QUINCENAL DE SEGUIMIENTO A ETAPA PRODUCTIVA', '', '', 'VERSIÓN: 04'],
      ['Ficha:', '2847431', 'Programa:', 'Análisis y Desarrollo de Software (ADSO)'],
      ['Empresa Co-formadora:', aprendizEmpresa, 'Período:', `Quincena ${quincenaNum}`],
      ['No.', 'DESCRIPCIÓN DE LA ACTIVIDAD', 'EVIDENCIA DE APRENDIZAJE', 'HORAS'],
      [
        '1',
        'Desarrollo de módulos de backend y endpoints REST para el módulo de facturación electrónica',
        'Código fuente en Git y pull requests aprobados',
        '25',
      ],
      [
        '2',
        'Diseño e implementación de interfaz de usuario reactiva en frontend con Tailwind CSS',
        'Componentes UI interactivos y pruebas funcionales',
        '25',
      ],
      [
        '3',
        'Ejecución de pruebas de integración, corrección de bugs y pipeline de despliegue continuo',
        'Reporte de testing unitario y pase a QA',
        '30',
      ],
      ['TOTAL HORAS:', '', '', '80 Horas'],
    ];

    setSelectedFile({
      nombre: templateFileName,
      tamano: '218 KB',
      formato: 'excel',
      hojaNombre: 'Bitácora Quincenal F-023',
    });

    setParsedExcel({
      nombreHoja: 'Bitácora Quincenal F-023',
      hojasDisponibles: ['Bitácora Quincenal F-023', 'Control de Horas'],
      hojasMap: {
        'Bitácora Quincenal F-023': sampleRows,
        'Control de Horas': [
          ['DÍA', 'FECHA', 'ACTIVIDAD PRINCIPAL', 'HORAS'],
          ['Día 1', '2025-05-02', 'Configuración de entorno Docker y bases de datos', '8'],
          ['Día 2', '2025-05-03', 'Endpoints CRUD en Express/Node.js', '8'],
          ['Día 3', '2025-05-04', 'Validaciones de esquema y autenticación JWT', '8'],
        ],
      },
      totalFilas: sampleRows.length,
      totalColumnas: 4,
      filas: sampleRows,
      semanaReportada: periodo,
      horasReportadas: 80,
    });

    setActividades(
      '1. Desarrollo de módulos de backend y endpoints REST para el módulo de facturación electrónica (25h)\n2. Diseño e implementación de interfaz de usuario reactiva en frontend con Tailwind CSS (25h)\n3. Ejecución de pruebas de integración, corrección de bugs y pipeline de despliegue continuo (30h)'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setErrorValidation(
        'Debes seleccionar un archivo Excel (.xlsx / .xls) de tu equipo antes de radicar.'
      );
      return;
    }

    const actList = actividades
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // If no parsedExcel rows, build rows from activities
    let finalExcelData = parsedExcel;
    if (!finalExcelData && selectedFile.formato === 'excel') {
      const generatedRows: Array<Array<string | number>> = [
        ['SERVICIO NACIONAL DE APRENDIZAJE SENA', 'FORMATO GFPI-F-023'],
        ['BITÁCORA QUINCENAL DE SEGUIMIENTO', selectedFile.nombre],
        ['Período:', periodo, 'Horas:', `${horas} Horas`],
        ['No.', 'DESCRIPCIÓN DE LA ACTIVIDAD', 'ESTADO', 'HORAS'],
        ...actList.map((act, i) => [
          i + 1,
          act,
          'Completado',
          Math.round(horas / (actList.length || 1)),
        ]),
        ['TOTAL HORAS:', '', '', `${horas} Horas`],
      ];
      finalExcelData = {
        nombreHoja: 'Bitácora Quincenal F-023',
        hojasDisponibles: ['Bitácora Quincenal F-023'],
        hojasMap: { 'Bitácora Quincenal F-023': generatedRows },
        totalFilas: generatedRows.length,
        totalColumnas: 4,
        filas: generatedRows,
        semanaReportada: periodo,
        horasReportadas: horas,
      };
    }

    if (!fileDataUrl) {
      setErrorValidation('Debes seleccionar un archivo real antes de enviarlo. La plantilla de demostración no es un documento adjunto.');
      return;
    }

    onSaveUpload(item.id, {
      nombreArchivo: selectedFile.nombre,
      tamano: selectedFile.tamano,
      formato: selectedFile.formato,
      periodo,
      horas,
      actividades:
        actList.length > 0
          ? actList
          : [`Actividades formativas reportadas en ${selectedFile.nombre}`],
      excelDetalles: finalExcelData || undefined,
      dataUrl: fileDataUrl,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="bg-[#00324D] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#107c41] flex items-center justify-center text-white shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {isBitacora
                  ? `Subir Reporte de Bitácora (${item.id})`
                  : `Cargue de Documento: ${meta.label}`}
              </h3>
              <p className="text-[11px] text-slate-300">
                {isBitacora
                  ? 'Formato Institucional de Bitácora Quincenal en Hoja de Cálculo Excel (GFPI-F-023)'
                  : meta.fullTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          {/* Validation Alert */}
          {errorValidation && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorValidation}</span>
            </div>
          )}

          {/* Hidden Real File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={isBitacora ? '.xlsx,.xls,.csv,.pdf' : '.pdf,.png,.jpg,.jpeg'}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Interactive File Dropzone: No file selected by default */}
          <div>
            <label className="block text-slate-800 font-bold mb-1.5 flex items-center justify-between">
              <span>{isBitacora ? 'Archivo Excel de la Bitácora:' : 'Archivo del Soporte Oficial:'}</span>
              <span className="text-[10px] text-slate-400">Selecciona el archivo desde tu equipo</span>
            </label>

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#107c41] rounded-xl p-6 text-center bg-slate-50 hover:bg-emerald-50/30 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#107c41] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-800 text-sm">
                  Ningún archivo seleccionado todavía
                </div>
                <p className="text-slate-500 text-[11px] mt-1">
                  Haz clic para examinar y cargar tu archivo Excel (.xlsx / .xls)
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-3.5 py-1.5 bg-[#107c41] hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Examinar Archivo Excel (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseOfficialTemplate();
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Cargar Plantilla F-023.xlsx</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-emerald-300 bg-emerald-50/50 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#107c41] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                      <span className="truncate max-w-[200px] sm:max-w-xs">{selectedFile.nombre}</span>
                      <span className="text-[10px] font-bold bg-[#107c41] text-white px-1.5 py-0.2 rounded font-mono uppercase">
                        {selectedFile.formato.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>Tamaño: {selectedFile.tamano}</span>
                      {parsedExcel && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-700 font-semibold">
                            {parsedExcel.totalFilas} filas leídas ({parsedExcel.nombreHoja})
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md shadow-2xs cursor-pointer"
                  >
                    Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setParsedExcel(null);
                      setActividades('');
                      setFileDataUrl(undefined);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                    title="Quitar archivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bitácora / Quincena Meta fields */}
          {isBitacora && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Período Quincenal de la Bitácora:
                </label>
                <input
                  type="text"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  placeholder="Ej: Quincena 1 - 01 al 15 Mayo"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-[#39A900]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Horas Reportadas en Excel:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={horas}
                    onChange={(e) => setHoras(Number(e.target.value))}
                    min={1}
                    max={120}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:ring-1 focus:ring-[#39A900]"
                    required
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-mono font-normal">
                    Horas
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Activities Summary */}
          <div>
            <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
              <span>
                {isBitacora
                  ? 'Actividades Extraídas de la Hoja de Cálculo:'
                  : 'Descripción / Observaciones del Soporte:'}
              </span>
              <span className="text-[10px] text-slate-400">
                {selectedFile ? 'Contenido del archivo seleccionado' : 'Sin contenido por defecto'}
              </span>
            </label>
            <textarea
              rows={3}
              value={actividades}
              onChange={(e) => setActividades(e.target.value)}
              placeholder="Las actividades se extraerán automáticamente de las celdas de tu archivo Excel, o puedes escribirlas aquí..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-1 focus:ring-[#39A900]"
              required
            />
          </div>

          {/* Institutional Compliance Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#107c41] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Radicación de Hoja de Cálculo SENA: </span>
              <span>
                El archivo y contenido que selecciones se registrarán exactamente como los cargues, y se mostrarán tal cual en el visor web embebido para la auditoría de tu instructor.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={!selectedFile}
              className={`px-5 py-2 font-bold rounded-lg text-xs shadow-xs transition-all flex items-center gap-1.5 ${
                selectedFile
                  ? 'bg-[#39A900] hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Radicar Reporte al Instructor</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
