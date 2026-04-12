-- ════════════════════════════════════════════════════════════════
-- PATITAS UNIDAS — Setup completo + fix admin
-- Pega TODO esto en SQL Editor y corre
-- ════════════════════════════════════════════════════════════════

-- ── TABLAS (idempotente, no borra datos existentes) ──────────────

create table if not exists albergues (
  id                   uuid default gen_random_uuid() primary key,
  nombre               text not null,
  alcaldia             text,
  descripcion          text,
  capacidad            int  default 0,
  perros_actuales      int  default 0,
  adoptados_mes        int  default 0,
  rescatados_mes       int  default 0,
  esterilizaciones_mes int  default 0,
  consultas_mes        int  default 0,
  status               text default 'open',
  imagen               text,
  direccion            text,
  telefono             text,
  email                text,
  horario              text,
  director             text,
  necesidades          jsonb default '[]',
  lat                  numeric(10,7),
  lng                  numeric(10,7),
  admin_user_id        uuid references auth.users(id) on delete set null,
  created_at           timestamptz default now()
);

create table if not exists perfiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  nombre     text,
  apellido   text,
  email      text,
  avatar_url text,
  rol        text default 'usuario',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists solicitudes_albergue (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users(id) on delete cascade,
  nombre         text not null,
  alcaldia       text,
  direccion      text,
  telefono       text,
  email_contacto text,
  descripcion    text,
  responsable    text,
  capacidad      int  default 0,
  horario        text,
  experiencia    text,
  status         text default 'pendiente',
  nota_admin     text,
  albergue_id    uuid references albergues(id) on delete set null,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create table if not exists donaciones (
  id          uuid default gen_random_uuid() primary key,
  monto       numeric(12,2) not null,
  email       text,
  nombre      text,
  metodo      text default 'card',
  status      text default 'pending',
  frecuencia  text default 'once',
  albergue_id uuid references albergues(id) on delete set null,
  user_id     uuid references auth.users(id) on delete set null,
  conekta_id  text,
  created_at  timestamptz default now()
);

create table if not exists gastos (
  id          uuid default gen_random_uuid() primary key,
  fecha       date not null,
  descripcion text not null,
  categoria   text default 'otro',
  albergue    text,
  proveedor   text,
  monto       numeric(12,2) not null,
  created_at  timestamptz default now()
);

create table if not exists noticias (
  id           uuid default gen_random_uuid() primary key,
  titulo       text not null,
  resumen      text,
  contenido    text,
  tipo         text default 'news',
  imagen       text,
  destacada    boolean default false,
  published_at timestamptz default now()
);

create table if not exists metodos_pago (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references auth.users(id) on delete cascade,
  tipo              text default 'card',
  ultimos4          text,
  marca             text,
  conekta_source_id text,
  es_principal      boolean default false,
  created_at        timestamptz default now()
);

create table if not exists suscripciones (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users(id) on delete cascade,
  albergue_id    uuid references albergues(id) on delete set null,
  monto          numeric(12,2) not null,
  frecuencia     text default 'monthly',
  status         text default 'active',
  metodo_pago_id uuid references metodos_pago(id) on delete set null,
  proximo_cobro  date,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ── COLUMNAS EXTRA (por si ya existían las tablas sin ellas) ─────

alter table albergues add column if not exists lat           numeric(10,7);
alter table albergues add column if not exists lng           numeric(10,7);
alter table albergues add column if not exists admin_user_id uuid references auth.users(id) on delete set null;
alter table donaciones add column if not exists user_id      uuid references auth.users(id) on delete set null;
alter table solicitudes_albergue add column if not exists capacidad   int default 0;
alter table solicitudes_albergue add column if not exists horario     text;
alter table solicitudes_albergue add column if not exists experiencia text;

-- ── TRIGGER: perfil automático al registrarse ────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, email, nombre, rol)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'rol', 'usuario')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── RLS ──────────────────────────────────────────────────────────

alter table albergues            enable row level security;
alter table perfiles             enable row level security;
alter table solicitudes_albergue enable row level security;
alter table donaciones           enable row level security;
alter table gastos               enable row level security;
alter table noticias             enable row level security;
alter table metodos_pago         enable row level security;
alter table suscripciones        enable row level security;

