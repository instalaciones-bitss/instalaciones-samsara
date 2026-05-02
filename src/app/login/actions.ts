'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import z from 'zod'
import { ActionResponse } from '@/types/app.types'

const loginSchema = z.object({
  email: z.email({
    message: 'Por favor, ingresa un correo electrónico válido.',
  }),
  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
})

export type LoginInputs = z.infer<typeof loginSchema>

export async function login(
  _prevState: ActionResponse<LoginInputs>,
  formData: FormData
): Promise<ActionResponse<LoginInputs>> {
  const supabase = await createClient()
  const rawData = Object.fromEntries(formData.entries())
  const validatedFields = loginSchema.safeParse(rawData)

  // 1. Validación de campos (Zod)
  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      inputs: { email: rawData.email } as LoginInputs,
    }
  }

  const { email, password } = validatedFields.data

  try {
    // 2. Intento de inicio de sesión
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        message: 'Credenciales no válidas. Revisa tu correo y contraseña.',
        inputs: { email: email } as LoginInputs,
      }
    }
  } catch (e) {
    // 3. Captura de errores inesperados (red, etc.)
    return {
      message: 'Error de conexión. Inténtalo de nuevo más tarde.',
      inputs: { email: email } as LoginInputs,
    }
  }

  // 4. Redirección al éxito
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  redirect('/login')
}
