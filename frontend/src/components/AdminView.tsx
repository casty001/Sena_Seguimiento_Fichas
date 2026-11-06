import React, { useState } from 'react';
import { Aprendiz, Ficha, Instructor } from '../types';
import { countApprovedItems } from '../data/seedData';
import {
  Building2,
  Users,
  GraduationCap,
  Award,
  Plus,
  Search,
  Calendar,
  Edit2,
  Trash2,
  UserPlus,
  BookOpen,
  CheckCircle2,
  X
} from 'lucide-react';

interface AdminViewProps {
  fichas: Ficha[];
  aprendices: Aprendiz[];
  instructores: Instructor[];
  onCreateFicha: (ficha: Ficha) => void;
  onUpdateFicha: (ficha: Ficha) => void;
  onDeleteFicha: (fichaId: string) => void;
  onAssignInstructor: (fichaId: string, instructorId: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  fichas,
  aprendices,
  instructores,
  onCreateFicha,
  onUpdateFicha,
  onDeleteFicha,
  onAssignInstructor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFicha, setEditingFicha] = useState<Ficha | null>(null);

  // New/Edit Ficha Form State
  const [numero, setNumero] = useState('');
  const [programa, setPrograma] = useState('Análisis y Desarrollo de Software (ADSO)');
  const [codigoPrograma, setCodigoPrograma] = useState('228106');
  const [regional, setRegional] = useState('Regional Antioquia');
  const [centro, setCentro] = useState('Centro de Teleinformática y Producción Industrial (CTPI)');
  const [fechaInicioLectiva, setFechaInicioLectiva] = useState('2025-02-01');
  const [fechaFinLectiva, setFechaFinLectiva] = useState('2026-02-01');
  const [fechaInicioPractica, setFechaInicioPractica] = useState('2026-02-02');
  const [fechaFinPractica, setFechaFinPractica] = useState('2026-08-02');
  const [instructorId, setInstructorId] = useState(instructores[0]?.id || 'inst-1');

  // Metrics
  const totalAprendices = aprendices.length;
  const enLectiva = aprendices.filter((a) => a.etapa === 'Lectiva').length;
  const enPractica = aprendices.filter((a) => a.etapa === 'Práctica').length;
  const listosCertificar = aprendices.filter((a) => countApprovedItems(a.items) === 16).length;

  const filteredFichas = fichas.filter(
    (f) =>
      f.numero.includes(searchQuery) ||
      f.programa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.instructorNombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingFicha(null);
    setNumero((Math.floor(2800000 + Math.random() * 90000)).toString());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: Ficha) => {
    setEditingFicha(f);
    setNumero(f.numero);
    setPrograma(f.programa);
    setCodigoPrograma(f.codigoPrograma);
    setRegional(f.regional);
    setCentro(f.centro);
    setFechaInicioLectiva(f.fechaInicioLectiva);
    setFechaFinLectiva(f.fechaFinLectiva);
    setFechaInicioPractica(f.fechaInicioPractica);
    setFechaFinPractica(f.fechaFinPractica);
    setInstructorId(f.instructorId);
    setIsModalOpen(true);
  };

