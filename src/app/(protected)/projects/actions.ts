'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { projectSchema } from '@/lib/validations/project'
import { ActionResponse, Tables } from '@/types/app.types'
import { z } from 'zod'

// Definimos ProjectInputs basándonos en la tabla 'projects'
export type ProjectInputs = Partial<
  Omit<Tables<'projects'>, 'id' | 'created_at' | 'updated_at'>
> & {
  // Sobrescribimos o agregamos campos que no coincidan exacto con la DB
  // (Por ejemplo, si un campo llega como string pero en DB es number)
  total_units_expected?: string | number
}

export async function createProject(
  _prevState: ActionResponse<ProjectInputs>,
  formData: FormData
): Promise<ActionResponse<ProjectInputs>> {
  const supabase = await createClient()

  // 1. Extraemos los datos básicos
  const rawData = Object.fromEntries(formData.entries())

  // 2. CORRECCIÓN PARA ARRAYS:
  // Object.fromEntries solo toma el último valor de un checkbox.
  // Forzamos la extracción de todos los IDs seleccionados.
  const validatedData: ProjectInputs = {
    // 1. Esparcimos los datos básicos
    ...rawData,
    // 2. Forzamos a que TS entienda que esto es un array de strings.
    // Usamos 'as string[]' porque sabemos que no hay archivos involucrados.
    default_device_model_ids: formData
      .getAll('default_device_model_ids')
      .filter((item): item is string => typeof item === 'string'),
  }

  // 3. Validación con el Schema que pulimos
  const validatedFields = projectSchema.safeParse(validatedData)

  // 4. Si falla la validación, retornamos los errores por campo (igual que en Login)
  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      inputs: validatedData,
    }
  }

  // 5. Extraemos los datos limpios y tipados por Zod
  const data = validatedFields.data

  try {
    // 6. Ejecutamos la inserción en la tabla 'projects'
    const { error } = await supabase.from('projects').insert([
      {
        name: data.name,
        client_id: data.client_id,
        pm_id: data.pm_id,
        total_units_expected: data.total_units_expected,
        contact_name: data.contact_name,
        contact_phone: data.contact_phone,
        drive_project_link: data.drive_project_link,
        status: data.status,
        default_device_model_ids: data.default_device_model_ids,
      },
    ])

    // 7. Manejo de error de base de datos (PostgreSQL/Supabase)
    if (error) {
      console.error('Database Error:', error.message)
      return {
        message: 'No se pudo crear el proyecto en la base de datos.',
      }
    }
  } catch (e) {
    // 8. Error inesperado (igual que en tu login/actions.ts)
    return {
      message: 'Ocurrió un error inesperado. Intenta de nuevo.',
    }
  }

  // 9. ÉXITO: Acciones post-guardado
  revalidatePath('/') // Borra la caché del Dashboard para mostrar el nuevo proyecto
  redirect('/') // Redirige al inicio (o a la lista de proyectos)
}
