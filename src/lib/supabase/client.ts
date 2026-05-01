import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'
import { getSupabaseEnv } from './config' // Importamos tu validador

export const createClient = () => {
  const { url, anonKey } = getSupabaseEnv() // Usamos la lógica centralizada

  return createBrowserClient<Database>(url, anonKey)
}
