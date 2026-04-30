'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database.types'

// Usamos los tipos de inserción de la tabla devices para mayor seguridad
type DeviceInsert = Database['public']['Tables']['devices']['Insert']

export async function updateVehicleStatus(
  vehicleId: string,
  status: 'pendiente' | 'instalado' | 'problema', // Tipado estricto según tu SQL
  projectId: string,
  deviceSerialsByModelId: Record<string, string>,
  technicianId?: string,
  installedAt?: Date
) {
  const supabase = await createClient()

  // 1. Actualizar el vehículo
  const { error: vehicleError } = await supabase
    .from('vehicles')
    .update({
      status,
      technician_id: technicianId || null,
      installed_at: installedAt?.toISOString() || null,
    })
    .eq('id', vehicleId)

  if (vehicleError)
    throw new Error(`Error en vehículo: ${vehicleError.message}`)

  // 2. Preparar el UPSERT de dispositivos
  const devicesToUpsert: DeviceInsert[] = Object.entries(deviceSerialsByModelId)
    .filter(([_, serial]) => serial.trim() !== '') // Solo enviamos si hay texto
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

    if (devicesError)
      throw new Error(`Error en series: ${devicesError.message}`)
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function getVehicleInstallationData(vehicleId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('vehicle_id', vehicleId)

  if (error) throw new Error(error.message)
  return data
}
