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
    pendiente: 'bg-surface-high text-muted-foreground hover:bg-surface-high',
    instalado:
      'bg-primary/10 text-primary border-primary/20 hover:bg-primary/10',
    problema: 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/10',
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          {project.name}
        </h1>
        <p>
          <span className="text-primary">{project.clients?.name}</span>
        </p>
        <p className="text-muted-foreground">
          Unidades registradas: {project.vehicles?.length || 0}
        </p>
      </div>

      <div>
        <h2 className="text-foreground mb-3 text-2xl font-bold tracking-tight">
          Progreso de Instalación
        </h2>
      </div>

      <div className="border-surface-border bg-surface-mid rounded-md border">
        <Table>
          <TableHeader className="bg-surface-mid">
            <TableRow className="border-surface-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                VIN
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Económico
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Placas
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Estatus
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Técnico
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
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
                <TableCell className="text-muted-foreground font-medium">
                  {vehicle.vin}
                </TableCell>
                <TableCell className="text-foreground font-medium">
                  {vehicle.eco_number || '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">
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
                <TableCell className="text-foreground font-medium">
                  {vehicle.technicians?.name || '---'}
                </TableCell>
                <TableCell className="text-muted-foreground">
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
