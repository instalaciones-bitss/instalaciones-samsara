'use client'

import { useState, useActionState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  VehicleWithTechnician,
  TechnicianBasic,
  DeviceModelBasic,
} from '@/types/app.types'
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
import { cn } from '@/lib/utils'

// Actions
import { getVehicleInstallationData, updateVehicleStatus } from './actions'

interface VehicleActionsProps {
  vehicle: VehicleWithTechnician
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Local state for initial fetch and UI bridge
  const [initialSerials, setInitialSerials] = useState<Record<string, string>>(
    {}
  )
  const [date, setDate] = useState<Date | undefined>(
    vehicle.installed_at ? new Date(vehicle.installed_at) : new Date()
  )

  // BITSS Hook
  const [state, formAction, isPending] = useActionState(
    updateVehicleStatus.bind(
      null,
      vehicle.id,
      projectId,
      projectDevices.map((d) => d.id)
    ),
    null
  )

  // Helpers
  const getVal = (field: string) =>
    state?.inputs?.[field] ??
    initialSerials[field] ??
    (vehicle as any)[field] ??
    ''

  const isInvalid = (field: string) => !!state?.errors?.[field]

  useEffect(() => {
    if (state?.success) setIsDialogOpen(false)
  }, [state])

  const handleOpenDialog = async () => {
    const result = await getVehicleInstallationData(vehicle.id)
    if (result.success && result.data) {
      const serialMap: Record<string, string> = {}
      result.data.forEach((d) => {
        if (d.device_model_id)
          serialMap[d.device_model_id] = d.serial_number || ''
      })
      setInitialSerials(serialMap)
    }
    setDate(vehicle.installed_at ? new Date(vehicle.installed_at) : new Date())
    setIsDialogOpen(true)
  }

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
            onSelect={handleOpenDialog}
            className="focus:bg-surface-high focus:text-success cursor-pointer"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {vehicle.status === 'instalado'
              ? 'Editar Instalación'
              : 'Gestionar Instalación'}
          </DropdownMenuItem>
          {/* Preserved Button */}
          <DropdownMenuItem className="focus:bg-surface-high focus:text-danger text-danger cursor-pointer">
            <AlertCircle className="mr-2 h-4 w-4" />
            Reportar Problema
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-surface-border bg-surface-low text-foreground max-w-md">
          <form action={formAction}>
            <DialogHeader>
              <DialogTitle>
                {vehicle.status === 'instalado' ? 'Editar' : 'Confirmar'}{' '}
                Instalación
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Unidad:{' '}
                <span className="text-success font-mono font-bold">
                  {vehicle.eco_number || vehicle.vin}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {state?.message && (
                <div className="bg-danger/10 border-danger/20 text-danger flex items-center gap-2 rounded border p-3 text-xs">
                  <AlertCircle className="h-4 w-4" /> {state.message}
                </div>
              )}

              {/* TÉCNICO */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Técnico Responsable
                  </label>
                  {isInvalid('technician_id') && (
                    <span className="text-danger animate-pulse text-xs font-bold">
                      REQUERIDO
                    </span>
                  )}
                </div>
                <Select
                  name="technician_id"
                  defaultValue={getVal('technician_id')}
                >
                  <SelectTrigger
                    aria-invalid={isInvalid('technician_id')}
                    className="bg-surface-mid border-surface-border h-9"
                  >
                    <SelectValue placeholder="Seleccionar técnico..." />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-mid border-surface-border">
                    {technicians.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* FECHA */}
              <div className="space-y-2">
                <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Fecha de Instalación
                </label>
                <input
                  type="hidden"
                  name="installed_at"
                  value={date?.toISOString() || ''}
                />
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-surface-mid border-surface-border w-full justify-start text-zinc-200"
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
                    className="bg-surface-low border-surface-border p-0"
                    align="start"
                  >
                    <Calendar
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

              {/* DISPOSITIVOS */}
              <div className="space-y-3">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Dispositivos
                </span>
                <div className="grid gap-2">
                  {projectDevices.map((model) => (
                    <div
                      key={model.id}
                      className="border-surface-border bg-surface-mid/50 rounded-md border p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={cn(
                            'text-xs font-medium',
                            isInvalid(model.id)
                              ? 'text-danger'
                              : 'text-muted-foreground'
                          )}
                        >
                          {model.model_name}
                        </span>
                        {!model.has_serial ? (
                          <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-[11px] font-bold">
                            INCLUIDO
                          </span>
                        ) : (
                          isInvalid(model.id) && (
                            <span className="text-danger animate-pulse text-xs font-bold">
                              REQUERIDO
                            </span>
                          )
                        )}
                      </div>
                      {model.has_serial && (
                        <Input
                          name={model.id}
                          defaultValue={getVal(model.id)}
                          aria-invalid={isInvalid(model.id)}
                          placeholder="S/N"
                          className={cn(
                            'bg-surface-mid border-surface-border h-8 font-mono text-xs',
                            isInvalid(model.id) &&
                              'border-danger focus-visible:ring-danger'
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 font-bold"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
