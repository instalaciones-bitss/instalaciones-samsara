-- ==========================================
-- SEED DATA CORREGIDO - MAYO 2026
-- ==========================================

-- 1. CLIENTES
INSERT INTO public.clients (name, samsara_user, drive_folder_link)
VALUES 
('Bimbo Logística', 'bimbo_admin_2026', 'https://drive.google.com/bimbo'),
('DHL Express MX', 'dhl_ops_mex', 'https://drive.google.com/dhl'),
('Femsa Distribución', 'femsa_dist_2026', 'https://drive.google.com/femsa')
ON CONFLICT DO NOTHING;

-- 2. MODELOS DE DISPOSITIVOS
INSERT INTO public.device_models (model_name, has_serial)
VALUES 
('Samsara VG55 (5G)', true),
('Samsara AG52 (Solar)', true),
('Camera CM32 AI', true),
('Sensor Puerta Pro', false)
ON CONFLICT (model_name) DO NOTHING;

-- 3. TÉCNICOS
INSERT INTO public.technicians (name, phone, city, company_name, is_certified, is_active)
VALUES 
('Carlos Mendoza', '5511223344', 'CDMX', 'Instala-Tech', true, true),
('Ana Rodríguez', '8122334455', 'Monterrey', 'SafeConnect', true, true),
('Luis Gámez', '3399887766', 'Guadalajara', 'Freelance Tech', false, true)
ON CONFLICT DO NOTHING;

-- 4. BLOQUE DINÁMICO
DO $$
DECLARE
    v_pm_id uuid := (SELECT id FROM public.profiles LIMIT 1);
    v_client_bimbo uuid := (SELECT id FROM public.clients WHERE name = 'Bimbo Logística');
    v_client_dhl uuid := (SELECT id FROM public.clients WHERE name = 'DHL Express MX');
    v_client_femsa uuid := (SELECT id FROM public.clients WHERE name = 'Femsa Distribución');
    v_model_vg55 uuid := (SELECT id FROM public.device_models WHERE model_name = 'Samsara VG55 (5G)');
    v_model_cam uuid := (SELECT id FROM public.device_models WHERE model_name = 'Camera CM32 AI');
    v_tech_carlos uuid := (SELECT id FROM public.technicians WHERE name = 'Carlos Mendoza');
    v_proj_1 uuid;
    v_proj_2 uuid;
    v_proj_3 uuid;
    v_veh_1 uuid;
BEGIN
    IF v_pm_id IS NULL THEN
        RAISE EXCEPTION '❌ Error: La tabla public.profiles está vacía.';
    END IF;

    -- PROYECTO 1: Bimbo (Activo)
    INSERT INTO public.projects (name, client_id, pm_id, total_units_expected, contact_name, status, default_device_model_ids, created_at)
    VALUES ('Renovación Bimbo Q2', v_client_bimbo, v_pm_id, 40, 'Ing. Roberto Silva', 'activo', ARRAY[v_model_vg55, v_model_cam], '2026-04-20 10:00:00+00')
    RETURNING id INTO v_proj_1;

    -- VEHÍCULO (Instalado)
    INSERT INTO public.vehicles (project_id, technician_id, vin, plate, eco_number, brand, model, year, city, status, installed_at)
    VALUES (v_proj_1, v_tech_carlos, 'VIN123456789BIMBO', 'BIM-001', 'E-101', 'Freightliner', 'Cascadia', 2026, 'CDMX', 'instalado', '2026-05-01 12:00:00+00')
    RETURNING id INTO v_veh_1;

    -- DISPOSITIVOS (Se eliminó el campo installed_at que no existe en esta tabla)
    INSERT INTO public.devices (vehicle_id, device_model_id, serial_number)
    VALUES 
    (v_veh_1, v_model_vg55, 'SN-VG55-001'),
    (v_veh_1, v_model_cam, 'SN-CAM-AI-99');

    -- PROYECTO 2: DHL (Pendiente)
    INSERT INTO public.projects (name, client_id, pm_id, total_units_expected, contact_name, status, default_device_model_ids, created_at)
    VALUES ('Piloto DHL Camionetas', v_client_dhl, v_pm_id, 15, 'Lic. Martha Trejo', 'pendiente', ARRAY[v_model_vg55], '2026-05-05 09:00:00+00')
    RETURNING id INTO v_proj_2;

    -- PROYECTO 3: Femsa (Pausado)
    INSERT INTO public.projects (name, client_id, pm_id, total_units_expected, contact_name, status, default_device_model_ids, created_at)
    VALUES ('Mantenimiento Femsa Norte', v_client_femsa, v_pm_id, 100, 'Arq. Juan Pablo', 'pausado', ARRAY[v_model_vg55], '2026-04-10 14:00:00+00')
    RETURNING id INTO v_proj_3;

    RAISE NOTICE '✅ Seed completado exitosamente.';
END $$;