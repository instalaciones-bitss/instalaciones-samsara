'use client'

import { useActionState } from 'react'
import { login, LoginInputs } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { ActionResponse } from '@/types/app.types' // [Lógica: Importamos el tipo centralizado]

export default function LoginPage() {
  // 1. Lógica: Tipamos el hook para que 'state' reconozca .errors y .message
  const [state, formAction, isPending] = useActionState<
    ActionResponse<LoginInputs>,
    FormData
  >(login, null)

  const { inputs, errors, message: globalError } = state ?? {}
  const isInvalid = (field: keyof LoginInputs) => !!errors?.[field]
  const getVal = (field: keyof LoginInputs) =>
    inputs?.[field] as string | undefined

  return (
    <div className="bg-surface-low flex min-h-screen items-center justify-center p-4">
      <form action={formAction} className="w-full max-w-sm space-y-6">
        {/* Encabezado */}
        <div className="space-y-2 text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tighter italic">
            BITSS
            <span className="text-success ml-1 font-light not-italic">
              MGMT
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Ingresa al panel de control
          </p>
        </div>

        <div className="space-y-4">
          {/* Campo: Email */}
          <div className="space-y-1.5">
            <Input
              name="email"
              type="email"
              placeholder="Correo electrónico"
              disabled={isPending}
              defaultValue={getVal('email')}
              aria-invalid={isInvalid('email')}
            />
            {errors?.email && (
              <p className="text-danger text-xs font-medium">
                {errors.email[0]}
              </p>
            )}
          </div>

          {/* Campo: Password */}
          <div className="space-y-1.5">
            <Input
              name="password"
              type="password"
              placeholder="Contraseña"
              disabled={isPending}
              defaultValue={getVal('password')}
              aria-invalid={isInvalid('password')}
            />
            {errors?.password && (
              <p className="text-danger text-xs font-medium">
                {errors.password[0]}
              </p>
            )}
          </div>

          {/* Error de Supabase (Credenciales inválidas) */}
          {!!globalError && (
            <div className="border-danger/20 bg-danger/10 text-danger rounded-lg border p-3 text-center text-xs font-medium">
              {globalError}
            </div>
          )}

          {/* Botón de Acción */}
          <Button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 h-11 w-full font-bold text-black transition-all active:scale-[0.98]"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
