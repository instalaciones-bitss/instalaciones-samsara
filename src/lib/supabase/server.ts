import { createServerClient } from '@supabase/ssr' // 1. Motor de Supabase para Servidor
import { cookies } from 'next/headers' // 2. Herramienta de Next.js para manejar cookies
import { Database } from '@/types/database.types'
import { getSupabaseEnv } from './config'

export const createClient = async () => {
  // 3. Función asíncrona para crear el cliente
  const cookieStore = await cookies() // 4. Obtenemos el acceso a las cookies del navegador
  const { url, anonKey } = getSupabaseEnv()

  return createServerClient<Database>(
    // 5. Configuramos el cliente con los permisos necesarios
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          // 6. Cómo leer las cookies
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // 7. Cómo guardar las cookies
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Este error ocurre si se intenta guardar desde un Server Component, se puede ignorar
          }
        },
      },
    }
  )
}
