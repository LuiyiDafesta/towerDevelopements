# INSTRUCCIONES DE DESPLIEGUE (FEROZO)

> [!CAUTION]
> **REGLA DE ORO:** Siempre que realices un cambio en `_source/`, **DEBES** ejecutar `npm run build` para actualizar la raíz del proyecto **ANTES** de subir los cambios a GitHub. El repositorio siempre debe tener la última versión de producción en la raíz.

> [!IMPORTANT]
> **NO SUBIR LA CARPETA `_source` AL HOSTING.**
> El código fuente vive en `_source/`, pero el sitio web compilado vive en la **RAÍZ** del proyecto.

## Estructura del Proyecto
- `_source/`: Contiene el código de React, Vite y Supabase. **Solo para desarrollo.**
- `(Raíz)/`: Contiene la versión compilada lista para el hosting. Todo lo que esté aquí debe estar sincronizado con el último build.

## Pasos Reales para cada Cambio
1. Realizar cambios en el código dentro de `_source/`.
2. **IMPORTANTE:** Abrir terminal en `_source/` y ejecutar `npm run build`.
3. Esto actualizará automáticamente `index.html`, `assets/`, etc. en la raíz.
4. Hacer `git add .` (incluyendo los archivos de la raíz actualizados).
5. Hacer `git commit` y `git push`.
6. En el hosting (Ferozo), subir los archivos de la raíz local a `/app`.

## Notas Técnicas para el Agente AI
- La configuración de Vite (`_source/vite.config.ts`) tiene el `outDir: '../'`.
- El despliegue de Tower Developers depende de que la raíz de GitHub contenga los archivos compilados.
