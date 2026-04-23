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

-- ==========================================
-- 2. TABLAS DE CATÁLOGO Y USUARIOS
-- ==========================================

-- Perfiles de usuario (vinculados al Login)
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    full_name text,
    updated_at timestamptz DEFAULT now()
);

-- Clientes
CREATE TABLE public.clients (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    samsara_user text,
    drive_folder_link text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT clients_pkey PRIMARY KEY (id)
);

-- Modelos de Dispositivos (Catálogo)
CREATE TABLE public.device_models (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    model_name text NOT NULL UNIQUE,
    CONSTRAINT device_models_pkey PRIMARY KEY (id)
);

-- Técnicos (Externos)
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
-- 3. TABLAS OPERATIVAS (Proyectos y Unidades)
-- ==========================================

-- Proyectos
CREATE TABLE public.projects (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES public.clients(id),
    name text NOT NULL,
    total_units_expected integer DEFAULT 0,
    contact_name text,
    contact_phone text,
    drive_project_link text,
    status text DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'activo', 'pausado', 'finalizado')),
    created_at timestamptz DEFAULT now(),
    CONSTRAINT projects_pkey PRIMARY KEY (id)
);

-- Vehículos (Instalaciones)
CREATE TABLE public.vehicles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES public.projects(id),
    technician_id uuid REFERENCES public.technicians(id),
    vin text NOT NULL,
    plate text,
    city text,
    status text DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'instalado', 'revision')),
    installed_at timestamptz,
    notes text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT vehicles_pkey PRIMARY KEY (id)
);

-- Dispositivos por Vehículo (Relación 1:N)
CREATE TABLE public.devices (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE,
    device_model_id uuid REFERENCES public.device_models(id),
    serial_number text, -- Opcional
    created_at timestamptz DEFAULT now(),
    CONSTRAINT devices_pkey PRIMARY KEY (id)
);

-- ==========================================
-- 4. INTELIGENCIA Y AUTOMATIZACIÓN
-- ==========================================

-- Vista de progreso para el Dashboard
CREATE OR REPLACE VIEW public.project_details
WITH (security_invoker = true) AS
SELECT 
    p.*,
    c.name as client_name,
    c.samsara_user,
    (SELECT COUNT(*) FROM public.vehicles v WHERE v.project_id = p.id AND v.status = 'instalado') as units_installed,
    CASE 
        WHEN p.total_units_expected = 0 THEN 0
        ELSE ROUND(
            ((SELECT COUNT(*) FROM public.vehicles v WHERE v.project_id = p.id AND v.status = 'instalado')::float / 
            p.total_units_expected::float) * 100
        )
    END as progress_percentage
FROM public.projects p
JOIN public.clients c ON p.client_id = c.id;

-- Función para crear perfil automático
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger de creación de usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 5. SEGURIDAD (RLS)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;

-- Políticas: Todo el equipo autenticado puede ver y editar todo
CREATE POLICY "Acceso total equipo" ON public.profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total equipo" ON public.clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total equipo" ON public.projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total equipo" ON public.technicians FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total equipo" ON public.vehicles FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total equipo" ON public.devices FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total equipo" ON public.device_models FOR ALL TO authenticated USING (true);