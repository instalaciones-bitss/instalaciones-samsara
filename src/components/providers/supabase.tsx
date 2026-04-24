'use client'

import { createContext, useContext, useState } from 'react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Definimos qué información va a "flotar" por la app
type SupabaseContext = {
  supabase: SupabaseClient<Database>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Inicializamos el cliente una sola vez
  const [supabase] = useState(() => createBrowserClient())

  return <Context.Provider value={{ supabase }}>{children}</Context.Provider>
}

// Este es el "gancho" (hook) que usaremos en cualquier parte para llamar a Supabase
export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase debe usarse dentro de un SupabaseProvider')
  }
  return context
}
