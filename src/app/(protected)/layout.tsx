import { getAuthSession } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Usamos el helper estándar
  const { user } = await getAuthSession()

  // 2. Seguridad: Si no hay usuario, fuera.
  // Es mejor dejar el redirect aquí en el layout para que sea
  // explícito que esta zona está protegida.
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="bg-surface-low flex flex-1 flex-col">
        {/* Línea de marca */}
        <div
          className="h-[2px] w-full shrink-0 opacity-70"
          style={{ backgroundImage: 'var(--background-image-brand-gradient)' }}
        />

        {/* Contenedor de contenido */}
        <div className="flex-1">{children}</div>
      </main>
    </div>
  )
}
