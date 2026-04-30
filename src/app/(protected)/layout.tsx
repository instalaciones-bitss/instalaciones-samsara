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
      <Sidebar />

      <main className="bg-surface-low flex-1">
        <div
          className="h-[2px] w-full opacity-70"
          style={{ backgroundImage: 'var(--background-image-brand-gradient)' }}
        />
        {children}
      </main>
    </div>
  )
}
