# 🐾 Patitas Unidas — Sitio Web

Sitio web completo para asociación de ayuda a perros de la calle.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación admin | Supabase Auth |
| Pagos | Conekta (tarjeta + OXXO) |
| Hosting recomendado | Vercel (gratis) |
| Íconos | Lucide React |

## Estructura del proyecto

```
src/
├── components/
│   ├── Navbar.jsx          # Navegación fija con scroll effect
│   ├── Footer.jsx          # Pie de página con links
│   ├── DonationForm.jsx    # Formulario de donación (Conekta)
│   └── ProtectedRoute.jsx  # Guard para rutas de admin
├── context/
│   └── AuthContext.jsx     # Estado de autenticación global
├── lib/
│   ├── supabase.js         # Cliente + todas las funciones CRUD
│   └── conekta.js          # Integración pagos (card, OXXO)
├── pages/
│   ├── Home.jsx            # Hero, misión, carruseles, CTA
│   ├── Albergues.jsx       # Grid de todos los albergues
│   ├── AlbergueDetalle.jsx # Página individual de cada albergue
│   ├── Transparencia.jsx   # Financiero + tabla de gastos
│   ├── Noticias.jsx        # Noticias y anuncios
│   └── admin/
│       ├── Login.jsx       # Formulario de acceso admin
│       └── Dashboard.jsx   # Panel completo de administración
├── styles/
│   └── globals.css         # Variables CSS + estilos globales
└── main.jsx                # Router principal + entry point
```

## Instalación y uso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```
Edita `.env` con tus credenciales reales.

### 3. Configurar Supabase
- Crea un proyecto en [supabase.com](https://supabase.com)
- Ve a **SQL Editor** y ejecuta todo el contenido de `SUPABASE_SETUP.sql`
- Ve a **Authentication → Users** y crea el usuario admin

### 4. Configurar Conekta
- Crea una cuenta en [conekta.com](https://conekta.com)
- Obtén tu **llave pública** en Configuración → API Keys
- Añádela a `.env` como `VITE_CONEKTA_PUBLIC_KEY`
- Para cobros reales, despliega la Edge Function de Supabase (ver `src/lib/conekta.js`)

### 5. Correr en desarrollo
```bash
npm run dev
```

### 6. Build para producción
```bash
npm run build
```

## Deploy en Vercel (recomendado)

```bash
npm install -g vercel
vercel --prod
```
Vercel detecta Vite automáticamente. Solo agrega las variables de entorno en el dashboard de Vercel.

## Rutas del sitio

| Ruta | Página |
|------|--------|
| `/` | Inicio (Home) |
| `/albergues` | Lista de albergues |
| `/albergues/:id` | Detalle de albergue |
| `/transparencia` | Transparencia financiera |
| `/noticias` | Noticias y anuncios |
| `/admin/login` | Acceso al panel |
| `/admin` | Panel de administración |

## Panel de administración

Accede en `/admin/login` con las credenciales del usuario que creaste en Supabase Auth.

Desde el panel puedes:
- **Resumen**: métricas clave y últimas donaciones
- **Albergues**: crear, editar y eliminar albergues con subida de imágenes
- **Noticias**: publicar noticias, anuncios y logros
- **Gastos**: registrar y filtrar gastos para transparencia pública
- **Donaciones**: ver historial de donaciones y su estatus
