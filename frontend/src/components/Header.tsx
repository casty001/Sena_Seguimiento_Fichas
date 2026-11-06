import React from 'react';
import { UserAccount, Aprendiz, Instructor } from '../types';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserAccount;
  onLogout: () => void;
  selectedAprendiz?: Aprendiz;
  activeInstructor?: Instructor;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  selectedAprendiz,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#39A900] flex items-center justify-center text-white font-black text-xl tracking-wider shadow-xs">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">SENA</span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Etapa Productiva
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Sistema Institucional de Seguimiento y Certificación F-023
              </p>
            </div>
          </div>

          {/* Active User Information & Single Logout Action */}
          <div className="flex items-center gap-3">
            
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5">
              
              {/* Role Icon Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                  currentUser.role === 'admin'
                    ? 'bg-slate-900'
                    : currentUser.role === 'instructor'
                    ? 'bg-[#39A900]'
                    : 'bg-[#00324D]'
                }`}
              >
                {currentUser.avatar || (
                  currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : currentUser.role === 'instructor' ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <GraduationCap className="w-4 h-4" />
                  )
                )}
              </div>

              {/* User Details */}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.nombre}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-block font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                      currentUser.role === 'admin'
                        ? 'bg-slate-200 text-slate-800'
                        : currentUser.role === 'instructor'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {currentUser.role === 'admin'
                      ? 'Administrador'
                      : currentUser.role === 'instructor'
                      ? 'Instructor Asignado'
                      : 'Aprendiz SENA'}
                  </span>
                  {currentUser.documento && (
                    <span className="font-mono text-[10px]">C.C. {currentUser.documento}</span>
                  )}
                  {currentUser.role === 'aprendiz' && selectedAprendiz && (
                    <span className="font-mono text-[10px]">· Ficha {selectedAprendiz.fichaNumero}</span>
                  )}
                </div>
              </div>

            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 shadow-2xs cursor-pointer"
              title="Cerrar sesión e ingresar con otro perfil"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
