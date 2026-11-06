import React from 'react';
import { Aprendiz } from '../types';
import { X, Printer, Award, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PazYSalvoModalProps {
  isOpen: boolean;
  onClose: () => void;
  aprendiz: Aprendiz;
  instructorNombre?: string;
}

export const PazYSalvoModal: React.FC<PazYSalvoModalProps> = ({
  isOpen,
  onClose,
  aprendiz,
  instructorNombre = 'Ing. Hernán Darío Velásquez',
}) => {
  if (!isOpen) return null;

  const today = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6 max-h-[92vh]">
        
        {/* Top bar */}
        <div className="bg-[#00324D] text-white px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <span className="font-bold text-sm">Acta Institucional de Paz y Salvo - Etapa Productiva</span>
              <p className="text-[11px] text-slate-300">Regla 16/16 Ítems Cumplida a Cabalidad · Apto para Titulación</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              title="Imprimir Paz y Salvo"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 flex justify-center">
          <div className="w-full max-w-2xl bg-white border-8 border-double border-slate-300 p-8 shadow-sm text-slate-900 font-serif leading-relaxed text-xs">
            
            {/* Header */}
            <div className="text-center pb-6 border-b border-slate-300 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#39A900] text-white font-black text-xl flex items-center justify-center mx-auto mb-2 shadow-xs font-sans">
                S
              </div>
              <h2 className="text-base font-bold tracking-widest text-[#00324D] uppercase font-sans">
                SERVICIO NACIONAL DE APRENDIZAJE - SENA
              </h2>
              <p className="text-[11px] text-slate-600 font-sans uppercase tracking-wider font-semibold">
                Dirección de Formación Profesional · Regional Antioquia
              </p>
              <p className="text-[10px] text-slate-500 font-sans">
                Centro de Teleinformática y Producción Industrial (CTPI)
              </p>

              <div className="mt-4 inline-block bg-emerald-50 border border-emerald-300 px-4 py-1.5 rounded-sm">
                <span className="text-xs font-bold text-emerald-900 tracking-wider font-sans uppercase">
                  CONSTANCIA DE CUMPLIMIENTO Y PAZ Y SALVO FINAL
                </span>
              </div>
            </div>

            {/* Statement */}
            <div className="space-y-3 text-justify text-slate-800 font-sans text-xs">
              <p>
                El suscrito Instructor de Seguimiento a Etapa Productiva y la Coordinación Académica del Centro de Formación, hacen constar que:
              </p>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm text-center my-3">
                <div className="text-sm font-bold text-slate-900 uppercase font-sans">
                  {aprendiz.nombre}
                </div>
                <div className="text-xs text-slate-600 font-mono mt-0.5">
                  Identificado(a) con Cédula de Ciudadanía No. {aprendiz.documento}
                </div>
                <div className="text-xs font-semibold text-emerald-800 mt-1">
                  Programa: {aprendiz.programa} · Ficha No. {aprendiz.fichaNumero}
                </div>
              </div>

              <p>
                Ha desarrollado y culminado satisfactoriamente su <strong>ETAPA PRODUCTIVA</strong> en la modalidad de{' '}
                <strong>{aprendiz.empresa?.modalidad || 'Contrato de Aprendizaje'}</strong> en la empresa{' '}
                <strong>{aprendiz.empresa?.razonSocial || 'Empresa Co-formadora'}</strong> (NIT: {aprendiz.empresa?.nit}), habiendo cumplido cabalmente con la totalidad de{' '}
                <strong>880 horas reglamentarias</strong>.
              </p>

              <p>
                Así mismo, se verificó en la Matriz de Control Institucional el cargue y aprobación estricta de la regla de{' '}
                <strong>16 ítems reglamentarios</strong>:
              </p>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 border border-slate-200 rounded-sm text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 12 Bitácoras Quincenales (B1 a B12)
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Carnet Institucional SENA Vigente
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cédula de Ciudadanía al 150%
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Registro Agencia Pública de Empleo (APE)
                </div>
                <div className="col-span-2 flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Certificado de Presentación Pruebas Saber TyT
                </div>
              </div>

              <p>
                Por lo anterior, el aprendiz queda a <strong>PAZ Y SALVO</strong> por concepto de etapa práctica y habilitado para el proceso de certificación y expedición de título como Tecnólogo.
              </p>

              <p className="text-right text-[11px] text-slate-500 pt-2">
                Expedido a los {today} en la ciudad de Medellín, Colombia.
              </p>
            </div>

            {/* Signatures */}
            <div className="mt-10 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center font-sans text-xs">
              <div>
                <div className="h-12 flex items-end justify-center border-b border-slate-400 pb-1">
                  <span className="font-serif italic text-base text-slate-800 font-bold">
                    {instructorNombre}
                  </span>
                </div>
                <div className="font-bold text-slate-900 mt-1">{instructorNombre}</div>
                <div className="text-[10px] text-slate-500">Instructor de Seguimiento Etapa Productiva</div>
                <div className="text-[9px] text-emerald-700 font-semibold font-mono">Firma Digital Verificada</div>
              </div>

              <div>
                <div className="h-12 flex items-end justify-center border-b border-slate-400 pb-1">
                  <span className="font-serif italic text-base text-slate-800 font-bold">
                    Dra. Adriana Restrepo M.
                  </span>
                </div>
                <div className="font-bold text-slate-900 mt-1">Coordinación de Formación Profesional</div>
                <div className="text-[10px] text-slate-500">Subdirección de Centro CTPI - SENA</div>
                <div className="text-[9px] text-emerald-700 font-semibold font-mono">Certificación Avalada</div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Documento Oficial Registrado en el Sistema SofiaPlus / SenaSoft</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#39A900] hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
