import { QueryData, SupabaseClient } from '@supabase/supabase-js'
import { Database, TablesInsert } from './database.types'

// 1. Definimos el tipo del cliente pero vinculado a TU base de datos
// Esto le dice a TS: "Este cliente conoce mis tablas"
type Client = SupabaseClient<Database>

// 2. Creamos el mock usando el tipo real 'Client'
// Ahora TS sí sabe qué hay dentro de .from('vehicles')
const supabase = {} as Client

// 3. Definimos la consulta.
// Importante: Debe ser idéntica a la que usas en page.tsx
const vehicleQuery = supabase.from('vehicles').select(`
    id, vin, plate, eco_number, status, installed_at, technician_id,
    technicians ( name )
  `)

// 4. ¡Magia! QueryData ahora sí puede leer las columnas
export type VehicleFromList = QueryData<typeof vehicleQuery>[number]

// Otros tipos que ya teníamos (estos no fallan)
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TechnicianBasic = Pick<Tables<'technicians'>, 'id' | 'name'>
export type DeviceModelBasic = Pick<
  Tables<'device_models'>,
  'id' | 'model_name' | 'has_serial'
>

// Agregamos este helper para Vistas si no lo tienes
export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row']

// --- NUEVO HELPER PARA ENUMS ---
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

export type ProjectStatus = Enums<'project_status'>
export type VehicleStatus = Enums<'vehicle_status'>

// El contrato para los proyectos del Dashboard
export type ProjectSummary = Views<'project_details'>

/**
 * Contrato estándar para Server Actions que manejan formularios.
 * Se usa con el hook useActionState en el cliente.
 */
export type ActionResponse = {
  message?: string // Para errores globales (ej: "Credenciales inválidas")
  errors?: Record<string, string[]> // Para errores específicos de campos (Zod)
  success?: boolean // Opcional: Para indicar éxito sin redirección
} | null

// Tipo para insertar un proyecto (usado en la Action)
export type ProjectInsert = TablesInsert<'projects'>
