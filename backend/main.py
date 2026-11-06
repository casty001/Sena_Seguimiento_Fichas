"""API local de seguimiento de etapa práctica SENA (demo, no afiliación oficial)."""
from __future__ import annotations

import base64
import binascii
import json
import os
import secrets
import sqlite3
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Literal

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / '.env')
DATA = Path(os.getenv('DATA_DIR', str(ROOT / 'data'))).resolve()
DB_PATH = DATA / 'sena.db'
FILES = DATA / 'archivos'
DATA.mkdir(parents=True, exist_ok=True)
FILES.mkdir(parents=True, exist_ok=True)
DEMO_MODE = os.getenv('DEMO_MODE', 'false').lower() == 'true'
SECRET_KEY = os.getenv('JWT_SECRET', '')
if not SECRET_KEY:
    if not DEMO_MODE:
        raise RuntimeError('Configura JWT_SECRET en backend/.env antes de iniciar.')
    secret_file = DATA / '.jwt_secret'
    if not secret_file.exists():
        secret_file.write_text(secrets.token_hex(32))
        try:
            secret_file.chmod(0o600)
        except OSError:
            pass
    SECRET_KEY = secret_file.read_text().strip()
CORS_ORIGINS = [x.strip() for x in os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',') if x.strip()]
PASSWORDS = PasswordHasher()
AUTH = HTTPBearer(auto_error=False)
ITEM_KEYS = tuple([f'B{i}' for i in range(1, 13)] + ['carnet', 'cedula', 'ape', 'tyt'])
ALLOWED_EXTENSIONS = {'.pdf', '.xlsx', '.xls', '.csv', '.png', '.jpg', '.jpeg'}
MAX_BYTES = 10 * 1024 * 1024
@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield

app = FastAPI(title='Seguimiento Etapa Práctica - API', version='0.1.0', description='API de demostración local. No es un sistema oficial del SENA.', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=False, allow_methods=['GET','POST','PUT','PATCH','DELETE'], allow_headers=['Authorization','Content-Type'])


@contextmanager
def db():
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys=ON')
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def get_entity(conn: sqlite3.Connection, table: str, entity_id: str) -> dict[str, Any]:
    if table not in ('fichas', 'aprendices', 'instructores'):
        raise ValueError('Tabla inválida')
    row = conn.execute(f'SELECT payload FROM {table} WHERE id=?', (entity_id,)).fetchone()
    if not row:
        raise HTTPException(404, f'{table}: registro no encontrado')
    return json.loads(row['payload'])


def get_entities(conn: sqlite3.Connection, table: str) -> list[dict[str, Any]]:
    if table not in ('fichas', 'aprendices', 'instructores'):
        raise ValueError('Tabla inválida')
    return [json.loads(row['payload']) for row in conn.execute(f'SELECT payload FROM {table} ORDER BY rowid')]


def put_entity(conn: sqlite3.Connection, table: str, entity: dict[str, Any]):
    if table not in ('fichas', 'aprendices', 'instructores'):
        raise ValueError('Tabla inválida')
    conn.execute(f'INSERT INTO {table}(id,payload) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload', (entity['id'], json.dumps(entity, ensure_ascii=False)))


def approved_count(apr: dict[str, Any]) -> int:
    return sum(apr.get('items', {}).get(key, {}).get('estado') == 'aprobado' for key in ITEM_KEYS)


def recalc(apr: dict[str, Any]) -> dict[str, Any]:
    count = approved_count(apr)
    apr['itemsAprobadosCount'] = count
    if count < 16:
        apr['pazYSalvoGenerado'] = False
        apr.pop('fechaPazYSalvo', None)
    return apr


def public_user(row: sqlite3.Row) -> dict[str, Any]:
    p = json.loads(row['payload'])
    p.pop('password', None)
    return p