  const handleSaveFicha = (e: React.FormEvent) => {
    e.preventDefault();
    const inst = instructores.find((i) => i.id === instructorId) || instructores[0];

    if (editingFicha) {
      onUpdateFicha({
        ...editingFicha,
        numero,
        programa,
        codigoPrograma,
        regional,
        centro,
        fechaInicioLectiva,
        fechaFinLectiva,
        fechaInicioPractica,
        fechaFinPractica,
        instructorId: inst.id,
        instructorNombre: inst.nombre,
      });
    } else {
      const newFicha: Ficha = {
        id: `ficha-${Date.now()}`,
        numero,
        programa,
        codigoPrograma,
        regional,
        centro,
        fechaInicioLectiva,
        fechaFinLectiva,
        fechaInicioPractica,
        fechaFinPractica,
        instructorId: inst.id,
        instructorNombre: inst.nombre,
        totalAprendices: 0,
      };
      onCreateFicha(newFicha);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Global Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                Coordinación Académica & Administrativa
              </span>
              <span className="text-xs text-slate-400">SENA Regional Antioquia</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Panel de Control Global y Gestión de Fichas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisión de fichas activas, distribución de instructores y aprendices en etapa práctica
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#39A900] hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nueva Ficha</span>
          </button>
        </div>

        {/* Global KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Total Fichas Activas</span>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
              {fichas.length}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">CTPI & Centros Asociados</span>
          </div>

          <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-700 font-medium">Total Aprendices</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-900 mt-2 font-mono tabular-nums">
              {totalAprendices}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-blue-600 mt-1">
              <span>{enLectiva} Lectiva</span>
              <span>·</span>
              <span>{enPractica} Práctica</span>
            </div>
          </div>

          <div className="bg-emerald-50/70 rounded-lg p-4 border border-emerald-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-800 font-medium">Listos para Certificar (16/16)</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-2 font-mono tabular-nums">
              {listosCertificar}
            </div>
            <span className="text-[11px] text-emerald-700 mt-1 block font-medium">
              Con paz y salvo habilitado
            </span>
          </div>

          <div className="bg-purple-50/60 rounded-lg p-4 border border-purple-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-700 font-medium">Instructores Asignados</span>
              <GraduationCap className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900 mt-2 font-mono tabular-nums">
              {instructores.length}
            </div>
            <span className="text-[11px] text-purple-600 mt-1 block">En seguimiento activo</span>
          </div>
        </div>

      </div>

      {/* Fichas CRUD Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Search & Title Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Catálogo de Fichas de Caracterización y Asignaciones
            </h3>
            <p className="text-xs text-slate-500">
              Control de cronograma de etapa lectiva y etapa práctica
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ficha, programa o instructor..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#39A900]/40 focus:border-[#39A900]"
            />
          </div>
        </div>

        {/* Fichas Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#00324D] text-white text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">No. Ficha</th>
                <th className="py-3 px-4">Programa Tecnólogo</th>
                <th className="py-3 px-4">Etapa Lectiva</th>
                <th className="py-3 px-4">Etapa Práctica</th>
                <th className="py-3 px-4">Instructor Asignado</th>
                <th className="py-3 px-3 text-center">Aprendices</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredFichas.map((f) => {
                const fAprendices = aprendices.filter((a) => a.fichaId === f.id);

                return (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Ficha Number */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                      {f.numero}
                    </td>

                    {/* Program */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{f.programa}</div>
                      <div className="text-[11px] text-slate-500">{f.centro}</div>
                    </td>

                    {/* Lectiva */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      <div>{f.fechaInicioLectiva}</div>
                      <div className="text-slate-400 text-[10px]">hasta {f.fechaFinLectiva}</div>
                    </td>

                    {/* Practica */}
                    <td className="py-3 px-4 font-mono text-[11px] text-emerald-800 font-semibold">
                      <div>{f.fechaInicioPractica}</div>
                      <div className="text-slate-400 text-[10px] font-normal">hasta {f.fechaFinPractica}</div>
                    </td>

                    {/* Instructor with Fast Assignment Selector */}
                    <td className="py-3 px-4">
                      <select
                        value={f.instructorId}
                        onChange={(e) => onAssignInstructor(f.id, e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#39A900]"
                      >
                        {instructores.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            {inst.nombre}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Count */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 tabular-nums">
                      {fAprendices.length}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(f)}
                          title="Editar Ficha"
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Está seguro de eliminar la ficha ${f.numero}?`)) {
                              onDeleteFicha(f.id);
                            }
                          }}
                          title="Eliminar Ficha"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal: Crear / Editar Ficha */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            <div className="bg-[#00324D] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingFicha ? `Editar Ficha ${editingFicha.numero}` : 'Crear Nueva Ficha de Caracterización'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFicha} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Número de Ficha:</label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="Ej: 2847431"
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono font-bold focus:ring-1 focus:ring-[#39A900]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Código de Programa:</label>
                  <input
                    type="text"
                    value={codigoPrograma}
                    onChange={(e) => setCodigoPrograma(e.target.value)}
                    placeholder="Ej: 228106"
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono focus:ring-1 focus:ring-[#39A900]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre del Tecnólogo / Programa:</label>
                <input
                  type="text"
                  value={programa}
                  onChange={(e) => setPrograma(e.target.value)}
                  placeholder="Ej: Análisis y Desarrollo de Software (ADSO)"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#39A900]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fecha Inicio Lectiva:</label>
                  <input
                    type="date"
                    value={fechaInicioLectiva}
                    onChange={(e) => setFechaInicioLectiva(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#39A900]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fecha Fin Lectiva:</label>
                  <input
                    type="date"
                    value={fechaFinLectiva}
                    onChange={(e) => setFechaFinLectiva(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#39A900]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fecha Inicio Práctica:</label>
                  <input
                    type="date"
                    value={fechaInicioPractica}
                    onChange={(e) => setFechaInicioPractica(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#39A900]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fecha Fin Práctica:</label>
                  <input
                    type="date"
                    value={fechaFinPractica}
                    onChange={(e) => setFechaFinPractica(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#39A900]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Instructor de Seguimiento Asignado:</label>
                <select
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-[#39A900]"
                >
                  {instructores.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.nombre} ({inst.regional})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#39A900] hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  {editingFicha ? 'Guardar Cambios' : 'Crear Ficha'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
