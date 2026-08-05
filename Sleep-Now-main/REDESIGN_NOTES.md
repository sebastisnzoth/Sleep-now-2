# Sleep Now® V2 — Rediseño inmediato

## Cambios realizados
- Identidad completa Sleep Now® en lugar de Insomnia 0.
- Nuevo tema nocturno premium y responsive.
- Nueva pantalla de acceso.
- Nuevo dashboard Hoy con progreso del programa, rutina diaria y métricas.
- Navegación simplificada: Hoy, Programa, Diario, Calm AI y Perfil.
- Accesos directos a Respiración, Rescate 3 AM y Calm AI.
- Componentes existentes conservados para no perder funcionalidad.

## Archivos principales modificados
- `src/App.tsx`
- `src/index.css`
- `src/components/LoginView.tsx`

## Ejecución local
```bash
npm install
npm run dev
```

## Validación
En el entorno donde se realizó el rediseño no fue posible completar `npm install` porque el registro interno no contenía `@types/howler`. El código fue preparado sobre la estructura y dependencias originales, pero debe ejecutarse el build final en un entorno con acceso normal a npm.
