import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-3xl border border-transparent px-2 py-0.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-danger aria-invalid:ring-danger/20 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        // Usa tu verde BITSS y texto negro (definido en primary-foreground)
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        // Usa tu gris de superficie alta para estados neutros
        secondary: 'bg-surface-high text-muted-foregound',
        // Usa tu variable de peligro
        destructive: 'bg-danger/10 text-danger border-danger/20',
        // Usa tus bordes de superficie
        outline: 'border-surface-border text-zinc-400 bg-transparent',
        ghost: 'hover:bg-surface-high hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
