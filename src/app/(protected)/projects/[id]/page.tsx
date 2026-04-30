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
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select(
      /* sql */
      `
        *,
        clients ( name ),
        vehicles (
          id, vin, plate, eco_number, status, installed_at, technician_id,
          technicians ( name )
        )
      `
    )
    .eq('id', id)
    .single()

  const { data: projectDevices } = await supabase
    .from('device_models')
    .select('id, model_name, has_serial')
    .in('id', project?.default_device_model_ids || [])

  const { data: technicians } = await supabase
    .from('technicians')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error || !project) {
    notFound()
  }

  const statusStyles: Record<string, string> = {
    pendiente: 'bg-surface-high text-zinc-400 hover:bg-surface-high',
    instalado:
      'bg-brand-green/10 text-brand-green border-brand-green/20 hover:bg-brand-green/10',
    problema: 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/10',
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {project.name}
        </h1>
        <p className="text-zinc-400">
          Cliente:{' '}
          <span className="text-brand-green">{project.clients?.name}</span>
        </p>
        <p className="text-zinc-400">
          Unidades registradas: {project.vehicles?.length || 0}
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-white">
          Progreso de Instalación
        </h2>
      </div>

      <div className="border-surface-border bg-surface-mid rounded-md border">
        <Table>
          <TableHeader className="bg-surface-mid">
            <TableRow className="border-surface-border hover:bg-transparent">
              <TableHead className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                VIN
              </TableHead>
              <TableHead className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Económico
              </TableHead>
              <TableHead className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Placas
              </TableHead>
              <TableHead className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Estatus
              </TableHead>
              <TableHead className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Técnico
              </TableHead>
              <TableHead className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Fecha
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.vehicles?.map((vehicle) => (
              <TableRow
                key={vehicle.id}
                className="border-surface-border hover:bg-surface-high/30"
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
                <TableCell className="font-medium text-white">
                  {vehicle.technicians?.name || '---'}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {vehicle.installed_at
                    ? format(new Date(vehicle.installed_at), 'dd/MM/yyyy', {
                        locale: es,
                      })
                    : '---'}
                </TableCell>
                <TableCell>
                  <VehicleActions
                    vehicle={vehicle as any}
                    projectId={project.id}
                    projectDevices={projectDevices as any}
                    technicians={technicians as any}
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
