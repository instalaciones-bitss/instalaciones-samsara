import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex">
      {/* La pieza que acabamos de crear */}
      <Sidebar />

      {/* El contenido de tus páginas (Dashboard, Projects, etc.) */}
      <main className="flex-1 bg-black">
        <div
          className="h-[2px] w-full opacity-70"
          style={{ backgroundImage: 'var(--background-image-brand-gradient)' }}
        />
        {children}
      </main>
    </div>
  )
}
