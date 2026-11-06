import React, { useState } from 'react';
import { Aprendiz, BitacoraItem, Ficha, Instructor } from '../types';
import { ITEM_KEYS, ITEM_LABELS, countApprovedItems } from '../data/seedData';
import { GeoreferencingMap } from './GeoreferencingMap';
import {
  Check,
  AlertCircle,
  Clock,
  Minus,
  MapPin,
  Table as TableIcon,
  Search,
  Filter,
  FileCheck,
  Award,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface InstructorViewProps {
  fichas: Ficha[];
  activeFichaId: string;
  onSelectFicha: (fichaId: string) => void;
  aprendices: Aprendiz[];
  activeInstructor: Instructor;
  onOpenDocumentViewer: (item: BitacoraItem, aprendiz: Aprendiz) => void;
  onOpenPazYSalvo: (aprendiz: Aprendiz) => void;
  onApproveItemDirectly?: (aprendizId: string, itemId: string) => void;
}

export const InstructorView: React.FC<InstructorViewProps> = ({
  fichas,
  activeFichaId,
  onSelectFicha,
  aprendices,
  activeInstructor,
  onOpenDocumentViewer,
  onOpenPazYSalvo,
}) => {
  const [activeTab, setActiveTab] = useState<'matriz' | 'mapa'>('matriz');
  const [filterEtapa, setFilterEtapa] = useState<'todos' | 'practica' | 'lectiva' | 'certificar' | 'rechazado'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const currentFicha = fichas.find((f) => f.id === activeFichaId) || fichas[0];
  const fichaAprendices = aprendices.filter((a) => a.fichaId === activeFichaId);

  // Filtered apprentices
  const filteredAprendices = fichaAprendices.filter((a) => {
    const matchesSearch =
      a.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.documento.includes(searchQuery) ||
      (a.empresa?.razonSocial.toLowerCase() || '').includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const approvedCount = countApprovedItems(a.items);
    const hasRechazo = Object.values(a.items).some((it) => it.estado === 'rechazado');

    if (filterEtapa === 'practica') return a.etapa === 'Práctica';
    if (filterEtapa === 'lectiva') return a.etapa === 'Lectiva';
    if (filterEtapa === 'certificar') return approvedCount === 16;
    if (filterEtapa === 'rechazado') return hasRechazo;

    return true;
  });

  // KPI calculations
  const totalEnFicha = fichaAprendices.length;
  const enPractica = fichaAprendices.filter((a) => a.etapa === 'Práctica').length;
  const listosCertificar = fichaAprendices.filter((a) => countApprovedItems(a.items) === 16).length;
  const pendientesRevision = fichaAprendices.reduce((acc, a) => {
    return acc + Object.values(a.items).filter((it) => it.estado === 'pendiente').length;
  }, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Ficha Info & Metrics Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                Ficha Activa
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {currentFicha.codigoPrograma}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Ficha {currentFicha.numero} — {currentFicha.programa}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentFicha.centro} · {currentFicha.regional} · Instructor: {activeInstructor.nombre}
            </p>
          </div>

          {/* Ficha Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Cambiar ficha:</span>
            <select
              value={activeFichaId}
              onChange={(e) => onSelectFicha(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#39A900]/40 focus:border-[#39A900]"
            >
              {fichas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.numero} - {f.programa}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* 4 Metric Badges in Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-medium block">Total Aprendices</span>
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{totalEnFicha}</span>
          </div>

          <div className="bg-blue-50/60 rounded-lg p-3 border border-blue-200/70">
            <span className="text-xs text-blue-700 font-medium block">En Etapa Práctica</span>
            <span className="text-2xl font-bold text-blue-900 font-mono tabular-nums">{enPractica}</span>
          </div>

          <div className="bg-emerald-50/70 rounded-lg p-3 border border-emerald-200/80">
            <span className="text-xs text-emerald-700 font-medium block">Listos para Certificar (16/16)</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-emerald-800 font-mono tabular-nums">{listosCertificar}</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Aptos</span>
            </div>
          </div>

          <div className="bg-amber-50/70 rounded-lg p-3 border border-amber-200/80">
            <span className="text-xs text-amber-700 font-medium block">Pendientes de Revisión</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-amber-900 font-mono tabular-nums">{pendientesRevision}</span>
              <span className="text-[10px] text-amber-700 font-medium">por auditar</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main View Segmented Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Module Switcher Tabs: Matriz vs Georreferenciación */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-lg border border-slate-300/70">
          <button
            onClick={() => setActiveTab('matriz')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'matriz'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-4 h-4 text-emerald-700" />
            <span>Matriz de Control en Tiempo Real (16 Ítems)</span>
          </button>

          <button
            onClick={() => setActiveTab('mapa')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'mapa'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Georreferenciación de Empresas</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar aprendiz, documento o empresa..."
            className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#39A900]/40 focus:border-[#39A900]"
          />
        </div>

      </div>

      {/* TAB 1: MATRIZ DE CONTROL INTERACTIVA */}
      {activeTab === 'matriz' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Filter Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Filtrar por condición:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'practica', label: 'En Práctica' },
                  { id: 'lectiva', label: 'Lectiva' },
                  { id: 'certificar', label: 'Certificar (16/16)' },
                  { id: 'rechazado', label: 'Con Corrección' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterEtapa(tab.id as any)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      filterEtapa === tab.id
                        ? 'bg-[#39A900] text-white shadow-xs font-semibold'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Aprobado (X)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pendiente
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Corrección
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Sin Cargar
              </span>
            </div>
          </div>

          {/* High Density Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#00324D] text-white text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3 sticky left-0 z-20 bg-[#00324D] min-w-[210px] border-r border-slate-700">
                    Aprendiz / Cédula
                  </th>
                  <th className="py-3 px-3 min-w-[170px] border-r border-slate-700">
                    Empresa Co-formadora
                  </th>
                  <th className="py-3 px-2 text-center min-w-[80px] border-r border-slate-700">
                    Etapa
                  </th>
                  
                  {/* 12 Bitácoras */}
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                    <th
                      key={num}
                      className="py-3 px-1.5 text-center w-9 border-r border-slate-700 font-mono text-[10px]"
                      title={`Bitácora Quincenal ${num}`}
                    >
                      B{num}
                    </th>
                  ))}

                  {/* 4 Soportes */}
                  <th className="py-3 px-1.5 text-center w-11 border-r border-slate-700 text-[10px]" title="Carnet SENA">
                    Carnet
                  </th>
                  <th className="py-3 px-1.5 text-center w-11 border-r border-slate-700 text-[10px]" title="Cédula de Ciudadanía">
                    C.C.
                  </th>
                  <th className="py-3 px-1.5 text-center w-11 border-r border-slate-700 text-[10px]" title="Certificado APE">
                    APE
                  </th>
                  <th className="py-3 px-1.5 text-center w-11 border-r border-slate-700 text-[10px]" title="Pruebas Saber TyT">
                    TyT
                  </th>

                  <th className="py-3 px-2 text-center min-w-[70px] border-r border-slate-700 font-mono">
                    Total
                  </th>
                  <th className="py-3 px-3 text-center min-w-[110px] border-r border-slate-700">
                    Estado
                  </th>
                  <th className="py-3 px-3 text-center min-w-[120px]">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredAprendices.length === 0 ? (
                  <tr>
                    <td colSpan={23} className="py-8 text-center text-slate-500">
                      No se encontraron aprendices con el filtro seleccionado.
                    </td>
                  </tr>
                ) : (
                  filteredAprendices.map((apr) => {
                    const approvedCount = countApprovedItems(apr.items);
                    const isCertificable = approvedCount === 16;
                    const items = apr.items;

                    return (
                      <tr key={apr.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Aprendiz Name & Doc */}
                        <td className="py-2.5 px-3 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                          <div className="font-bold text-slate-900 leading-tight">
                            {apr.nombre}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            C.C. {apr.documento}
                          </div>
                        </td>

                        {/* Empresa */}
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          {apr.empresa ? (
                            <div>
                              <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                                {apr.empresa.razonSocial}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                                {apr.empresa.ciudad} · {apr.empresa.tutorNombre.split(' ')[0]} {apr.empresa.tutorNombre.split(' ')[1]}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Sin registrar</span>
                          )}
                        </td>

                        {/* Etapa */}
                        <td className="py-2.5 px-2 text-center border-r border-slate-200">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                              apr.etapa === 'Práctica'
                                ? 'bg-blue-50 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {apr.etapa}
                          </span>
                        </td>

                        {/* 12 Bitácoras B1..B12 */}
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
                          const key = `B${num}`;
                          const it = items[key];
                          const estado = it?.estado || 'none';

                          return (
                            <td
                              key={num}
                              className="py-2 px-1 text-center border-r border-slate-100"
                            >
                              <button
                                onClick={() => {
                                  if (it && estado !== 'none') {
                                    onOpenDocumentViewer(it, apr);
                                  }
                                }}
                                disabled={estado === 'none'}
                                title={
                                  estado === 'aprobado'
                                    ? `B${num}: Aprobado (Clic para ver formato F-023)`
                                    : estado === 'rechazado'
                                    ? `B${num}: Rechazado / Requiere corrección: ${it?.archivo?.observacionesInstructor || ''}`
                                    : estado === 'pendiente'
                                    ? `B${num}: Pendiente por auditar (Clic para evaluar)`
                                    : `B${num}: Sin cargar`
                                }
                                className={`w-7 h-7 mx-auto rounded-md flex items-center justify-center font-bold text-xs transition-transform hover:scale-110 ${
                                  estado === 'aprobado'
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer shadow-2xs'
                                    : estado === 'rechazado'
                                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 cursor-pointer animate-pulse'
                                    : estado === 'pendiente'
                                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer'
                                    : 'text-slate-300 cursor-not-allowed'
                                }`}
                              >
                                {estado === 'aprobado' ? (
                                  'X'
                                ) : estado === 'rechazado' ? (
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                                ) : estado === 'pendiente' ? (
                                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                                ) : (
                                  <Minus className="w-3 h-3 text-slate-300" />
                                )}
                              </button>
                            </td>
                          );
                        })}

                        {/* 4 Soportes: Carnet, CC, APE, TyT */}
                        {(['carnet', 'cedula', 'ape', 'tyt'] as const).map((sKey) => {
                          const it = items[sKey];
                          const estado = it?.estado || 'none';

                          return (
                            <td
                              key={sKey}
                              className="py-2 px-1 text-center border-r border-slate-100"
                            >
                              <button
                                onClick={() => {
                                  if (it && estado !== 'none') {
                                    onOpenDocumentViewer(it, apr);
                                  }
                                }}
                                disabled={estado === 'none'}
                                title={
                                  estado === 'aprobado'
                                    ? `${ITEM_LABELS[sKey].label}: Aprobado`
                                    : estado === 'rechazado'
                                    ? `${ITEM_LABELS[sKey].label}: Rechazado`
                                    : estado === 'pendiente'
                                    ? `${ITEM_LABELS[sKey].label}: Pendiente`
                                    : `${ITEM_LABELS[sKey].label}: Sin cargar`
                                }
                                className={`w-7 h-7 mx-auto rounded-md flex items-center justify-center font-bold text-xs transition-transform hover:scale-110 ${
                                  estado === 'aprobado'
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer shadow-2xs'
                                    : estado === 'rechazado'
                                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 cursor-pointer'
                                    : estado === 'pendiente'
                                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer'
                                    : 'text-slate-300 cursor-not-allowed'
                                }`}
                              >
                                {estado === 'aprobado' ? (
                                  'X'
                                ) : estado === 'rechazado' ? (
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                                ) : estado === 'pendiente' ? (
                                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                                ) : (
                                  <Minus className="w-3 h-3 text-slate-300" />
                                )}
                              </button>
                            </td>
                          );
                        })}

                        {/* Total Count */}
                        <td className="py-2.5 px-2 text-center border-r border-slate-200 font-mono font-bold text-slate-900 tabular-nums">
                          {approvedCount}/16
                        </td>

                        {/* Business Rule Badge: CERTIFICAR vs LE FALTA */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-200">
                          {isCertificable ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              CERTIFICAR
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2.5 py-1 rounded-md">
                              LE FALTA ({approvedCount}/16)
                            </span>
                          )}
                        </td>

                        {/* Actions: Paz y Salvo */}
                        <td className="py-2.5 px-3 text-center">
                          {isCertificable ? (
                            <button
                              onClick={() => onOpenPazYSalvo(apr)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#00324D] hover:bg-[#39A900] rounded-md transition-all shadow-xs"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-300" />
                              <span>Paz y Salvo</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Requiere 16/16
                            </span>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Instructions */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-400" />
              <span>
                Haz clic en cualquier celda de bitácora o soporte para abrir el <strong>Visor Web Embebido</strong> (sin descargar archivos).
              </span>
            </div>
            <div className="font-mono">
              Regla Institucional: 12 Bitácoras + Carnet + C.C. + APE + Saber TyT = 16 ítems.
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: GEORREFERENCIACIÓN DE EMPRESAS */}
      {activeTab === 'mapa' && (
        <GeoreferencingMap
          aprendices={fichaAprendices}
          onSelectAprendizForReview={(apr) => {
            setActiveTab('matriz');
            setSearchQuery(apr.nombre);
          }}
        />
      )}

    </div>
  );
};
