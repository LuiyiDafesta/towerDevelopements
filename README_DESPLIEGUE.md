# INSTRUCCIONES DE DESPLIEGUE (FEROZO)

> [!IMPORTANT]
> **NO SUBIR LA CARPETA `_source` AL HOSTING.**
> El código fuente vive en `_source/`, pero el sitio web compilado vive en la **RAÍZ** del proyecto.

## Estructura del Proyecto
- `_source/`: Contiene el código de React, Vite y Supabase. **Solo para desarrollo.**
- `(Raíz)/`: Contiene la versión compilada lista para el hosting.

## Pasos para el Despliegue
1. Entrar a la carpeta `_source/`.
2. Ejecutar `npm run build`. 
   - *Vite está configurado para exportar los archivos directamente a la raíz de este proyecto.*
3. Conectar al FTP del hosting (Ferozo).
4. Subir **SOLO** los archivos/carpetas que están en la **RAÍZ** del proyecto local a la carpeta `/app` (o la que corresponda) del hosting:
   - `assets/` (carpeta)
   - `index.html`
   - `.htaccess`
   - `favicon.ico`
   - `placeholder.svg`
   - `robots.txt`

## Recordatorio para el Desarrollador (Antigravity)
- La configuración de Vite (`_source/vite.config.ts`) tiene el `outDir` seteado en `../` (la raíz).
- Nunca cambies el `outDir` a `dist` o similar sin consultar.
- El archivo `.htaccess` es vital para que las rutas de `react-router` funcionen en Ferozo (Apache).
