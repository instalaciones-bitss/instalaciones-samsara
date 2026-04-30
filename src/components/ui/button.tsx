import * as React from 'react'
import { Slot } from 'radix-ui' // Si te da error de import, intenta "@radix-ui/react-slot"
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center rounded-4xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-brand-green focus-visible:ring-3 focus-visible:ring-brand-green/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90',
        outline:
          'border-surface-border bg-transparent hover:bg-surface-high hover:text-foreground aria-expanded:bg-surface-high aria-expanded:text-foreground',
        secondary:
          'bg-surface-high text-foreground hover:bg-surface-border aria-expanded:bg-surface-border',
        ghost: 'hover:bg-surface-high hover:text-foreground',
        destructive:
          'bg-danger text-white hover:opacity-90 focus-visible:border-danger/40 focus-visible:ring-danger/20',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 gap-1.5 px-3',
        xs: 'h-6 gap-1 px-2.5 text-xs [&_svg]:size-3',
        sm: 'h-8 gap-1 px-3',
        lg: 'h-10 gap-1.5 px-4',
        icon: 'size-9',
        'icon-xs': 'size-6 [&_svg]:size-3',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