def init_db():
    with db() as conn:
        conn.execute('PRAGMA journal_mode=WAL')
        conn.executescript('''
            CREATE TABLE IF NOT EXISTS fichas (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS aprendices (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS instructores (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT, role TEXT NOT NULL, password_hash TEXT NOT NULL, payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS documents (aprendiz_id TEXT NOT NULL, item_id TEXT NOT NULL, filename TEXT NOT NULL, stored_path TEXT NOT NULL, PRIMARY KEY(aprendiz_id,item_id));
        ''')
        if not DEMO_MODE:
            return
        if conn.execute('SELECT COUNT(*) AS c FROM fichas').fetchone()['c'] == 0:
            seed = json.loads((ROOT / 'demo_seed.json').read_text(encoding='utf-8'))
            for table in ('fichas', 'aprendices', 'instructores'):
                for entry in seed[table]:
                    if table == 'aprendices':
                        entry = recalc(entry)
                    put_entity(conn, table, entry)
        if conn.execute('SELECT COUNT(*) AS c FROM users').fetchone()['c'] == 0:
            password = os.getenv('DEMO_PASSWORD', 'SenaDemo2026!')
            if len(password) < 12:
                raise RuntimeError('DEMO_PASSWORD debe tener al menos 12 caracteres')
            users = [
                {'id': 'user-admin','username':'superadmin','nombre':'Administración de prueba','email':'admin@example.invalid','role':'admin','avatar':'AD'},
                {'id': 'user-instructor-1','username':'instructor','nombre':'Ing. Hernán Darío Velásquez','email':'hdvelasquez@example.invalid','role':'instructor','instructorId':'inst-1','avatar':'HV'},
                {'id': 'user-aprendiz-carlos','username':'1020485912','nombre':'Carlos Mario Restrepo Álvarez','email':'cmrestrepo@example.invalid','role':'aprendiz','aprendizId':'apr-1','fichaId':'ficha-1','avatar':'CR'},
                {'id': 'user-aprendiz-laura','username':'1033782941','nombre':'Laura Sofía Gómez Cárdenas','email':'lsgomez@example.invalid','role':'aprendiz','aprendizId':'apr-2','fichaId':'ficha-1','avatar':'LG'},
                {'id': 'user-aprendiz-juan','username':'1017849301','nombre':'Juan David Martínez Zuluaga','email':'jdmartinez@example.invalid','role':'aprendiz','aprendizId':'apr-3','fichaId':'ficha-1','avatar':'JM'},
            ]
            hashed = PASSWORDS.hash(password)
            for u in users:
                conn.execute('INSERT INTO users(id,username,email,role,password_hash,payload) VALUES(?,?,?,?,?,?)', (u['id'],u['username'],u['email'],u['role'],hashed,json.dumps(u,ensure_ascii=False)))




class LoginInput(BaseModel):
    username: str = Field(min_length=1,max_length=150)
    password: str = Field(min_length=1,max_length=256)
    role: Literal['admin','instructor','aprendiz']


class RevisionInput(BaseModel):
    estado: Literal['aprobado', 'rechazado']
    observaciones: str = Field(default='', max_length=2500)


class UploadInput(BaseModel):
    nombreArchivo: str = Field(min_length=1,max_length=250)
    tamano: str | None = None
    formato: Literal['excel','pdf','imagen']
    periodo: str = Field(default='',max_length=200)
    horas: float = Field(default=0,ge=0,le=2000)
    actividades: list[str] = Field(default_factory=list,max_length=300)
    excelDetalles: dict[str,Any] | None = None
    dataUrl: str = Field(min_length=10)


class JsonPayload(BaseModel):
    data: dict[str,Any]


