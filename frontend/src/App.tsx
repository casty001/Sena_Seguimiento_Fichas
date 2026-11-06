import React, { useEffect, useState } from 'react';
import type { Aprendiz, BitacoraItem, Ficha, Instructor, EmpresaData, UserAccount } from './types';
import { countApprovedItems } from './data/seedData';
import { api, clearSession, getToken, type UploadData } from './api/client';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { InstructorView } from './components/InstructorView';
import { AprendizView } from './components/AprendizView';
import { AdminView } from './components/AdminView';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { UploadModal } from './components/UploadModal';
import { PazYSalvoModal } from './components/PazYSalvoModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [activeFichaId, setActiveFichaId] = useState<string>('');
  const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [viewerItem, setViewerItem] = useState<{ item: BitacoraItem | null; aprendiz: Aprendiz | null }>({ item:null, aprendiz:null });
  const [uploadItem, setUploadItem] = useState<{ item: BitacoraItem | null; aprendiz: Aprendiz | null }>({ item:null, aprendiz:null });
  const [pazYSalvoAprendiz, setPazYSalvoAprendiz] = useState<Aprendiz|null>(null);

  useEffect(() => {
    if (!getToken()) { setAuthChecking(false); return; }
    api.me().then(setCurrentUser).catch(() => clearSession()).finally(() => setAuthChecking(false));
  }, []);

  const reload = async () => {
    const result = await api.datos();
    setFichas(result.fichas);
    setAprendices(result.aprendices);
    setInstructores(result.instructores);
    setActiveFichaId(prev => result.fichas.some(f=>f.id===prev) ? prev : result.fichas[0]?.id || '');
  };

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    reload().catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [currentUser?.id]);

  const report = (err: unknown) => {
    const msg = err instanceof Error ? err.message : 'Error inesperado';
    setError(msg);
    alert(msg);
  };
  const update = async (operation: () => Promise<unknown>) => {
    try { await operation(); await reload(); } catch (err) { report(err); }
  };
  const logout = () => { clearSession(); setCurrentUser(null); setFichas([]); setAprendices([]); setInstructores([]); };

  const enrichedAprendices = aprendices.map(apr => ({...apr, itemsAprobadosCount: countApprovedItems(apr.items)}));
  const activeInstructor = instructores.find(i=>i.id === (currentUser as UserAccount & {instructorId?:string})?.instructorId) || instructores[0];
  const currentAprendiz = enrichedAprendices.find(a => a.id === currentUser?.aprendizId || a.documento === currentUser?.documento) || enrichedAprendices[0];

  const openDocument = async (item: BitacoraItem, apr: Aprendiz) => {
    setViewerItem({item,aprendiz:apr});
    try {
      const dataUrl = await api.archivo(apr.id,item.id);
      if (dataUrl) {
        setViewerItem(v => v.item?.id===item.id && v.aprendiz?.id===apr.id
          ? {item:{...item,archivo:{...item.archivo!,dataUrl}},aprendiz:apr} : v);
      }
    } catch (err) { report(err); }
  };
  const openPaz = async (apr: Aprendiz) => {
    if (countApprovedItems(apr.items) !== 16) { report(new Error('Se requieren los 16 ítems aprobados para generar el paz y salvo')); return; }
    if (currentUser?.role === 'aprendiz') { setPazYSalvoAprendiz(apr); return; }
    try {
      const updated = await api.pazYSalvo(apr.id);
      setPazYSalvoAprendiz(updated);
      await reload();
    } catch (err) { report(err); }
  };

  if (authChecking) return <div className="p-8 text-center">Validando sesión...</div>;
  if (!currentUser) return <LoginScreen onLoginSuccess={user => { setLoading(true); setCurrentUser(user); }}/>;
  if (loading) return <div className="p-8 text-center">Cargando información desde FastAPI...</div>;
  if (error && !fichas.length && !aprendices.length) return (
    <div className="p-8 text-center"><p className="text-red-700">{error}</p>
      <button className="underline mr-4" onClick={() => reload().catch(report)}>Reintentar</button>
      <button className="underline" onClick={logout}>Salir</button></div>
  );
  if (currentUser.role === 'aprendiz' && !currentAprendiz) return (
    <div className="p-8">No tienes un registro de aprendiz asociado. <button className="underline" onClick={logout}>Salir</button></div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Header currentUser={currentUser} onLogout={logout} selectedAprendiz={currentUser.role==='aprendiz' ? currentAprendiz : undefined} activeInstructor={activeInstructor}/>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="mb-4 text-sm p-3 bg-rose-50 border border-rose-200 text-rose-700">{error}</div>}
        {currentUser.role==='admin' && <AdminView
          fichas={fichas} aprendices={enrichedAprendices} instructores={instructores}
          onCreateFicha={f=>void update(()=>api.createFicha(f))}
          onUpdateFicha={f=>void update(()=>api.updateFicha(f))}
          onDeleteFicha={id=>void update(()=>api.deleteFicha(id))}
          onAssignInstructor={(fichaId,id)=>void update(()=>api.assignInstructor(fichaId,id))}
        />}
        {currentUser.role==='instructor' && activeInstructor && <InstructorView
          fichas={fichas} activeFichaId={activeFichaId} onSelectFicha={setActiveFichaId}
          aprendices={enrichedAprendices} activeInstructor={activeInstructor}
          onOpenDocumentViewer={(item,apr)=>void openDocument(item,apr)}
          onOpenPazYSalvo={apr=>void openPaz(apr)}
        />}
        {currentUser.role==='aprendiz' && currentAprendiz && <AprendizView
          aprendiz={currentAprendiz}
          onOpenDocumentViewer={item=>void openDocument(item,currentAprendiz)}
          onOpenUploadModal={item=>setUploadItem({item,aprendiz:currentAprendiz})}
          onOpenPazYSalvo={()=>void openPaz(currentAprendiz)}
          onUpdateEmpresa={(empresa: EmpresaData)=>void update(()=>api.updateEmpresa(currentAprendiz.id,empresa))}
        />}
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto text-center text-xs text-slate-500">
        Sistema de seguimiento de etapa práctica · Prototipo independiente para demostración
      </footer>
      {viewerItem.item && viewerItem.aprendiz && (() => {
        const freshApr = enrichedAprendices.find(a=>a.id===viewerItem.aprendiz?.id) || viewerItem.aprendiz;
        const fresh = freshApr.items[viewerItem.item.id] || viewerItem.item;
        const item: BitacoraItem = viewerItem.item.archivo?.dataUrl
          ? {...fresh,archivo:{...fresh.archivo!,dataUrl:viewerItem.item.archivo.dataUrl}} : fresh;
        return <DocumentViewerModal
          isOpen={true} onClose={()=>setViewerItem({item:null,aprendiz:null})}
          item={item} aprendiz={freshApr} isInstructorView={currentUser.role==='instructor'}
          onApprove={itemId=>void update(()=>api.review(freshApr.id,itemId,'aprobado'))}
          onReject={(itemId,obs)=>void update(()=>api.review(freshApr.id,itemId,'rechazado',obs))}
        />;
      })()}
      {uploadItem.item && uploadItem.aprendiz && <UploadModal
        isOpen={true} onClose={()=>setUploadItem({item:null,aprendiz:null})} item={uploadItem.item}
        onSaveUpload={(itemId,data:UploadData)=>void update(()=>api.upload(uploadItem.aprendiz!.id,itemId,data))}
      />}
      {pazYSalvoAprendiz && <PazYSalvoModal
        isOpen={true} onClose={()=>setPazYSalvoAprendiz(null)} aprendiz={pazYSalvoAprendiz}
        instructorNombre={activeInstructor?.nombre || 'Instructor asignado'}/>
      }
    </div>
  );
}
