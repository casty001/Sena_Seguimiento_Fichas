import React, { useState } from 'react';
import { UserAccount, Role } from '../types';
import { api } from '../api/client';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Mail
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('admin');
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberSession, setRememberSession] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Por favor ingrese su usuario o correo SENA (@misena.edu.co).');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Por favor ingrese su contraseña.');
      return;
    }

    try {
      const user = await api.login(username, password, selectedRole, rememberSession);
      onLoginSuccess(user);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      
      {/* Top SENA Institutional Header */}
      <header className="bg-[#00324D] text-white border-b-4 border-[#39A900] py-3.5 px-4 sm:px-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#39A900] text-white font-black text-xl flex items-center justify-center shadow-xs">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-base sm:text-lg">SENA</span>
                <span className="text-slate-400">|</span>
                <span className="text-xs font-semibold text-emerald-300">Servicio Nacional de Aprendizaje</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Sistema Web de Seguimiento y Certificación de Etapa Práctica
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-slate-800/90 px-3 py-1.5 rounded border border-slate-700 text-slate-300">
            <KeyRound className="w-3.5 h-3.5 text-[#39A900]" />
            <span>Acceso conectado a FastAPI</span>
          </div>
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="max-w-md w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Card Top Title Banner */}
          <div className="bg-gradient-to-r from-[#00324D] to-slate-900 text-white p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#39A900] text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
              S
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Ingreso al Sistema de Etapa Práctica
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Ingrese su usuario institucional y seleccione su perfil de acceso
            </p>
          </div>

          <div className="p-6 sm:p-8">
            
            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Field 1: Usuario o Correo SENA */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Usuario o Correo Institucional:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej: superadmin o correo @misena.edu.co"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#39A900]/40 focus:border-[#39A900]"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Los aprendices se autentican con su correo SENA o usuario institucional
                </span>
              </div>

              {/* Field 2: Contraseña */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
                  <span>Contraseña:</span>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-normal">
                    Clave demo: 12345
                  </span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese su contraseña (12345)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#39A900]/40 focus:border-[#39A900]"
                    required
                  />
                </div>
              </div>

              {/* Field 3: Perfil con el que vas a entrar (Aprendiz, Instructor, Admin) */}
              <div className="pt-1">
                <label className="block text-slate-800 font-bold mb-2">
                  Perfil con el que vas a entrar:
                </label>

                {/* 3 Role Options Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  
                  {/* Option 1: Aprendiz */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('aprendiz')}
                    className={`py-2.5 px-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all text-xs font-semibold ${
                      selectedRole === 'aprendiz'
                        ? 'bg-[#00324D] text-white border-[#00324D] shadow-xs ring-2 ring-sky-500/30'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Aprendiz</span>
                  </button>

                  {/* Option 2: Instructor */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('instructor')}
                    className={`py-2.5 px-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all text-xs font-semibold ${
                      selectedRole === 'instructor'
                        ? 'bg-[#39A900] text-white border-[#39A900] shadow-xs ring-2 ring-emerald-500/30'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Instructor</span>
                  </button>

                  {/* Option 3: Administrador */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('admin')}
                    className={`py-2.5 px-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all text-xs font-semibold ${
                      selectedRole === 'admin'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-slate-500/30'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </button>

                </div>
              </div>

              {/* Remember Session Checkbox */}
              <div className="flex items-center justify-between py-1 text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="rounded border-slate-300 text-[#39A900] focus:ring-[#39A900]"
                  />
                  <span>Recordar sesión</span>
                </label>
                <span className="text-slate-400 text-[11px]">SENA SofiaPlus / F-023</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-[#39A900] hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <span>Ingresar como {selectedRole === 'admin' ? 'Administrador' : selectedRole === 'instructor' ? 'Instructor' : 'Aprendiz'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            {/* Helper Info Note */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-2xl">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Credenciales genéricas:</span>
              </div>
              <p className="text-slate-600">
                Demo local: <strong className="text-slate-900 font-mono">superadmin</strong> · Clave configurada en backend/.env
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Las credenciales se validan en FastAPI. Selecciona el perfil real asignado a tu cuenta.
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">SENA</span>
            <span>·</span>
            <span>Centro de Teleinformática y Producción Industrial (CTPI)</span>
            <span>·</span>
            <span>Regional Antioquia</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Regla de Certificación Institucional 16/16 Ítems
          </div>
        </div>
      </footer>

    </div>
  );
};
