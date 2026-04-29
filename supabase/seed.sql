-- ==========================================
-- SEED DATA: Sistema de Gestión BITSS
-- ==========================================

-- 1. Limpiar datos previos en orden inverso de jerarquía
TRUNCATE public.devices, public.vehicles, public.projects, public.technicians, public.device_models, public.clients RESTART IDENTITY CASCADE;

-- 2. Insertar Catálogo de Modelos (Con la nueva columna has_serial)
INSERT INTO public.device_models (model_name, has_serial)
VALUES 
('Samsara VG54', true),          -- GPS Principal
('Samsara CM32 (Cámara)', true),  -- Cámara
('Samsara AG26 (Caja)', true),    -- Rastreador Activos
('Botón de Pánico', false),       -- Accesorio (Sin serie)
('Sensor de Puerta', false),      -- Accesorio (Sin serie)
('Lector de Conductor', false);   -- Accesorio (Sin serie)

-- 3. Insertar Clientes
INSERT INTO public.clients (name, samsara_user)
VALUES 
('Transportes Internacionales SA', 'admin@tisa.com'),
('Logística Terrestre MX', 'fleet@logmx.com');

-- 4. Insertar Técnicos
INSERT INTO public.technicians (name, city, company_name, is_certified)
VALUES 
('Roberto Sánchez', 'Monterrey', 'BITSS Oficial', true),
('Claudia Herrera', 'CDMX', 'Instalaciones Externas', true),
('Miguel Ángel', 'Guadalajara', 'BITSS Oficial', false);

-- 5. Insertar Proyectos (Asignando el Kit Predeterminado)
-- Proyecto A: Kit Completo (VG54 + Cámara + Botón)
INSERT INTO public.projects (client_id, name, total_units_expected, status, default_device_model_ids)
SELECT 
    id as client_id, 
    'Instalación Flota Pesada 2024', 
    5, 
    'activo',
    -- Seleccionamos modelos específicos para el array
    ARRAY(
        SELECT id FROM public.device_models 
        WHERE model_name IN ('Samsara VG54', 'Samsara CM32 (Cámara)', 'Botón de Pánico')
    )::uuid[]
FROM public.clients 
WHERE name = 'Transportes Internacionales SA'
LIMIT 1;

-- Proyecto B: Kit Básico (Sólo VG54)
INSERT INTO public.projects (client_id, name, total_units_expected, status, default_device_model_ids)
SELECT 
    id as client_id, 
    'Rastreo Utilitarios', 
    3, 
    'pendiente',
    ARRAY(SELECT id FROM public.device_models WHERE model_name = 'Samsara VG54')::uuid[]
FROM public.clients 
WHERE name = 'Logística Terrestre MX'
LIMIT 1;

-- 6. Insertar Vehículos de Prueba
-- Vehículo 1: Pendiente (Sin técnico asignado)
INSERT INTO public.vehicles (project_id, vin, plate, eco_number, brand, model, year, status)
SELECT 
    id, 'VIN-TISA-001', 'P-11-AA', 'ECO-01', 'Kenworth', 'T680', 2024, 'pendiente'
FROM public.projects WHERE name = 'Instalación Flota Pesada 2024';

-- Vehículo 2: Instalado (Con técnico y FECHA)
INSERT INTO public.vehicles (project_id, vin, plate, eco_number, brand, model, year, status, technician_id, installed_at)
SELECT 
    p.id, 'VIN-TISA-002', 'P-22-BB', 'ECO-02', 'Freightliner', 'Cascadia', 2023, 'instalado',
    (SELECT id FROM public.technicians WHERE name = 'Roberto Sánchez'),
    now() - interval '2 days'
FROM public.projects p WHERE name = 'Instalación Flota Pesada 2024';

-- Vehículo 3: Problema
INSERT INTO public.vehicles (project_id, vin, plate, eco_number, brand, model, year, status, notes)
SELECT 
    id, 'VIN-TISA-ERR', 'P-ERR-01', 'ECO-ERR', 'Internacional', 'ProStar', 2022, 'problema', 
    'Unidad en taller mecánico por falla de motor, no disponible para instalación.'
FROM public.projects WHERE name = 'Instalación Flota Pesada 2024';

-- 7. Insertar Dispositivos ya registrados (Para probar la EDICIÓN)
-- Registramos las series para el Vehículo 2 (ECO-02)
INSERT INTO public.devices (vehicle_id, device_model_id, serial_number)
SELECT 
    v.id, 
    m.id, 
    CASE 
        WHEN m.model_name = 'Samsara VG54' THEN 'VG-888-222-111'
        WHEN m.model_name = 'Samsara CM32 (Cámara)' THEN 'CM-999-000-XXX'
        ELSE NULL -- El botón de pánico no lleva serie
    END
FROM public.vehicles v
CROSS JOIN public.device_models m
WHERE v.eco_number = 'ECO-02' 
AND m.model_name IN ('Samsara VG54', 'Samsara CM32 (Cámara)', 'Botón de Pánico');