-- Eliminar políticas viejas que puedan chocar
drop policy if exists "Public read albergues"  on albergues;
drop policy if exists "Auth write albergues"   on albergues;
drop policy if exists "Public read noticias"   on noticias;
drop policy if exists "Auth write noticias"    on noticias;
drop policy if exists "Public read gastos"     on gastos;
drop policy if exists "Auth write gastos"      on gastos;
drop policy if exists "Public insert donacion" on donaciones;
drop policy if exists "Auth read donaciones"   on donaciones;
drop policy if exists "Auth write donaciones"  on donaciones;
drop policy if exists "Own profile"            on perfiles;
drop policy if exists "Admin all profiles"     on perfiles;
drop policy if exists "Own solicitud"          on solicitudes_albergue;
drop policy if exists "Admin solicitudes"      on solicitudes_albergue;
drop policy if exists "Own metodos pago"       on metodos_pago;
drop policy if exists "Own suscripciones"      on suscripciones;
drop policy if exists "Admin suscripciones"    on suscripciones;
drop policy if exists "Albergue edit own"      on albergues;

-- Políticas limpias
create policy "Public read albergues"   on albergues            for select using (true);
create policy "Auth write albergues"    on albergues            for all    using (auth.role() = 'authenticated');
create policy "Public read noticias"    on noticias             for select using (true);
create policy "Auth write noticias"     on noticias             for all    using (auth.role() = 'authenticated');
create policy "Public read gastos"      on gastos               for select using (true);
create policy "Auth write gastos"       on gastos               for all    using (auth.role() = 'authenticated');
create policy "Public insert donacion"  on donaciones           for insert with check (true);
create policy "Auth read donaciones"    on donaciones           for select using (auth.role() = 'authenticated');
create policy "Auth write donaciones"   on donaciones           for all    using (auth.role() = 'authenticated');
create policy "Own profile"             on perfiles             for all    using (auth.uid() = id);
create policy "Own solicitud"           on solicitudes_albergue for all    using (auth.uid() = user_id);
create policy "Public insert solicitud" on solicitudes_albergue for insert with check (auth.role() = 'authenticated');
create policy "Own metodos pago"        on metodos_pago         for all    using (auth.uid() = user_id);
create policy "Own suscripciones"       on suscripciones        for all    using (auth.uid() = user_id);

-- ── STORAGE BUCKETS ──────────────────────────────────────────────

insert into storage.buckets (id, name, public) values ('imagenes', 'imagenes', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('avatares', 'avatares', true) on conflict do nothing;

drop policy if exists "Public read images"  on storage.objects;
drop policy if exists "Auth upload images"  on storage.objects;
drop policy if exists "Auth delete images"  on storage.objects;
drop policy if exists "Avatar public read"  on storage.objects;
drop policy if exists "Avatar owner upload" on storage.objects;
drop policy if exists "Avatar owner delete" on storage.objects;

create policy "Public read images"   on storage.objects for select using (bucket_id in ('imagenes','avatares'));
create policy "Auth upload images"   on storage.objects for insert with check (auth.role() = 'authenticated');
create policy "Auth delete images"   on storage.objects for delete using (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════
-- ⚠️  ASIGNAR ROL ADMIN A TU CUENTA
--
-- REEMPLAZA el email de abajo con el email de tu cuenta admin
-- y ejecuta estas líneas AL FINAL, después de todo lo demás.
-- ════════════════════════════════════════════════════════════════

-- Paso 1: Crear el perfil si no existe (por si el trigger no corrió)
insert into perfiles (id, email, nombre, rol)
select id, email, coalesce(raw_user_meta_data->>'nombre', split_part(email,'@',1)), 'admin'
from auth.users
where email = 'TU_EMAIL_ADMIN_AQUI'   -- ← CAMBIA ESTO
on conflict (id) do update set rol = 'admin', updated_at = now();

-- Paso 2: Verificar que quedó bien (debería mostrar tu email con rol = admin)
select id, email, rol from perfiles where rol = 'admin';