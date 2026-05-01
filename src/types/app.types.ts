import { SupabaseClient } from '@supabase/supabase-js'
import { Database, TablesInsert } from './database.types'

// Solo tipos, nada de "const" o ejecuciones
export type Client = SupabaseClient<Database>

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

export type VehicleFromList = Tables<'vehicles'> & {
  technicians: { name: string } | null
}

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

export const PROJECT_STATUS_THEME: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  pendiente: {
    label: 'Pendiente',
    className: 'bg-surface-high text-muted-foreground',
  },
  activo: {
    label: 'Activo',
    className: 'bg-success/20 text-success',
  },
  pausado: {
    label: 'Pausado',
    className: 'bg-warning/20 text-warning',
  },
  finalizado: {
    label: 'Finalizado',
    className: 'bg-brand-gradient text-white border-none',
  },
}
