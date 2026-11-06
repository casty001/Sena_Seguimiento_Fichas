import React, { useState } from 'react';
import { Aprendiz, BitacoraItem, EmpresaData } from '../types';
import { ITEM_KEYS, ITEM_LABELS, countApprovedItems } from '../data/seedData';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Upload,
  FileSpreadsheet,
  FileText,
  Building2,
  Calendar,
  Award,
  Check,
  Eye,
  Send,
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface AprendizViewProps {
  aprendiz: Aprendiz;
  onOpenDocumentViewer: (item: BitacoraItem) => void;
  onOpenUploadModal: (item: BitacoraItem) => void;
  onOpenPazYSalvo: () => void;
  onUpdateEmpresa: (empresaData: EmpresaData) => void;
}

export const AprendizView: React.FC<AprendizViewProps> = ({
  aprendiz,
  onOpenDocumentViewer,
  onOpenUploadModal,
  onOpenPazYSalvo,
  onUpdateEmpresa,
}) => {
  const [activeTab, setActiveTab] = useState<'bitacoras' | 'empresa'>('bitacoras');

  // Empresa Form Local State
  const initialEmpresa: EmpresaData = aprendiz.empresa || {
    razonSocial: '',
    nit: '',
    direccion: '',
    ciudad: 'Bogotá D.C.',
    tutorNombre: '',
    tutorCargo: '',
    tutorTelefono: '',
    tutorEmail: '',
    fechaInicio: '2025-04-15',
    fechaFin: '2025-10-15',
    modalidad: 'Contrato de Aprendizaje',
    lat: 4.6097,
    lng: -74.0817,
  };

  const [empresaForm, setEmpresaForm] = useState<EmpresaData>(initialEmpresa);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const approvedCount = countApprovedItems(aprendiz.items);
  const totalItems = 16;
  const isCertificable = approvedCount === totalItems;
  const percentage = Math.round((approvedCount / totalItems) * 100);

  const handleEmpresaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmpresa(empresaForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Aprendiz Overview & Personal Traffic Light */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#00324D] bg-sky-50 px-2 py-0.5 rounded">
                Portal del Aprendiz
              </span>
              <span className="text-xs text-slate-400 font-mono">Ficha {aprendiz.fichaNumero}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {aprendiz.nombre}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              C.C. {aprendiz.documento} · {aprendiz.programa} · Modalidad: {aprendiz.empresa?.modalidad || 'En formalización'}
            </p>
          </div>

          {/* Business Rule Badge & Paz y Salvo Activation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block font-medium">Estado Institucional:</span>
              {isCertificable ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 font-black text-sm rounded-lg shadow-2xs mt-1">
                  <Check className="w-4 h-4 stroke-[3]" />
                  CERTIFICAR
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 font-bold text-sm rounded-lg mt-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  LE FALTA ({approvedCount}/16)
                </div>
              )}
            </div>

            {isCertificable && (
              <button
                onClick={onOpenPazYSalvo}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#39A900] hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-md animate-bounce"
              >
                <Award className="w-4 h-4 text-amber-200" />
                <span>Paz y Salvo / Finalizar Práctica</span>
              </button>
            )}
          </div>

        </div>

        {/* Visual Progress Bar & Semáforo */}
        <div className="pt-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Semáforo de Cumplimiento Reglamentario</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{approvedCount} de {totalItems} ítems aprobados</span>
            </div>
            <span className="font-bold text-slate-900 font-mono tabular-nums">{percentage}%</span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
            <div
              className={`h-full transition-all duration-500 ${
                isCertificable
                  ? 'bg-emerald-500'
                  : percentage >= 50
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
            <span>0% (Inicio)</span>
            <span>50% (8 Ítems)</span>
            <span>100% (16/16 Requisito Certificación)</span>
          </div>
        </div>

      </div>

      {/* Tabs Switcher: Bitácoras vs Registro Empresa */}
      <div className="flex items-center bg-slate-200/80 p-1 rounded-lg border border-slate-300/70 w-fit">
        <button
          onClick={() => setActiveTab('bitacoras')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'bitacoras'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4 text-emerald-700" />
          <span>Portal de Carga (12 Bitácoras + 4 Soportes)</span>
        </button>

        <button
          onClick={() => setActiveTab('empresa')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'empresa'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-700" />
          <span>Registro de Empresa Co-formadora</span>
        </button>
      </div>

      {/* TAB 1: PORTAL DE CARGA DE BITÁCORAS Y REQUISITOS */}
      {activeTab === 'bitacoras' && (
        <div className="space-y-6">
          
          {/* SECTION A: 12 BITÁCORAS QUINCENALES */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    1. Bitácoras Quincenales de Seguimiento (B1 a B12)
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                    Formato Excel .xlsx
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formato Oficial F-023. Cada quincena reporta 80 horas de actividades en hoja de cálculo bajo aval del tutor empresarial.
                </p>
              </div>

              {/* Top CTA to Upload Report */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const nextPending = Array.from({ length: 12 }, (_, i) => i + 1)
                      .map((num) => aprendiz.items[`B${num}`] || {
                        id: `B${num}`,
                        label: `B${num}`,
                        tipo: 'bitacora' as const,
                        numero: num,
                        estado: 'none' as const,
                      })
                      .find((it) => it.estado === 'none' || it.estado === 'rechazado') || {
                        id: 'B1',
                        label: 'B1',
                        tipo: 'bitacora' as const,
                        numero: 1,
                        estado: 'none' as const,
                      };
                    onOpenUploadModal(nextPending as BitacoraItem);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#107c41] hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Subir Reporte de Bitácora (Excel)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
                const key = `B${num}`;
                const item = aprendiz.items[key] || {
                  id: key,
                  label: key,
                  tipo: 'bitacora',
                  numero: num,
                  estado: 'none',
                };
                const estado = item.estado;
                const archivo = item.archivo;

                return (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border transition-all ${
                      estado === 'aprobado'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : estado === 'rechazado'
                        ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-200'
                        : estado === 'pendiente'
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sm text-slate-900">
                            Bitácora {num}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">({key})</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {archivo?.periodoQuincenal || `Quincena ${num} · 80 Horas`}
                        </span>
                      </div>

                      {/* State badge */}
                      {estado === 'aprobado' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3 stroke-[3]" /> Aprobada (X)
                        </span>
                      )}
                      {estado === 'rechazado' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" /> Rechazada
                        </span>
                      )}
                      {estado === 'pendiente' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3" /> En Revisión
                        </span>
                      )}
                      {estado === 'none' && (
                        <span className="text-[11px] text-slate-400 italic">Sin Radicar</span>
                      )}
                    </div>

                    {/* Feedback Alert if rejected */}
                    {estado === 'rechazado' && archivo?.observacionesInstructor && (
                      <div className="bg-white p-2.5 rounded-lg border border-rose-200 text-rose-900 text-xs my-2">
                        <span className="font-bold block text-[10px] uppercase text-rose-600">
                          Observación del Instructor:
                        </span>
                        <p className="mt-0.5 text-[11px] leading-tight">
                          {archivo.observacionesInstructor}
                        </p>
                      </div>
                    )}

                    {/* File Meta */}
                    {archivo ? (
                      <div className="text-[11px] text-slate-600 mt-2 font-mono flex items-center justify-between bg-white/80 p-2 rounded border border-slate-200">
                        <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-[#107c41] shrink-0" />
                          <span className="truncate">{archivo.nombre}</span>
                        </div>
                        <span className="font-bold text-emerald-800 shrink-0">{archivo.horasPeriodo || 80}h</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic mt-2">
                        Sin archivo adjunto · Requiere cargar Excel (.xlsx)
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                      {estado !== 'none' && (
                        <button
                          onClick={() => onOpenDocumentViewer(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded text-xs border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#107c41]" />
                          <span>Previsualizar Hoja Excel</span>
                        </button>
                      )}

                      {estado === 'rechazado' ? (
                        <button
                          onClick={() => onOpenUploadModal(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Subir Corrección Excel</span>
                        </button>
                      ) : estado === 'none' ? (
                        <button
                          onClick={() => onOpenUploadModal(item)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#107c41] hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Subir Reporte (Excel)</span>
                        </button>
                      ) : null}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION B: 4 SOPORTES DE CERTIFICACIÓN */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                2. Requisitos y Soportes para Certificación (4 Ítems)
              </h3>
              <p className="text-xs text-slate-500">
                Documentos institucionales obligatorios para la expedición del Paz y Salvo y Título de Tecnólogo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['carnet', 'cedula', 'ape', 'tyt'] as const).map((key) => {
                const meta = ITEM_LABELS[key];
                const item = aprendiz.items[key] || {
                  id: key,
                  label: meta.label,
                  tipo: 'soporte',
                  estado: 'none',
                };
                const estado = item.estado;

                return (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border transition-all ${
                      estado === 'aprobado'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : estado === 'rechazado'
                        ? 'bg-rose-50/40 border-rose-300'
                        : estado === 'pendiente'
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{meta.label}</span>
                      {estado === 'aprobado' && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                          ✓ Aprobado
                        </span>
                      )}
                      {estado === 'pendiente' && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          En Revisión
                        </span>
                      )}
                      {estado === 'none' && (
                        <span className="text-[10px] text-slate-400 italic">Pendiente</span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 min-h-[32px] leading-snug">
                      {meta.fullTitle}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                      {estado !== 'none' ? (
                        <button
                          onClick={() => onOpenDocumentViewer(item)}
                          className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenUploadModal(item)}
                          className="w-full py-1.5 bg-[#00324D] hover:bg-[#39A900] text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir Soporte</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: FORMULARIO DE REGISTRO DE EMPRESA */}
      {activeTab === 'empresa' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Registro Inicial y Legalización de Empresa Co-formadora
              </h2>
              <p className="text-xs text-slate-500">
                Información requerida para el aval del contrato de aprendizaje o modalidad productiva según reglamento SENA.
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          {savedSuccess && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Información empresarial actualizada con éxito y sincronizada con el mapa de georreferenciación.</span>
            </div>
          )}

          <form onSubmit={handleEmpresaSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Razón Social de la Empresa:</label>
                <input
                  type="text"
                  value={empresaForm.razonSocial}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, razonSocial: e.target.value })}
                  placeholder="Ej: Bancolombia S.A."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#39A900]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">NIT de la Empresa:</label>
                <input
                  type="text"
                  value={empresaForm.nit}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, nit: e.target.value })}
                  placeholder="Ej: 890.903.938-8"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-[#39A900]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Dirección de la Sede / Oficina:</label>
                <input
                  type="text"
                  value={empresaForm.direccion}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, direccion: e.target.value })}
                  placeholder="Ej: Carrera 48 # 26 - 85"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#39A900]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Ciudad / Municipio:</label>
                <input
                  type="text"
                  value={empresaForm.ciudad}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, ciudad: e.target.value })}
                  placeholder="Ej: Medellín, Antioquia"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#39A900]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre Tutor / Jefe Inmediato:</label>
                <input
                  type="text"
                  value={empresaForm.tutorNombre}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, tutorNombre: e.target.value })}
                  placeholder="Ej: Ing. Esteban Restrepo"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#39A900]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Cargo del Tutor:</label>
                <input
                  type="text"
                  value={empresaForm.tutorCargo}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, tutorCargo: e.target.value })}
                  placeholder="Ej: Líder de Desarrollo"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#39A900]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Teléfono / Celular Tutor:</label>
                <input
                  type="text"
                  value={empresaForm.tutorTelefono}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, tutorTelefono: e.target.value })}
                  placeholder="Ej: 312 456 7890"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-[#39A900]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Correo Electrónico Tutor:</label>
                <input
                  type="email"
                  value={empresaForm.tutorEmail}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, tutorEmail: e.target.value })}
                  placeholder="tutor@empresa.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#39A900]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Fecha Inicio de Práctica:</label>
                <input
                  type="date"
                  value={empresaForm.fechaInicio}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, fechaInicio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#39A900]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Fecha Fin de Práctica:</label>
                <input
                  type="date"
                  value={empresaForm.fechaFin}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, fechaFin: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#39A900]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Modalidad de Etapa Productiva:</label>
              <select
                value={empresaForm.modalidad}
                onChange={(e) => setEmpresaForm({ ...empresaForm, modalidad: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#39A900]"
              >
                <option value="Contrato de Aprendizaje">Contrato de Aprendizaje (Ley 789 de 2002)</option>
                <option value="Vínculo Laboral">Vínculo Laboral o Contractual</option>
                <option value="Pasantía">Pasantía (Convenio Empresarial / Estatal)</option>
                <option value="Proyecto Productivo">Proyecto Productivo SENA</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#39A900] hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
              >
                Guardar y Legalizar Empresa
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
