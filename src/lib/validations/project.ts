import { z } from 'zod'
import { ProjectStatus } from '@/types/app.types'

// 1. Sincronización de ENUM: Asegura que el array coincida con el tipo de la DB.
export const PROJECT_STATUS_VALUES: [ProjectStatus, ...ProjectStatus[]] = [
  'pendiente',
  'activo',
  'pausado',
  'finalizado',
]

// Convierte "" en undefined y acepta que el resultado sea opcional.
const optionalString = z.preprocess(
  (val) => (val === '' || val === null ? undefined : val),
  z.string().trim().optional()
)

export const projectSchema = z.object({
  // NAME: Limpia espacios antes de validar que tenga al menos 3 caracteres.
  name: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().min(3, 'El nombre debe tener al menos 3 caracteres')
  ),

  // PM_ID: En v4, z.uuid() es validador de primer nivel (ya no requiere .string()).
  pm_id: z.uuid({ message: 'Selecciona un PM válido' }),

  // CLIENT_ID: Igual que pm_id, validación directa de UUID.
  client_id: z.uuid({ message: 'Selecciona un cliente válido' }),

  // TOTAL_UNITS: Coerción automática de texto a número entero (mínimo 1).
  total_units_expected: z.coerce
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 unidad'),

  // CONTACT_NAME: Usa el helper para ser opcional o ignorar si viene vacío.
  contact_name: optionalString,

  // CONTACT_PHONE: Valida exactamente 10 dígitos si el usuario escribe algo.
  contact_phone: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z
      .string()
      .regex(/^\d{10}$/, 'El teléfono requiere 10 números')
      .optional()
  ),

  // DRIVE_LINK: En v4 usamos z.url() directamente tras limpiar espacios.
  drive_project_link: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.url('Ingresa un link de Drive válido').optional()
  ),

  // STATUS: Validación estricta basada en el array sincronizado de la DB.
  status: z.enum(PROJECT_STATUS_VALUES).default('pendiente'),

  // DEVICE_MODELS: Array de UUIDs que siempre devuelve [] si no hay selección.
  default_device_model_ids: z
    .array(z.uuid())
    .min(1, 'Debes seleccionar al menos un modelo de dispositivo'),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