def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(AUTH)) -> dict[str, Any]:
    if not credentials or credentials.scheme.lower() != 'bearer':
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Se requiere iniciar sesión')
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=['HS256'])
        uid = payload.get('sub')
        if not isinstance(uid, str):
            raise ValueError('Token sin usuario')
    except (jwt.InvalidTokenError, ValueError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Sesión inválida o caducada')
    with db() as conn:
        row = conn.execute('SELECT * FROM users WHERE id=?', (uid,)).fetchone()
        if not row:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Usuario no encontrado')
        return public_user(row)


def require_role(user: dict, *roles: str):
    if user['role'] not in roles:
        raise HTTPException(status.HTTP_403_FORBIDDEN, 'No tienes permisos para esta operación')


def check_aprendiz_access(conn: sqlite3.Connection, user: dict[str, Any], apr: dict[str, Any], write_mode: str = 'read'):
    if user['role'] == 'admin':
        return
    if user['role'] == 'aprendiz':
        if user.get('aprendizId') != apr['id'] or write_mode == 'review':
            raise HTTPException(403, 'Acceso no autorizado al aprendiz')
        return
    if user['role'] == 'instructor':
        fich = get_entity(conn, 'fichas', apr['fichaId'])
        if fich.get('instructorId') != user.get('instructorId') or write_mode in ('upload','company'):
            raise HTTPException(403, 'Aprendiz fuera de tus fichas o acción no permitida')
        return
    raise HTTPException(403, 'Acceso denegado')


def parse_and_save_file(apr_id: str, item_id: str, payload: UploadInput) -> Path:
    extension = Path(payload.nombreArchivo).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, 'Formato no permitido')
    if item_id.startswith('B') and extension not in ('.xlsx','.xls','.csv','.pdf'):
        raise HTTPException(400, 'Las bitácoras requieren Excel, CSV o PDF')
    try:
        prefix, body = payload.dataUrl.split(',', 1)
        if not prefix.lower().startswith('data:') or ';base64' not in prefix.lower():
            raise ValueError('Falta cabecera base64')
        if len(body) > (MAX_BYTES * 4 // 3 + 100):
            raise ValueError('Archivo demasiado grande')
        file_bytes = base64.b64decode(body, validate=True)
    except (ValueError, binascii.Error):
        raise HTTPException(400, 'Archivo inválido o demasiado grande')
    if not file_bytes or len(file_bytes) > MAX_BYTES:
        raise HTTPException(413, 'El archivo debe tener como máximo 10 MB')
    # Detectar firmas básicas; no sustituye antivirus ni controles del proveedor en producción.
    if extension == '.pdf' and not file_bytes.startswith(b'%PDF-'):
        raise HTTPException(400, 'El archivo no parece un PDF válido')
    if extension in ('.png',) and not file_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
        raise HTTPException(400, 'PNG inválido')
    if extension in ('.jpg', '.jpeg') and not file_bytes.startswith(b'\xff\xd8\xff'):
        raise HTTPException(400, 'JPG inválido')
    if extension == '.xlsx' and not file_bytes.startswith(b'PK'):
        raise HTTPException(400, 'XLSX inválido')
    dest = FILES / f'{apr_id}_{item_id}_{secrets.token_hex(10)}{extension}'
    dest.write_bytes(file_bytes)
    return dest


@app.get('/health')
def health():
    return {'status':'ok','app':'seguimiento-sena'}


@app.post('/auth/login')
def login(body: LoginInput):
    with db() as conn:
        username = body.username.strip().lower()
        row = conn.execute('SELECT * FROM users WHERE lower(username)=? OR lower(email)=?', (username,username)).fetchone()
        try:
            ok = bool(row and PASSWORDS.verify(row['password_hash'],body.password))
        except (VerifyMismatchError, VerificationError):
            ok = False
        if not ok or row['role'] != body.role:
            raise HTTPException(401, 'Credenciales o perfil incorrectos')
        expire = datetime.now(timezone.utc) + timedelta(hours=8)
        token = jwt.encode({'sub': row['id'],'exp': expire}, SECRET_KEY, algorithm='HS256')
        return {'access_token':token,'token_type':'bearer','user':public_user(row)}


@app.get('/auth/me')
def me(user: dict=Depends(current_user)):
    return user


@app.get('/datos')
def data(user: dict=Depends(current_user)):
    with db() as conn:
        fichas = get_entities(conn, 'fichas')
        aprendices = get_entities(conn, 'aprendices')
        instructores = get_entities(conn, 'instructores')
        if user['role'] == 'instructor':
            fichas = [f for f in fichas if f.get('instructorId') == user.get('instructorId')]
            allowed = {f['id'] for f in fichas}
            aprendices = [a for a in aprendices if a['fichaId'] in allowed]
            instructores = [i for i in instructores if i['id'] == user.get('instructorId')]
        elif user['role'] == 'aprendiz':
            aprendices = [a for a in aprendices if a['id'] == user.get('aprendizId')]
            fichas = [f for f in fichas if aprendices and f['id'] == aprendices[0]['fichaId']]
            instructores = [i for i in instructores if fichas and i['id'] == fichas[0].get('instructorId')]
        return {'fichas':fichas,'aprendices':[recalc(a) for a in aprendices],'instructores':instructores}


@app.post('/fichas',status_code=201)
def create_ficha(body: JsonPayload,user: dict=Depends(current_user)):
    require_role(user,'admin')
    f = body.data
    if not isinstance(f.get('id'),str) or not isinstance(f.get('numero'),str) or not f['id'] or not f['numero']:
        raise HTTPException(422,'La ficha requiere id y número')
    with db() as conn:
        if conn.execute('SELECT 1 FROM fichas WHERE id=?', (f['id'],)).fetchone():
            raise HTTPException(409,'La ficha ya existe')
        put_entity(conn,'fichas',f)
    return f


@app.put('/fichas/{ficha_id}')
def update_ficha(ficha_id: str,body: JsonPayload,user: dict=Depends(current_user)):
    require_role(user,'admin')
    with db() as conn:
        original = get_entity(conn,'fichas',ficha_id)
        if body.data.get('id') != ficha_id:
            raise HTTPException(422,'No se puede cambiar el id')
        updated = {**original,**body.data}
        put_entity(conn,'fichas',updated)
        return updated


@app.delete('/fichas/{ficha_id}',status_code=204)
def delete_ficha(ficha_id: str,user: dict=Depends(current_user)):
    require_role(user,'admin')
    with db() as conn:
        get_entity(conn,'fichas',ficha_id)
        if any(a.get('fichaId') == ficha_id for a in get_entities(conn,'aprendices')):
            raise HTTPException(409,'No se puede eliminar una ficha con aprendices asignados')
        conn.execute('DELETE FROM fichas WHERE id=?',(ficha_id,))


class AssignInput(BaseModel):
    instructorId: str


@app.patch('/fichas/{ficha_id}/instructor')
def assign_instructor(ficha_id: str,body: AssignInput,user: dict=Depends(current_user)):
    require_role(user,'admin')
    with db() as conn:
        ficha = get_entity(conn,'fichas',ficha_id)
        inst = get_entity(conn,'instructores',body.instructorId)
        ficha.update({'instructorId':inst['id'],'instructorNombre':inst['nombre']})
        put_entity(conn,'fichas',ficha)
        return ficha


@app.patch('/aprendices/{apr_id}/empresa')
def update_company(apr_id: str,body: JsonPayload,user: dict=Depends(current_user)):
    require_role(user,'admin','aprendiz')
    with db() as conn:
        apr = get_entity(conn,'aprendices',apr_id)
        check_aprendiz_access(conn,user,apr,'company')
        if not isinstance(body.data.get('razonSocial'),str) or not body.data.get('razonSocial'):
            raise HTTPException(422,'La razón social es obligatoria')
        apr['empresa'] = body.data
        apr['etapa'] = 'Práctica'
        put_entity(conn,'aprendices',apr)
        return recalc(apr)


@app.post('/aprendices/{apr_id}/items/{item_id}/upload')
def upload_item(apr_id: str,item_id: str,body: UploadInput,user: dict=Depends(current_user)):
    require_role(user,'admin','aprendiz')
    if item_id not in ITEM_KEYS:
        raise HTTPException(404,'Ítem desconocido')
    with db() as conn:
        apr = get_entity(conn,'aprendices',apr_id)
        check_aprendiz_access(conn,user,apr,'upload')
        previous = apr.get('items',{}).get(item_id,{})
        dest = parse_and_save_file(apr_id,item_id,body)
        old = conn.execute('SELECT stored_path FROM documents WHERE aprendiz_id=? AND item_id=?',(apr_id,item_id)).fetchone()
        try:
            new_file = {
                'nombre': Path(body.nombreArchivo).name,
                'tamano':body.tamano or f'{dest.stat().st_size / 1024:.0f} KB',
                'fechaCarga':datetime.now(timezone.utc).date().isoformat(),
                'periodoQuincenal':body.periodo,
                'horasPeriodo':body.horas,
                'horasAcumuladas':body.horas,
                'actividades':body.actividades,
                'formato':body.formato,
                'excelDetalles':body.excelDetalles,
                'observacionesInstructor':'',
                'firmadoAprendiz':True,
                'firmadoTutor':False,
            }
            apr.setdefault('items',{})[item_id] = {**previous,'id':item_id,'label':previous.get('label',item_id),'tipo':'bitacora' if item_id.startswith('B') else 'soporte','estado':'pendiente','archivo':new_file}
            recalc(apr)
            put_entity(conn,'aprendices',apr)
            conn.execute('INSERT INTO documents(aprendiz_id,item_id,filename,stored_path) VALUES(?,?,?,?) ON CONFLICT(aprendiz_id,item_id) DO UPDATE SET filename=excluded.filename,stored_path=excluded.stored_path',(apr_id,item_id,body.nombreArchivo,str(dest)))
        except Exception:
            dest.unlink(missing_ok=True)
            raise
    if old:
        Path(old['stored_path']).unlink(missing_ok=True)
    return recalc(apr)


@app.post('/aprendices/{apr_id}/items/{item_id}/revision')
def revise_item(apr_id: str,item_id: str,body: RevisionInput,user: dict=Depends(current_user)):
    require_role(user,'admin','instructor')
    if item_id not in ITEM_KEYS:
        raise HTTPException(404,'Ítem desconocido')
    with db() as conn:
        apr = get_entity(conn,'aprendices',apr_id)
        check_aprendiz_access(conn,user,apr,'review')
        item = apr.get('items',{}).get(item_id)
        if not item or not item.get('archivo') or item.get('estado') == 'none':
            raise HTTPException(409,'No hay documento para revisar')
        if not DEMO_MODE and not conn.execute('SELECT 1 FROM documents WHERE aprendiz_id=? AND item_id=?',(apr_id,item_id)).fetchone():
            raise HTTPException(409,'No hay archivo real cargado')
        if body.estado == 'rechazado' and not body.observaciones.strip():
            raise HTTPException(422,'El rechazo requiere observaciones')
        item['estado']=body.estado
        item['archivo']['fechaRevision']=datetime.now(timezone.utc).date().isoformat()
        item['archivo']['observacionesInstructor']=body.observaciones.strip() or 'Documento aprobado por el instructor'
        recalc(apr)
        put_entity(conn,'aprendices',apr)
        return apr


@app.get('/aprendices/{apr_id}/items/{item_id}/archivo')
def download_item(apr_id: str,item_id: str,user: dict=Depends(current_user)):
    with db() as conn:
        apr = get_entity(conn,'aprendices',apr_id)
        check_aprendiz_access(conn,user,apr,'read')
        document = conn.execute('SELECT filename,stored_path FROM documents WHERE aprendiz_id=? AND item_id=?',(apr_id,item_id)).fetchone()
        if not document:
            raise HTTPException(404,'Esta evidencia de demostración no tiene un archivo físico')
        p = Path(document['stored_path'])
        if not p.is_file() or not p.resolve().is_relative_to(FILES):
            raise HTTPException(404,'Archivo no disponible')
        return FileResponse(p,filename=Path(document['filename']).name)


@app.post('/aprendices/{apr_id}/paz-y-salvo')
def generate_clearance(apr_id: str,user: dict=Depends(current_user)):
    require_role(user,'admin','instructor')
    with db() as conn:
        apr = get_entity(conn,'aprendices',apr_id)
        check_aprendiz_access(conn,user,apr,'review')
        if approved_count(apr) != 16:
            raise HTTPException(409,'Se requieren los 16 ítems aprobados')
        apr['pazYSalvoGenerado']=True
        apr['fechaPazYSalvo']=datetime.now(timezone.utc).date().isoformat()
        put_entity(conn,'aprendices',apr)
        return recalc(apr)
