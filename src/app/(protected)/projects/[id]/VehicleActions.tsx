'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale' // Para que el formato sea "28 de abril"
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MoreHorizontal, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { updateVehicleStatus } from './actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface VehicleActionsProps {
  vehicle: {
    id: string
    vin: string
  }
  projectId: string
  // Cambiamos a un array de strings para los nombres de los modelos
  deviceModelNames: string[]
  technicians: { id: string; name: string }[]
}

export function VehicleActions({
  vehicle,
  projectId,
  deviceModelNames,
  technicians,
}: VehicleActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  // 1. Nuevo estado para el técnico seleccionado
  const [selectedTech, setSelectedTech] = useState<string>('')
  // 1. Agregamos el estado para la fecha
  const [date, setDate] = useState<Date>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handleConfirm = () => {
    // 1. Validación de seguridad extra
    if (!selectedTech || !date) return

    startTransition(async () => {
      try {
        // 2. Enviamos todo a la Server Action actualizada
        await updateVehicleStatus(
          vehicle.id,
          'instalado',
          projectId,
          selectedTech, // ID del técnico
          date // Objeto Date de JS
        )

        setIsDialogOpen(false)
      } catch (error) {
        console.error('Error al actualizar:', error)
        alert('Hubo un error al guardar los cambios')
      }
    })
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 cursor-pointer p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-zinc-800 bg-zinc-900 text-zinc-200"
        >
          <DropdownMenuItem
            onSelect={() => setIsDialogOpen(true)}
            className="focus:text-brand-green cursor-pointer focus:bg-zinc-800"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Marcar como Instalado
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer focus:bg-zinc-800 focus:text-red-500">
            <AlertCircle className="mr-2 h-4 w-4" />
            Reportar Problema
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar Instalación</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Se registrará la instalación para la unidad:
              <span className="ml-1 font-mono text-white">{vehicle.vin}</span>
            </DialogDescription>
          </DialogHeader>

          {/* --- INICIO DEL CONTENIDO (Entre Header y Footer) --- */}
          <div className="space-y-6 py-4">
            {/* SECCIÓN 1: Selección de Técnico (Entrada manual) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Asignar Técnico
              </label>
              <Select value={selectedTech} onValueChange={setSelectedTech}>
                <SelectTrigger className="w-full border-zinc-800 bg-zinc-900 text-zinc-200">
                  <SelectValue placeholder="Selecciona un técnico..." />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* SECCIÓN: Fecha de Instalación */}
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Fecha de Instalación
              </label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start border-zinc-800 bg-zinc-900 text-left font-normal text-zinc-200',
                      !date && 'text-zinc-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {/* Formato: PPP muestra "28 de abril de 2026" */}
                    {date ? (
                      format(date, 'PPP', { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto border-zinc-800 bg-zinc-950 p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate) // Guarda la fecha
                      setIsCalendarOpen(false) // <--- ESTO cierra el calendario automáticamente
                    }}
                    autoFocus
                    locale={es} // Fuerza al calendario a usar Lunes como inicio y meses en español
                    className="bg-zinc-950 text-zinc-200"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* SECCIÓN 2: Visualización del Kit (Información del Proyecto) */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Dispositivos
              </h4>
              <div className="space-y-2">
                {deviceModelNames.map((name, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-zinc-800 bg-zinc-900 p-2.5"
                  >
                    <span className="text-brand-green text-sm font-medium">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* --- FIN DEL CONTENIDO --- */}

          <DialogFooter>
            <Button
              variant="default"
              onClick={() => setIsDialogOpen(false)}
              disabled={isPending}
              className="min-w-[100px] text-black"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending || !selectedTech} // Se deshabilita si no hay técnico seleccionado
              className="min-w-[100px] text-black"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
