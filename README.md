# San Gabriel — Sistema de Gestión de Inventarios con BI

Sistema para **Minimarkets San Gabriel S.A.C.** (4 locales, Los Olivos, Lima) construido con
React + Vite + TypeScript + Supabase + TailwindCSS + Recharts, según el prompt de desarrollo original.

## 1. Requisitos

- Node.js 18+
- Una cuenta y proyecto en [supabase.com](https://supabase.com) (plan gratuito es suficiente)

## 2. Configurar Supabase

1. Crea un proyecto nuevo en Supabase.
2. Ve a **SQL Editor** y ejecuta, en orden:
   - `supabase/migrations/0001_init.sql` (tablas, triggers, vistas, RLS)
   - `supabase/migrations/0002_seed.sql` (datos de ejemplo: 4 locales, categorías, proveedores, productos)
3. Ve a **Project Settings → API** y copia:
   - `Project URL` → será tu `VITE_SUPABASE_URL`
   - `anon public key` → será tu `VITE_SUPABASE_ANON_KEY`
4. Crea al menos un usuario **gerente** para poder entrar la primera vez:
   - Ve a **Authentication → Users → Add user** y crea un usuario con correo y contraseña.
   - Copia su UUID.
   - En **SQL Editor**, ejecuta (reemplazando los valores):
     ```sql
     insert into usuario (id_usuario, nombre, rol, id_local)
     values ('UUID-DEL-USUARIO', 'Nombre del Gerente', 'gerente', null);
     ```
   - Repite el proceso para crear cajeros/almaceneros de prueba (usa el `id_local` de alguno
     de los 4 locales insertados por el seed, visible en la tabla `local`). También puedes
     crearlos desde el propio sistema, en **Usuarios**, una vez que ingreses como gerente.

## 3. Configurar el proyecto

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## 4. Instalar y ejecutar

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` e ingresa con el correo/contraseña del usuario gerente creado.

## 5. (Opcional) Regenerar tipos desde el esquema real

```bash
npx supabase login
npx supabase gen types typescript --project-id TU_PROJECT_ID > src/lib/types.ts
```
(Esto reemplaza el archivo de tipos manual por uno 100% sincronizado con tu base de datos.)

## 6. Despliegue

- **Frontend:** sube el repo a GitHub y despliega en [Vercel](https://vercel.com), configurando
  las mismas variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en el proyecto de Vercel.
- **Backend:** ya vive en Supabase Cloud, no requiere despliegue adicional.

## 7. Estructura

```
src/
  components/ui/      # Button, Card, Input, Table, Badge, etc.
  features/
    auth/              # Login + contexto de sesión
    pos/               # Módulo de ventas (cajero)
    inventario/        # Stock por local + registro de compras (almacenero)
    catalogo/           # CRUD productos/categorías/proveedores (gerente)
    dashboard/          # KPIs y gráficos BI (gerente)
    usuarios/           # Alta y gestión de cuentas (gerente)
  hooks/                # Hooks de datos con TanStack Query
  routes/               # Layout y guards de ruta por rol
supabase/
  migrations/           # SQL: esquema, triggers, vistas, RLS y seed
```

## 8. Roles y accesos

| Rol | Ruta principal | Acceso |
|---|---|---|
| Cajero | `/pos` | Solo ventas de su propio local |
| Almacenero | `/inventario` | Inventario y compras de su propio local |
| Gerente | `/dashboard` | Todo: dashboard, catálogo, usuarios, inventario consolidado |

Todo el control de acceso está reforzado con **Row Level Security** en PostgreSQL —
las políticas de la sección 4 del prompt original garantizan que ningún usuario pueda
ver o modificar datos fuera de su alcance, incluso si se manipula el frontend.

## 9. Notas importantes

- El alta de usuarios desde el módulo **Usuarios** usa `supabase.auth.signUp()` como
  referencia funcional. En producción se recomienda mover esa lógica a una **Supabase
  Edge Function** con la `service_role key`, para que la creación de cuentas no afecte
  la sesión activa del gerente y quede completamente auditada del lado del servidor.
- Los triggers de la base de datos son la única fuente de verdad para el descuento/incremento
  de stock: nunca se actualiza `inventario` manualmente desde el frontend, tal como pide
  el criterio de aceptación del prompt original.
