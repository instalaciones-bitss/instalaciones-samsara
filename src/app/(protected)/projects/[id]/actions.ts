'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateVehicleStatus(
  vehicleId: string,
  status: string,
  projectId: string,
  // Añadimos estos dos parámetros opcionales
  technicianId?: string,
  installedAt?: Date
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('vehicles')
    .update({
      status,
      technician_id: technicianId,
      installed_at: installedAt?.toISOString(), // Convertimos la fecha a formato ISO para Postgres
    })
    .eq('id', vehicleId)

  if (error) {
    throw new Error(error.message)
  }

  // Refrescamos la página para que el Badge cambie y la oficina vea el avance
  revalidatePath(`/projects/${projectId}`)
}
