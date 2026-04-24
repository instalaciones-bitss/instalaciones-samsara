DO $$ 
DECLARE 
  -- ==========================================
  -- SOLO CAMBIA ESTOS DOS DATOS:
  target_email TEXT := 'correo_del_pm@bitss.com.mx'; 
  target_name  TEXT := 'Nombre Apellido';
  -- ==========================================
  
  found_id UUID;
BEGIN
  -- 1. Buscamos el ID interno que Supabase le asignó al correo
  SELECT id INTO found_id FROM auth.users WHERE email = target_email;

  IF found_id IS NOT NULL THEN
    -- 2. Inyectamos el nombre en los metadatos de Auth
    UPDATE auth.users 
    SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
                            || jsonb_build_object('full_name', target_name)
    WHERE id = found_id;

    -- 3. Creamos o actualizamos su perfil en nuestra tabla pública
    INSERT INTO public.profiles (id, full_name)
    VALUES (found_id, target_name)
    ON CONFLICT (id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        updated_at = now();

    RAISE LOG 'Perfil de % sincronizado (ID: %)', target_email, found_id;
  ELSE
    RAISE EXCEPTION 'Error: El correo % no existe en la base de datos de Auth.', target_email;
  END IF;
END $$;