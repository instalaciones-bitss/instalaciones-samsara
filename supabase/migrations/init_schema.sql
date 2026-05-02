-- ==========================================
-- 1. LIMPIEZA DE ENTORNO (Reset total)
-- ==========================================
DROP VIEW IF EXISTS public.project_details;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.devices;
DROP TABLE IF EXISTS public.vehicles;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.technicians;
DROP TABLE IF EXISTS public.device_models;
DROP TABLE IF EXISTS public.clients;
DROP TABLE IF EXISTS public.profiles;

-- IMPORTANTE: Borrar tipos personalizados para permitir re-ejecución
DROP TYPE IF EXISTS public.project_status;
DROP TYPE IF EXISTS public.vehicle_status;

-- ==========================================
-- 2. TIPOS PERSONALIZADOS (ENUMS) - Definidos al inicio
-- ==========================================
CREATE TYPE public.project_status AS ENUM ('pendiente', 'activo', 'pausado', 'finalizado');
CREATE TYPE public.vehicle_status AS ENUM ('pendiente', 'instalado', 'problema');

-- ==========================================
-- 3. TABLAS DE CATÁLOGO Y USUARIOS
-- ==========================================

CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    full_name text,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.clients (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    samsara_user text,
    drive_folder_link text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT clients_pkey PRIMARY KEY (id)
);

CREATE TABLE public.device_models (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    model_name text NOT NULL UNIQUE,
    has_serial boolean DEFAULT true,
    CONSTRAINT device_models_pkey PRIMARY KEY (id)
);

CREATE TABLE public.technicians (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    phone text,
    city text,
    company_name text,
    is_certified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    CONSTRAINT technicians_pkey PRIMARY KEY (id)
);

-- ==========================================
-- 4. TABLAS OPERATIVAS (Proyectos y Unidades)
-- ==========================================

CREATE TABLE public.projects (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES public.clients(id),
    pm_id uuid NOT NULL REFERENCES public.profiles(id), -- Añadido directamente aquí
    name text NOT NULL,
    total_units_expected integer DEFAULT 0,
    contact_name text,
    contact_phone text,
    drive_project_link text,
    default_device_model_ids uuid[] DEFAULT '{}',
    status public.project_status DEFAULT 'pendiente', -- Usando el ENUM directamente
    created_at timestamptz DEFAULT now(),
    CONSTRAINT projects_pkey PRIMARY KEY (id)
);

CREATE TABLE public.vehicles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    technician_id uuid REFERENCES public.technicians(id),
    vin text NOT NULL, 
    plate text,
    eco_number text, 
    brand text,
    model text,
    year integer,
    city text,
    status public.vehicle_status DEFAULT 'pendiente', -- Usando el ENUM directamente
    installed_at timestamptz,
    notes text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT vehicles_pkey PRIMARY KEY (id),
    CONSTRAINT vehicles_vin_project_unique UNIQUE (vin, project_id)
);

CREATE TABLE public.devices (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE,
    device_model_id uuid REFERENCES public.device_models(id),
    serial_number text, 
    created_at timestamptz DEFAULT now(),
    CONSTRAINT devices_pkey PRIMARY KEY (id),
    -- Constraint única integrada
    CONSTRAINT unique_vehicle_device UNIQUE (vehicle_id, device_model_id)
);

-- ==========================================
-- 5. INTELIGENCIA Y VISTAS (Al final, con tablas listas)
-- ==========================================

CREATE OR REPLACE VIEW public.project_details
WITH (security_invoker = true) AS
SELECT 
    p.*,
    c.name as client_name,
    c.samsara_user,
    prof.full_name as pm_name, -- 1. Agregamos el nombre completo del PM
    (SELECT COUNT(*) 
     FROM public.vehicles v 
     WHERE v.project_id = p.id AND v.status = 'instalado') as units_installed,
    CASE 
        WHEN p.total_units_expected = 0 THEN 0
        ELSE ROUND(
            ((SELECT COUNT(*) 
              FROM public.vehicles v 
              WHERE v.project_id = p.id AND v.status = 'instalado')::float / 
            p.total_units_expected::float) * 100
        )
    END as progress_percentage
FROM public.projects p
JOIN public.clients c ON p.client_id = c.id
LEFT JOIN public.profiles prof ON p.pm_id = prof.id; -- 2. Vinculamos con profiles

-- ==========================================
-- 6. AUTOMATIZACIÓN Y SEGURIDAD
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso total equipo" ON public.profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total equipo" ON public.clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total equipo" ON public.projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total equipo" ON public.technicians FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total equipo" ON public.vehicles FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total equipo" ON public.devices FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total equipo" ON public.device_models FOR ALL TO authenticated USING (true);