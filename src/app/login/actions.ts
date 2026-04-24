'use server' // 1. Indica que este código solo se ejecuta en el servidor

import { createClient as createServerClient } from '@/lib/supabase/server' // 2. Importa el cliente de Supabase para servidor
import { redirect } from 'next/navigation' // 3. Importa la función para redireccionar páginas
import z from 'zod'

const loginSchema = z.object({
  email: z.email({
    message: 'Por favor, ingresa un correo electrónico válido.',
  }),
  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
})

export type FormState = {
  error?: string
  errors?: {
    email?: string[]
    password?: string[]
  }
} | null

// Un formato estándar y limpio para todas tus acciones
export type ActionResponse = {
  message?: string // Errores generales (ej: "Credenciales inválidas")
  errors?: Record<string, string[]> // Errores de Zod (ej: { email: ["Formato inválido"] })
} | null

export async function login(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createServerClient()
  const rawData = Object.fromEntries(formData.entries())
  const validatedFields = loginSchema.safeParse(rawData)

  // Si Zod falla
  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  // Si Supabase falla
  if (error) {
    return {
      message: 'Credenciales no válidas. Revisa tu correo y contraseña.',
    }
  }

  redirect('/')
}

// Al final de src/app/login/actions.ts
export async function signOut() {
  const supabase = await createServerClient() // 1. Creamos el cliente de servidor
  await supabase.auth.signOut() // 2. Le pedimos a Supabase que invalide la sesión
  redirect('/login') // 3. Mandamos al usuario de vuelta al inicio
}
