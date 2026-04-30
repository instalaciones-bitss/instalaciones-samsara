'use client'

import { useActionState } from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  // Hook de conexión con la acción de login
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <form action={formAction} className="w-full max-w-sm space-y-6">
        {/* Encabezado */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-white italic">
            BITSS
            <span className="text-brand-green ml-1 font-light not-italic">
              MGMT
            </span>
          </h1>
          {/* text-zinc-500 -> text-zinc-400 (corresponde a tu clase .text-muted) */}
          <p className="text-sm text-zinc-400">Ingresa al panel de control</p>
        </div>

        <div className="space-y-4">
          {/* Campo: Email */}
          <div className="space-y-1.5">
            <Input
              name="email"
              type="email"
              placeholder="correo@bitss.mx"
              disabled={isPending}
              className={
                state?.errors?.email
                  ? 'border-danger focus-visible:ring-danger'
                  : 'border-surface-border'
              }
            />
            {state?.errors?.email && (
              <p className="text-danger text-xs font-medium">
                {state.errors.email[0]}
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
              className={
                state?.errors?.password
                  ? 'border-danger focus-visible:ring-danger'
                  : 'border-surface-border'
              }
            />
            {state?.errors?.password && (
              <p className="text-danger text-xs font-medium">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* Error de Supabase (Credenciales inválidas) */}
          {state?.message && (
            <div className="border-danger/20 bg-danger/10 text-danger rounded-lg border p-3 text-center text-xs font-medium">
              {state.message}
            </div>
          )}

          {/* Botón de Acción */}
          <Button
            type="submit"
            disabled={isPending}
            className="bg-brand-green hover:bg-brand-green/90 h-11 w-full font-bold text-black transition-all active:scale-[0.98]"
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
