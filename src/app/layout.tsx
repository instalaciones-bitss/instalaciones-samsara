import SupabaseProvider from '@/components/providers/supabase-provider'
import './globals.css'

export const metadata = {
  title: 'Samsara Manager',
  description: 'Sistema interno de gestión de instalaciones',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased">
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  )
}
