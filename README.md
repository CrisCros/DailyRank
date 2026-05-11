# DayRank

DayRank es una red social privada mobile-first para registrar cómo ha ido cada día y compartirlo con amigos. Este repositorio contiene la **Fase 1** del MVP: base técnica, autenticación segura y rutas privadas.

## Estado de la Fase 1

Implementado:

- Proyecto Next.js con App Router, TypeScript y Tailwind CSS.
- Prisma ORM preparado para PostgreSQL.
- Autenticación con Auth.js/NextAuth usando credenciales.
- Registro con nombre, username único, email único y contraseña.
- Login y logout.
- Protección de rutas privadas mediante middleware.
- Validación de formularios con Zod.
- Hash seguro de contraseñas con bcrypt.
- Mensajes de error claros en registro y login.
- Estructura limpia de carpetas para escalar a perfiles, posts, feed y PWA.

No implementado todavía: publicaciones, likes, comentarios, amigos, estadísticas, edición de perfil y subida real de imágenes.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Auth.js / NextAuth
- Zod
- Recharts preparado como dependencia para fases de estadísticas
- Cloudinary reservado en variables de entorno para fases de imágenes

## Requisitos

- Node.js 20 o superior.
- Una base de datos PostgreSQL accesible.

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

Variables necesarias:

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión PostgreSQL para Prisma. |
| `AUTH_SECRET` | Secreto largo usado por Auth.js para firmar sesiones. |
| `AUTH_URL` | URL pública/local de la app. En local: `http://localhost:3000`. |
| `NEXTAUTH_URL` | Compatibilidad con NextAuth. En local: `http://localhost:3000`. |
| `CLOUDINARY_CLOUD_NAME` | Reservada para subida de imágenes en una fase posterior. |
| `CLOUDINARY_API_KEY` | Reservada para subida de imágenes en una fase posterior. |
| `CLOUDINARY_API_SECRET` | Reservada para subida de imágenes en una fase posterior. |

Puedes generar un secreto con:

```bash
npx auth secret
```

## Instalación

```bash
npm install
```

## Base de datos

Genera el cliente de Prisma:

```bash
npm run prisma:generate
```

Crea y aplica la primera migración:

```bash
npm run prisma:migrate -- --name init
```

Abre Prisma Studio si quieres inspeccionar los datos:

```bash
npm run prisma:studio
```

## Desarrollo

```bash
npm run dev
```

Después abre `http://localhost:3000`.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Estructura principal

```text
src/
  app/
    (auth)/login       Página de login
    (auth)/register    Página de registro
    actions/           Server actions de autenticación
    api/auth/          Handler de Auth.js
    dashboard/         Ruta privada inicial
  components/          Componentes reutilizables
  lib/                 Prisma y utilidades compartidas
  validations/         Schemas Zod
prisma/
  schema.prisma        Modelo de datos inicial
```

## Seguridad aplicada en Fase 1

- Validación de entradas en servidor con Zod.
- `email` y `username` únicos en Prisma.
- Contraseñas hasheadas con bcrypt antes de persistirlas.
- Sesiones JWT firmadas por Auth.js.
- Middleware para redirigir rutas privadas si no hay sesión.
- Variables sensibles fuera del código mediante `.env`.

## Siguientes pasos sugeridos

1. Fase 2: perfil editable, configuración de cuenta y modo claro/oscuro persistido.
2. Fase 3: publicaciones diarias con constraint de una publicación principal por usuario y fecha.
3. Fase 4-6: feed social, likes, comentarios y amistades con permisos validados en servidor.
4. Fase 7: estadísticas con Recharts y consultas agregadas.
5. Fase 8: completar PWA con iconos, service worker, estrategia offline y push notifications.
