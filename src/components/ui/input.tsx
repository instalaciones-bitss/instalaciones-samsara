import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // 1. Estructura y Transiciones
        'h-9 w-full min-w-0 rounded-3xl border px-3 py-1 text-base transition-[color,box-shadow,background-color] outline-none md:text-sm',

        // 2. Colores Base (BITSS Style)
        'border-surface-border bg-surface-high/50 text-foreground placeholder:text-muted-foreground',

        // 3. Estado de Foco Normal (Verde)
        'focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-3',

        // 4. Automatización de Errores (Reducción de Código)
        // Cuando 'aria-invalid' sea true, forzamos el color 'danger' incluso en el foco
        'aria-invalid:border-danger aria-invalid:text-danger/90',
        'aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:ring-danger/20',

        // 5. Estados Deshabilitados
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',

        // Estilos de archivo (si aplica)
        'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',

        className
      )}
      {...props}
    />
  )
}

export { Input }
