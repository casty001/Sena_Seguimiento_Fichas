# Instalación — Sistema de Seguimiento de Etapa Práctica SENA

## Tecnologías

**Frontend**
- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Node.js y npm

**Backend**
- Python 3.13
- FastAPI
- Uvicorn
- SQLite
- Autenticación JWT

## Requisitos

Instalar:

- Python 3.13
- Node.js 24 LTS
- npm

Verificar las instalaciones:

```bash
python3 --version
node --version
npm --version
```

## 1. Instalar el backend

Desde la raíz del proyecto:

```bash
cd backend
python3 -m pip install -r requirements.txt
```

Esta instalación se realiza sin entorno virtual.

### Configurar las variables de entorno

Crear el archivo `.env` a partir de `.env.example`:

```bash
cp -n .env.example .env
```

Configurar:

```env
JWT_SECRET=CLAVE_ALEATORIA_SEGURA
DEMO_MODE=true
DEMO_PASSWORD=SenaDemo2026!
```

Para generar una clave JWT:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Copiar el resultado a `JWT_SECRET`.

Las opciones de demostración requieren que estén implementadas en el backend.

### Ejecutar FastAPI

```bash
python3 -m uvicorn main:app --reload --port 8000
```

API disponible en:

http://127.0.0.1:8000

Documentación Swagger:

http://127.0.0.1:8000/docs

## 2. Instalar el frontend

Abrir otra terminal y entrar a la carpeta `frontend` desde la raíz del proyecto:

```bash
cd frontend
npm install
```

### Configurar la API

Crear `.env.local`:

```bash
echo "VITE_API_URL=http://127.0.0.1:8000" > .env.local
```

### Ejecutar React

```bash
npm run dev
```

Abrir:

http://localhost:3000

## 3. Credenciales de demostración

Usuario: `superadmin`

Contraseña: `SenaDemo2026!`

Estas credenciales requieren que el backend tenga habilitada y configurada la cuenta de demostración.

No utilizar estas credenciales en producción.

## 4. Compilar el frontend

```bash
cd frontend
npm run build
```

Los archivos generados estarán en:

```text
frontend/dist/
```

## 5. Ejecutar el proyecto diariamente

Una vez instaladas las dependencias, abrir dos terminales.

**Terminal 1 — Backend**

```bash
cd backend
python3 -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

Los comandos `cd backend` y `cd frontend` parten de la raíz del proyecto.

Para detener cualquiera de los servidores, presionar `Control + C`.

## 6. Solución de problemas

**Error: `vite: command not found`**

```bash
cd frontend
npm install
```

**Error: `JWT_SECRET` sin configurar**

Comprobar que `backend/.env` contiene una clave JWT válida.

**Error: `Module not found`**

Verificar que existan los archivos importados por los componentes React.

**Error: `Address already in use`**

Comprobar si el puerto 3000 o 8000 está ocupado por otro proceso.

**Error de conexión con FastAPI**

Comprobar que el backend esté ejecutándose, que la dirección de `VITE_API_URL` sea correcta y que CORS permita el origen del frontend.

## 7. Notas importantes

- No subir `.env` a GitHub.
- No subir `node_modules/`.
- No subir la base de datos SQLite con información real.
- No subir archivos privados de aprendices.
- Mantener `package-lock.json` versionado.
- Mantener `requirements.txt` actualizado.
- Utilizar contraseñas seguras y configurar los permisos antes de producción.
