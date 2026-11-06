import type { UserAccount, Role, Ficha, Instructor, Aprendiz, EmpresaData, ExcelSheetData } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const TOKEN_KEY = 'sena_api_access_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('sena_active_session'); // Retira la sesión del prototipo.
};

async function request<T>(route: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${route}`, { ...options, headers });
  } catch {
    throw new Error('No hay conexión con FastAPI. Verifica que esté activo en el puerto 8000.');
  }
  if (!response.ok) {
    let reason = `Error HTTP ${response.status}`;
    try {
      const detail = await response.json();
      reason = typeof detail.detail === 'string' ? detail.detail : reason;
    } catch { /* Sin contenido JSON */ }
    if (response.status === 401 && route !== '/auth/login') clearSession();
    throw new Error(reason);
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

const json = (data: unknown) => JSON.stringify(data);

export interface Datos { fichas: Ficha[]; aprendices: Aprendiz[]; instructores: Instructor[] }
export interface UploadData {
  nombreArchivo: string;
  tamano?: string;
  formato?: 'excel' | 'pdf' | 'imagen';
  periodo: string;
  horas: number;
  actividades: string[];
  excelDetalles?: ExcelSheetData;
  dataUrl?: string;
}

export const api = {
  login: async (username: string, password: string, role: Role, remember: boolean) => {
    const result = await request<{ access_token: string; user: UserAccount }>('/auth/login', {
      method: 'POST', body: json({ username, password, role }),
    });
    clearSession();
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, result.access_token);
    return result.user;
  },
  me: () => request<UserAccount>('/auth/me'),
  datos: () => request<Datos>('/datos'),
  createFicha: (data: Ficha) => request<Ficha>('/fichas', { method: 'POST', body: json({ data }) }),
  updateFicha: (f: Ficha) => request<Ficha>(`/fichas/${encodeURIComponent(f.id)}`, {method:'PUT',body:json({data:f})}),
  deleteFicha: (id: string) => request<void>(`/fichas/${encodeURIComponent(id)}`,{method:'DELETE'}),
  assignInstructor: (fichaId: string, instructorId: string) => request<Ficha>(`/fichas/${encodeURIComponent(fichaId)}/instructor`, { method: 'PATCH', body: json({ instructorId }) }),
  updateEmpresa: (aprId: string, empresa: EmpresaData) => request<Aprendiz>(`/aprendices/${encodeURIComponent(aprId)}/empresa`, { method: 'PATCH', body: json({ data: empresa }) }),
  upload: (aprId: string, itemId: string, data: UploadData) => request<Aprendiz>(`/aprendices/${encodeURIComponent(aprId)}/items/${encodeURIComponent(itemId)}/upload`, {method:'POST',body:json({ ...data, formato: data.formato || 'pdf' })}),
  review: (aprId: string, itemId: string, estado: 'aprobado'|'rechazado', observaciones='') => request<Aprendiz>(`/aprendices/${encodeURIComponent(aprId)}/items/${encodeURIComponent(itemId)}/revision`, {method:'POST',body:json({estado,observaciones})}),
  pazYSalvo: (aprId: string) => request<Aprendiz>(`/aprendices/${encodeURIComponent(aprId)}/paz-y-salvo`,{method:'POST'}),
  archivo: async (aprId: string,itemId: string): Promise<string | undefined> => {
    const response = await fetch(`${API_BASE}/aprendices/${encodeURIComponent(aprId)}/items/${encodeURIComponent(itemId)}/archivo`, {
      headers: { Authorization: `Bearer ${getToken() || ''}` },
    });
    if (response.status === 404) return undefined; // Archivo simulado del dataset inicial.
    if (!response.ok) throw new Error('No se pudo consultar el archivo');
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },
};
