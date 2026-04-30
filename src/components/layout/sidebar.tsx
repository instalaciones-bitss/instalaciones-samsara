import Link from 'next/link'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Wrench,
  LogOut,
} from 'lucide-react'
import { signOut } from '@/app/login/actions'

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Proyectos', icon: FolderKanban, href: '/projects' },
    { name: 'Técnicos', icon: Wrench, href: '/technicians' },
    { name: 'Clientes', icon: Users, href: '/clients' },
  ]

  return (
    <aside className="border-surface-border bg-surface-low sticky top-0 flex h-screen w-64 flex-col border-r p-6">
      <div className="mb-10 flex items-center gap-2 px-2">
        <div className="bg-surface-mid text-brand-green ring-surface-border flex h-8 w-8 items-center justify-center rounded-lg font-bold ring-1">
          S
        </div>
        <h2 className="text-xl font-bold tracking-tighter text-white uppercase italic">
          Samsara
          <span className="ml-0.5 font-light text-zinc-400 not-italic">
            Mgmt
          </span>
        </h2>
      </div>

      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group hover:bg-surface-high flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-400 transition-all hover:text-white"
          >
            <item.icon className="group-hover:text-brand-green h-5 w-5 transition-colors" />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="border-surface-border border-t pt-6">
        <form action={signOut}>
          <button
            type="submit"
            className="group hover:bg-danger/10 hover:text-danger flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-400 transition-all"
          >
            <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
