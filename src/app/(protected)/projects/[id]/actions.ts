'use server'

import { getAuthSession } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { TablesInsert } from '@/types/database.types'
import { z } from 'zod'

type DeviceInsert = TablesInsert<'devices'>

export type InstallationInputs = {
  technician_id: string
  installed_at: string
  [key: string]: string
}

export type ActionResponse = {
  errors?: Record<string, string[]>
  message?: string
  inputs?: InstallationInputs
  success?: boolean
}

const InstallationSchema = z.object({
  technician_id: z.string().min(1, 'Debes seleccionar un técnico'),
  installed_at: z.string().min(1, 'La fecha es requerida'),
})

export async function updateVehicleStatus(
  vehicleId: string,
  projectId: string,
  deviceModelIds: string[],
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = Object.fromEntries(formData.entries()) as InstallationInputs

  // 1. Zod Validation
  const validatedFields = InstallationSchema.safeParse(rawData)
  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      inputs: rawData,
    }
  }

  // 2. Dynamic Serial Validation
  const missingSerials = deviceModelIds.filter((id) => !rawData[id]?.trim())
  if (missingSerials.length > 0) {
    // We map these to specific field errors so the UI can show "REQUERIDO"
    const errors: Record<string, string[]> = {}
    missingSerials.forEach((id) => {
      errors[id] = ['REQUERIDO']
    })

    return {
      errors,
      inputs: rawData,
    }
  }

  try {
    const { supabase } = await getAuthSession()
    if (!supabase) throw new Error('Sesión no encontrada')

    const { error: vehicleError } = await supabase
      .from('vehicles')
      .update({
        status: 'instalado',
        technician_id: rawData.technician_id,
        installed_at: rawData.installed_at,
      })
      .eq('id', vehicleId)

    if (vehicleError) return { message: vehicleError.message, inputs: rawData }

    const devicesToUpsert: DeviceInsert[] = deviceModelIds.map((modelId) => ({
      vehicle_id: vehicleId,
      device_model_id: modelId,
      serial_number: rawData[modelId].trim(),
    }))

    if (devicesToUpsert.length > 0) {
      const { error: devicesError } = await supabase
        .from('devices')
        .upsert(devicesToUpsert, { onConflict: 'vehicle_id,device_model_id' })

      if (devicesError)
        return { message: devicesError.message, inputs: rawData }
    }

    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (e: any) {
    return { message: e.message || 'Error inesperado', inputs: rawData }
  }
}

export async function getVehicleInstallationData(vehicleId: string) {
  try {
    const { supabase } = await getAuthSession()
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('vehicle_id', vehicleId)
    if (error) return { success: false, error: error.message }
    return { success: true, data: data || [] }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function importVehicles(
  projectId: string,
  vehicles: TablesInsert<'vehicles'>[]
) {
  try {
    const { supabase } = await getAuthSession()

    // Add the project_id to every row (safety measure)
    const dataToInsert = vehicles.map((v) => ({ ...v, project_id: projectId }))

    const { data, error } = await supabase
      .from('vehicles')
      .upsert(dataToInsert, {
        onConflict: 'vin,project_id', // Prevents the "disaster" of duplicates
        ignoreDuplicates: true,
      })

    if (error) throw error

    revalidatePath(`/projects/${projectId}`)
    return { success: true, count: vehicles.length }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
