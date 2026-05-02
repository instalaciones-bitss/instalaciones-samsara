'use client' // 1. Indica que es un Client Component para usar hooks.

import { useActionState } from 'react' // 2. Hook para manejar el estado de la Server Action.
import { createProject, ProjectInputs } from '../actions' // 3. La acción que escribimos antes.
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import {
  ActionResponse,
  ClientCatalog,
  DeviceModelCatalog,
  PMCatalog,
} from '@/types/app.types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select' // 4. Componentes de Shadcn.
import { Checkbox } from '@/components/ui/checkbox'

// 5. Definimos las props que recibe del Server Component.
interface ProjectFormProps {
  clients: ClientCatalog[] | null
  pms: PMCatalog[] | null
  deviceModels: DeviceModelCatalog[] | null
}

export default function ProjectForm({
  clients,
  pms,
  deviceModels,
}: ProjectFormProps) {
  // 6. Vinculamos la acción y el estado (igual que en Login).
  const [state, formAction, isPending] = useActionState<
    ActionResponse<ProjectInputs>,
    FormData
  >(createProject, null)

  const { inputs, errors, message: globalError } = state ?? {}

  // 1. Para saber si un campo es inválido (devuelve string para ARIA)
  const isInvalid = (field: keyof ProjectInputs) => !!errors?.[field]

  // 2. Para obtener el valor por defecto (limpia el ruido visual)
  const getVal = (field: keyof ProjectInputs) =>
    inputs?.[field] as string | undefined

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Campo: Nombre del Proyecto */}
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="text-muted-foreground cursor-pointer text-xs font-bold tracking-wider uppercase"
          >
            Nombre del Proyecto
          </label>
          <Input
            id="name" // Conecta con htmlFor
            name="name"
            placeholder="Ej: Renovación Bimbo Q2"
            disabled={isPending}
            defaultValue={getVal('name')}
            aria-invalid={isInvalid('name')}
          />
          {isInvalid('name') && (
            <p className="text-danger text-xs font-medium">{errors!.name[0]}</p>
          )}
        </div>

        {/* Campo: Cliente */}
        <div className="space-y-1.5">
          <label
            htmlFor="client_id"
            className="text-muted-foreground cursor-pointer text-xs font-bold tracking-wider uppercase"
          >
            Cliente
          </label>
          <Select
            name="client_id"
            disabled={isPending}
            // 1. Le pasamos el valor que regresó la Action
            defaultValue={getVal('client_id')}
            // 2. El key fuerza al componente a refrescarse si el valor cambia
            key={getVal('client_id')}
          >
            <SelectTrigger
              id="client_id" // Shadcn SelectTrigger acepta id para conectarse con la label
              aria-invalid={isInvalid('client_id')}
            >
              <SelectValue placeholder="Selecciona un cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isInvalid('client_id') && (
            <p className="text-danger text-xs font-medium">
              {errors!.client_id[0]}
            </p>
          )}
        </div>

        {/* Campo: Project Manager (PM) */}
        <div className="space-y-1.5">
          <label
            htmlFor="pm_id"
            className="text-muted-foreground cursor-pointer text-xs font-bold tracking-wider uppercase"
          >
            Project Manager
          </label>
          <Select
            name="pm_id"
            disabled={isPending} // 1. Le pasamos el valor que regresó la Action
            defaultValue={getVal('pm_id')}
            // 2. El key fuerza al componente a refrescarse si el valor cambia
            key={getVal('pm_id')}
          >
            <SelectTrigger id="pm_id" aria-invalid={isInvalid('pm_id')}>
              <SelectValue placeholder="Selecciona un PM" />
            </SelectTrigger>
            <SelectContent>
              {pms?.map((pm) => (
                <SelectItem key={pm.id} value={pm.id}>
                  {pm.full_name || 'Sin nombre'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isInvalid('pm_id') && (
            <p className="text-danger text-xs font-medium">
              {errors!.pm_id[0]}
            </p>
          )}
        </div>

        {/* Campo: Total de Unidades Esperadas */}
        <div className="space-y-1.5">
          <label
            htmlFor="total_units_expected"
            className="text-muted-foreground cursor-pointer text-xs font-bold tracking-wider uppercase"
          >
            Unidades Totales
          </label>
          <Input
            id="total_units_expected"
            name="total_units_expected"
            type="number"
            placeholder="0"
            min="1"
            disabled={isPending}
            defaultValue={getVal('total_units_expected')}
            aria-invalid={isInvalid('total_units_expected')}
          />
          {isInvalid('total_units_expected') && (
            <p className="text-danger text-xs font-medium">
              {errors!.total_units_expected[0]}
            </p>
          )}
        </div>
      </div>

      {/* Fila: Datos de Contacto */}
      <div className="border-surface-border/50 grid grid-cols-1 gap-6 border-t pt-4 md:grid-cols-2">
        {/* Campo: Nombre de Contacto */}
        <div className="space-y-1.5">
          <label
            htmlFor="contact_name"
            className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
          >
            Persona de Contacto{' '}
            <span className="text-muted-foreground/60 text-[10px] font-normal lowercase italic">
              (Opcional)
            </span>
          </label>
          <Input
            id="contact_name"
            name="contact_name"
            placeholder="Nombre del responsable en sitio"
            disabled={isPending}
            defaultValue={getVal('contact_name')}
            aria-invalid={isInvalid('contact_name')}
          />
          {isInvalid('contact_name') && (
            <p className="text-danger text-xs font-medium">
              {errors!.contact_name[0]}
            </p>
          )}
        </div>

        {/* Campo: Teléfono de Contacto */}
        <div className="space-y-1.5">
          <label
            htmlFor="contact_phone"
            className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
          >
            Teléfono
          </label>
          <Input
            id="contact_phone"
            name="contact_phone"
            type="tel"
            placeholder="10 dígitos"
            disabled={isPending}
            defaultValue={getVal('contact_phone')}
            aria-invalid={isInvalid('contact_phone')}
          />
          {isInvalid('contact_phone') && (
            <p className="text-danger text-xs font-medium">
              {errors!.contact_phone[0]}
            </p>
          )}
        </div>

        {/* Campo: Link de Drive */}
        <div className="space-y-1.5 md:col-span-2">
          <label
            htmlFor="drive_project_link"
            className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
          >
            Carpeta de Evidencias (Drive)
          </label>
          <Input
            id="drive_project_link"
            name="drive_project_link"
            type="url"
            placeholder="https://drive.google.com/..."
            disabled={isPending}
            defaultValue={getVal('drive_project_link')}
            aria-invalid={isInvalid('drive_project_link')}
          />
          {isInvalid('drive_project_link') && (
            <p className="text-danger text-xs font-medium">
              {errors!.drive_project_link[0]}
            </p>
          )}
        </div>
      </div>

      {/* Bloque: Dispositivos por Defecto */}
      <div className="border-surface-border/50 space-y-4 border-t pt-4">
        <div className="space-y-1">
          <label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
            Modelos de Dispositivos por Defecto
          </label>
          <p className="text-muted-foreground/70 text-[11px] italic">
            Selecciona los equipos que se instalan habitualmente en este
            proyecto.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {deviceModels?.map((model) => (
            <div
              key={model.id}
              className="border-surface-border bg-surface-low/50 hover:bg-surface-low flex items-center space-x-3 rounded-lg border p-3 transition-colors"
            >
              <Checkbox
                key={`${model.id}-${inputs?.default_device_model_ids?.includes(model.id)}`}
                id={`model-${model.id}`}
                name="default_device_model_ids" // El nombre para la Action
                value={model.id} // El UUID que se enviará
                disabled={isPending}
                // En Shadcn/Radix usamos defaultChecked igual que en el nativo
                defaultChecked={inputs?.default_device_model_ids?.includes(
                  model.id
                )}
                className="peer border-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label
                htmlFor={`model-${model.id}`}
                className="peer-data-[state=checked]:text-primary/80 cursor-pointer text-sm leading-none font-medium select-none"
              >
                {model.model_name}
              </label>
            </div>
          ))}
        </div>
        {isInvalid('default_device_model_ids') && (
          <p className="text-danger text-xs font-medium">
            {errors!.default_device_model_ids[0]}
          </p>
        )}
      </div>

      {/* Botón de Acción Final */}
      <div className="pt-6">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 shadow-primary/10 h-12 w-full font-bold text-black shadow-lg transition-all active:scale-[0.98]"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>CREANDO PROYECTO...</span>
            </div>
          ) : (
            'CREAR PROYECTO'
          )}
        </Button>

        {/* Error Global (si falla la DB o hay error inesperado) */}
        {!!globalError && (
          <div className="border-danger/20 bg-danger/10 text-danger mt-4 rounded-lg border p-3 text-center text-xs font-medium italic">
            {globalError}
          </div>
        )}
      </div>
    </form>
  )
}
