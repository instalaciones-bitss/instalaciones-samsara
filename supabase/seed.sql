-- 1. CLIENTES (Fuera del bloque para asegurar que entren)
INSERT INTO public.clients (name, samsara_user, drive_folder_link)
VALUES 
('Bimbo Logística MX', 'bimbo_admin_2026', 'https://drive.google.com/drive/folders/bimbo2026'),
('Femsa Distribución', 'femsa_ops', 'https://drive.google.com/drive/folders/femsa2026'),
('DHL Express México', 'dhl_samsara_mgr', 'https://drive.google.com/drive/folders/dhl2026')
ON CONFLICT DO NOTHING;

-- 2. MODELOS DE DISPOSITIVOS
INSERT INTO public.device_models (model_name, has_serial)
VALUES 
('Samsara VG55 (5G)', true),
('Samsara AG52 (Solar)', true),
('Camera CM32 AI', true),
('Sensor Termo Pro', false)
ON CONFLICT (model_name) DO NOTHING;

-- 3. TÉCNICOS
INSERT INTO public.technicians (name, phone, city, company_name, is_certified, is_active)
VALUES 
('Ricardo Alarcón', '5511223344', 'CDMX', 'Instala-Red', true, true),
('Sofía Méndez', '8122334455', 'Monterrey', 'Freelance Tech', true, true),
('Marcos Uribe', '3399887766', 'Guadalajara', 'Bitss Partner', false, true)
ON CONFLICT DO NOTHING;

-- 4. DATOS OPERATIVOS (Proyectos, Vehículos, Dispositivos)
DO $$
DECLARE
    v_pm_id uuid := (SELECT id FROM public.profiles LIMIT 1);
    v_client_id uuid := (SELECT id FROM public.clients LIMIT 1);
    v_model_vg55 uuid := (SELECT id FROM public.device_models WHERE model_name = 'Samsara VG55 (5G)');
    v_model_cam uuid := (SELECT id FROM public.device_models WHERE model_name = 'Camera CM32 AI');
    v_tech_id uuid := (SELECT id FROM public.technicians LIMIT 1);
    v_project_id uuid;
    v_vehicle_id uuid;
BEGIN
    -- Si después del Paso 1 v_pm_id sigue siendo NULL, ahora sí lanzaremos un ERROR real
    IF v_pm_id IS NULL THEN
        RAISE EXCEPTION 'La tabla public.profiles está vacía. Ejecuta primero el INSERT desde auth.users.';
    END IF;

    -- Insertar Proyecto
    INSERT INTO public.projects (name, client_id, pm_id, total_units_expected, status, default_device_model_ids)
    VALUES ('Renovación Flota 2026', v_client_id, v_pm_id, 50, 'activo', ARRAY[v_model_vg55, v_model_cam])
    RETURNING id INTO v_project_id;

    -- Insertar Vehículo
    INSERT INTO public.vehicles (project_id, technician_id, vin, plate, eco_number, status, installed_at)
    VALUES (v_project_id, v_tech_id, 'VIN-ABC-123-2026', 'MX-2026', 'ECO-101', 'instalado', now())
    RETURNING id INTO v_vehicle_id;

    -- Insertar Dispositivos
    INSERT INTO public.devices (vehicle_id, device_model_id, serial_number)
    VALUES 
    (v_vehicle_id, v_model_vg55, 'SN-GPS-999'),
    (v_vehicle_id, v_model_cam, 'SN-CAM-888');

END $$;