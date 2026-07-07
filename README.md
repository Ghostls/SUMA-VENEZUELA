# 🇻🇪 SUMA VENEZUELA — Torneo Americano de Pádel a Beneficio

Experiencia digital del torneo nacional. React + TypeScript + Vite + Tailwind + Framer Motion + Supabase.

## Rutas
- `/` — Home cinematográfica (hero, info, clubes, participación nacional, dashboard, mapa SVG, timeline, impacto, transparencia)
- `/registro` — Inscripción premium + pantalla de éxito
- `/admin` — Panel administrativo (KPIs, filtros, verificación de pago, anular/reactivar, export CSV)

## Setup
```bash
npm install
cp .env.example .env   # colocar credenciales Supabase
npm run dev
```
Sin credenciales Supabase la app corre en **modo demo** (localStorage), ideal para probar todo el flujo.

## Supabase
1. Ejecutar `supabase_schema.sql` en el SQL Editor.
2. Copiar URL y anon key a `.env`.
3. Realtime queda activo: el dashboard y el admin se actualizan solos.

## Admin
Acceso en `/admin` con código `SUMA2026` (cambiar en `src/pages/Admin.tsx`).
Producción: migrar a Supabase Auth + roles (arquitectura ya separada en services/hooks).
