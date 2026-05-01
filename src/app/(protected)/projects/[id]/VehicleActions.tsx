'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  VehicleFromList,
  TechnicianBasic,
  DeviceModelBasic,
} from '@/types/app.types'
// Componentes UI
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Actions
import { getVehicleInstallationData, updateVehicleStatus } from './actions'
import { cn } from '@/lib/utils'

interface VehicleActionsProps {
  vehicle: VehicleFromList
  projectId: string
  projectDevices: DeviceModelBasic[]
  technicians: TechnicianBasic[]
}

export function VehicleActions({
  vehicle,
  projectId,
  projectDevices,
  technicians,
}: VehicleActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [selectedTech, setSelectedTech] = useState<string>(
    vehicle.technician_id ?? ''
  )
  const [date, setDate] = useState<Date | undefined>(
    vehicle.installed_at ? new Date(vehicle.installed_at) : new Date()
  )
  const [deviceSerialsByModelId, setDeviceSerialsByModelId] = useState<
    Record<string, string>
  >({})
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handlePrepareInstallation = async () => {
    setDeviceSerialsByModelId({})

    try {
      const result = await getVehicleInstallationData(vehicle.id)

      // 2. Manejo de la respuesta semántica
      if (!result.success) {
        alert(result.error)
        return
      }

      // 3. Si llegamos aquí, TS sabe que result.data existe
      const initialSerials: Record<string, string> = {}
      projectDevices.forEach((m) => {
        initialSerials[m.id] = ''
      })

      result.data?.forEach((d) => {
        if (d.device_model_id) {
          initialSerials[d.device_model_id] = d.serial_number ?? ''
        }
      })

      setDeviceSerialsByModelId(initialSerials)
      setSelectedTech(vehicle.technician_id ?? '')
      setDate(
        vehicle.installed_at ? new Date(vehicle.installed_at) : new Date()
      )
      setIsDialogOpen(true)
    } catch (e) {
      // 4. Red de seguridad para errores de red del cliente
      console.error('Error crítico:', e)
      alert('Error de conexión con el servidor')
    }
  }

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        await updateVehicleStatus(
          vehicle.id,
          'instalado',
          projectId,
          deviceSerialsByModelId,
          selectedTech,
          date
        )
        setIsDialogOpen(false)
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error desconocido')
      }
    })
  }

  const techIsMissing = !selectedTech
  const isValid =
    !!selectedTech &&
    !!date &&
    projectDevices.every(
      (m) => !m.has_serial || deviceSerialsByModelId[m.id]?.trim()
    )

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="border-surface-border h-8 w-8 p-0">
            <MoreHorizontal className="text-muted-foreground h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-surface-border bg-surface-mid text-zinc-200"
        >
          <DropdownMenuItem
            onSelect={handlePrepareInstallation}
            className="focus:bg-surface-high focus:text-success"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {vehicle.status === 'instalado'
              ? 'Editar Instalación'
              : 'Gestionar Instalación'}
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-surface-high focus:text-danger text-danger">
            <AlertCircle className="mr-2 h-4 w-4" />
            Reportar Problema
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-surface-border bg-surface-low text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>
              {vehicle.status === 'instalado' ? 'Editar' : 'Confirmar'}{' '}
              Instalación
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Unidad:{' '}
              <span className="text-success font-mono">
                {vehicle.eco_number || vehicle.vin}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="technician_id"
                  className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
                >
                  Técnico Responsable
                </label>
                {techIsMissing && (
                  <span className="text-danger animate-pulse text-xs font-bold">
                    REQUERIDO
                  </span>
                )}
              </div>
              <Select value={selectedTech} onValueChange={setSelectedTech}>
                <SelectTrigger
                  aria-invalid={!!techIsMissing}
                  className="h-9"
                  id="technician_id"
                >
                  <SelectValue placeholder="Seleccionar técnico..." />
                </SelectTrigger>
                <SelectContent className="border-surface-border bg-surface-mid">
                  {technicians.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="date-picker"
                className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
              >
                Fecha de Instalación
              </label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-surface-border bg-surface-mid w-full justify-start text-zinc-200"
                  >
                    <CalendarIcon className="text-success mr-2 h-4 w-4" />
                    {date ? (
                      format(date, 'PPP', { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="border-surface-border bg-surface-low w-auto p-0"
                  align="start"
                >
                  <Calendar
                    id="date-picker"
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d)
                      setIsCalendarOpen(false)
                    }}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-3">
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Dispositivos
              </span>
              <div className="grid gap-2">
                {projectDevices.map((model) => {
                  const isMissing =
                    model.has_serial &&
                    !deviceSerialsByModelId[model.id]?.trim()

                  return (
                    <div
                      key={model.id}
                      className="border-surface-border bg-surface-mid/50 rounded-md border p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={cn(
                            'text-xs font-medium',
                            isMissing ? 'text-danger' : 'text-muted-foreground'
                          )}
                        >
                          {model.model_name}
                        </span>
                        {!model.has_serial ? (
                          <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-[11px] font-bold">
                            INCLUIDO
                          </span>
                        ) : (
                          isMissing && (
                            <span className="text-danger animate-pulse text-xs font-bold">
                              REQUERIDO
                            </span>
                          )
                        )}
                      </div>

                      {model.has_serial && (
                        <Input
                          id={model.id}
                          name={model.id}
                          placeholder="S/N"
                          aria-invalid={!!isMissing}
                          className="h-8 font-mono text-xs"
                          value={deviceSerialsByModelId[model.id] || ''}
                          onChange={(e) =>
                            setDeviceSerialsByModelId((prev) => ({
                              ...prev,
                              [model.id]: e.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending || !isValid}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 font-bold"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
