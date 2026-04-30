import SupabaseProvider from '@/components/providers/supabase'
import './globals.css'

export const metadata = {
  title: 'Samsara Manager',
  description: 'Sistema interno de gestión de instalaciones',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-MX" className="dark" suppressHydrationWarning>
      <body className="bg-surface-low text-foreground min-h-screen antialiased">
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  )
}
