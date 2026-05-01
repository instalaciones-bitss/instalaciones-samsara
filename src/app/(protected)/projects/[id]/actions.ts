'use server'

import { getAuthSession } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database.types'

// Usamos los tipos de inserción de la tabla devices para mayor seguridad
type DeviceInsert = Database['public']['Tables']['devices']['Insert']

export async function updateVehicleStatus(
  vehicleId: string,
  status: 'pendiente' | 'instalado' | 'problema',
  projectId: string,
  deviceSerialsByModelId: Record<string, string>,
  technicianId?: string,
  installedAt?: Date
) {
  try {
    // 1. SEGURIDAD: Verificar sesión antes de operar
    const { supabase } = await getAuthSession()

    // 2. ACTUALIZAR VEHÍCULO
    const { error: vehicleError } = await supabase
      .from('vehicles')
      .update({
        status,
        technician_id: technicianId || null,
        installed_at: installedAt?.toISOString() || null,
      })
      .eq('id', vehicleId)

    if (vehicleError) return { success: false, error: vehicleError.message }

    // 3. ACTUALIZAR DISPOSITIVOS (UPSERT)
    const devicesToUpsert: DeviceInsert[] = Object.entries(
      deviceSerialsByModelId
    )
      .filter(([_, serial]) => serial.trim() !== '')
      .map(([modelId, serial]) => ({
        vehicle_id: vehicleId,
        device_model_id: modelId,
        serial_number: serial.trim(),
      }))

    if (devicesToUpsert.length > 0) {
      const { error: devicesError } = await supabase
        .from('devices')
        .upsert(devicesToUpsert, {
          onConflict: 'vehicle_id,device_model_id',
        })

      if (devicesError) return { success: false, error: devicesError.message }
    }

    // 4. REVALIDAR CACHÉ
    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (e: any) {
    console.error('Error en updateVehicleStatus:', e)
    return { success: false, error: e.message || 'Error inesperado' }
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

    // Retornamos SIEMPRE el mismo formato de objeto
    return { success: true, data: data || [] }
  } catch (e) {
    console.error('Error en getVehicleInstallationData:', e)
    return { success: false, error: 'Error inesperado en el servidor' }
  }
}
