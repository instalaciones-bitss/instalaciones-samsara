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
import { cn } from '@/lib/utils'
import { VehicleFromList } from '@/types/app.types'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Obtener el proyecto primero para validar existencia
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

  if (error || !project) {
    notFound()
  }

  // 2. Cargar datos secundarios en paralelo (Ahorra tiempo de carga)
  const [devicesResponse, techniciansResponse] = await Promise.all([
    supabase
      .from('device_models')
      .select('id, model_name, has_serial')
      .in('id', project.default_device_model_ids || []),
    supabase
      .from('technicians')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true }),
  ])

  const projectDevices = devicesResponse.data || []
  const technicians = techniciansResponse.data || []

  const statusStyles: Record<string, string> = {
    pendiente: 'bg-surface-high text-muted-foreground border-transparent',
    instalado: 'bg-success/10 text-success border-success/20',
    problema: 'bg-danger/10 text-danger border-danger/20',
  }

  return (
    <div className="space-y-6 p-8">
      {' '}
      <header className="flex items-start justify-between">
        <div>
          <p className="text-primary text-sm font-semibold tracking-wider uppercase">
            {project.clients?.name}
          </p>
          <h1 className="text-foreground mt-1 text-4xl font-bold tracking-tight">
            {project.name}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Total:{' '}
            <span className="text-foreground font-medium">
              {project.vehicles?.length || 0}
            </span>{' '}
            unidades registradas
          </p>
        </div>
      </header>
      <div className="border-surface-border bg-surface-mid overflow-hidden rounded-xl border">
        <Table>
          <TableHeader className="bg-surface-high/50">
            <TableRow className="border-surface-border hover:bg-transparent">
              {[
                'VIN',
                'Económico',
                'Placas',
                'Estatus',
                'Técnico',
                'Fecha',
              ].map((h) => (
                <TableHead
                  key={h}
                  className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
                >
                  {h}
                </TableHead>
              ))}
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.vehicles?.map((vehicle) => {
              const { technicians: _unused, ...vehicleData } = vehicle

              return (
                <TableRow
                  key={vehicle.id}
                  className="border-surface-border hover:bg-surface-high/30 transition-colors"
                >
                  <TableCell className="text-foreground font-mono text-sm">
                    {vehicle.vin}
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    {vehicle.eco_number || '—'}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {vehicle.plate || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-semibold capitalize',
                        statusStyles[vehicle.status ?? 'pendiente']
                      )}
                    >
                      {vehicle.status ?? 'pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {vehicle.technicians?.name || '---'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {vehicle.installed_at
                      ? format(new Date(vehicle.installed_at), 'dd MMM yyyy', {
                          locale: es,
                        })
                      : '---'}
                  </TableCell>
                  <TableCell className="text-right">
                    <VehicleActions
                      vehicle={vehicleData as VehicleFromList}
                      projectId={project.id}
                      projectDevices={projectDevices}
                      technicians={technicians}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
