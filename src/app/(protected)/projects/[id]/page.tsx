import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { VehicleActions } from './VehicleActions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // 1. Obtenemos el ID de la URL
  const { id } = await params
  const supabase = await createClient()

  // 2. Traemos la información del proyecto
  const { data: project, error } = await supabase
    .from('projects')
    .select(
      /* sql */
      `
        *,
        clients (
          name
        ),
        vehicles (
          id,
          vin,
          plate,
          eco_number,
          status,
          installed_at,
          technician_id,
          technicians (
            name
          )
        )
      `
    )
    .eq('id', id)
    .single()

  // 2. Justo debajo de obtener el 'project', obtenemos los nombres de los modelos:
  const { data: models } = await supabase
    .from('device_models')
    .select('model_name')
    .in('id', project?.default_device_model_ids || [])

  const deviceModelNames = models?.map((m) => m.model_name) || []

  const { data: technicians } = await supabase
    .from('technicians')
    .select('id, name')
    .eq('is_active', true) // Solo traemos a los que están activos
    .order('name', { ascending: true }) // Los ordenamos alfabéticamente

  // 3. Si no existe el proyecto, mandamos a una página 404
  if (error || !project) {
    notFound()
  }

  // Definimos los estilos por estatus
  const statusStyles: Record<string, string> = {
    pendiente: 'bg-zinc-800 text-zinc-400 hover:bg-zinc-800',
    instalado:
      'bg-brand-green/10 text-brand-green border-brand-green/20 hover:bg-brand-green/10',
    problema:
      'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/10',
  }

  return (
    <div className="space-y-6 p-6">
      {/* Encabezado del Proyecto */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {project.name}
        </h1>
        <p className="text-zinc-400">
          Cliente:{' '}
          <span className="text-brand-green">{project.clients?.name}</span>
        </p>
        <p className="text-zinc-500">
          Unidades registradas: {project.vehicles?.length || 0}
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-white">
          Progreso de Instalación
        </h2>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900">
        <Table>
          <TableHeader className="bg-zinc-900">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="w-[200px] text-zinc-400">VIN</TableHead>
              <TableHead className="text-zinc-400">Económico</TableHead>
              <TableHead className="text-zinc-400">Placas</TableHead>
              <TableHead className="text-zinc-400">Estatus</TableHead>
              <TableHead className="text-zinc-400">Técnico</TableHead>
              <TableHead className="text-zinc-400">Fecha</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.vehicles?.map((vehicle) => (
              <TableRow
                key={vehicle.id}
                className="border-zinc-800 hover:bg-zinc-800/30"
              >
                <TableCell className="font-medium text-zinc-400">
                  {vehicle.vin}
                </TableCell>
                <TableCell className="font-medium text-white">
                  {vehicle.eco_number || '—'}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {vehicle.plate || '—'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`capitalize ${statusStyles[vehicle.status ?? 'pendiente']}`}
                  >
                    {vehicle.status ?? 'pendiente'}
                  </Badge>
                </TableCell>
                {/* Celda del Técnico */}
                <TableCell className="font-medium text-white">
                  {vehicle.technicians?.name || '---'}
                </TableCell>
                {/* Celda de la Fecha */}
                <TableCell className="text-zinc-400">
                  {vehicle.installed_at
                    ? format(new Date(vehicle.installed_at), 'dd/MM/yyyy', {
                        locale: es,
                      })
                    : '---'}
                </TableCell>
                <TableCell>
                  <VehicleActions
                    vehicle={vehicle}
                    projectId={project.id}
                    deviceModelNames={deviceModelNames}
                    technicians={technicians || []} // Pasamos la lista aquí
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
