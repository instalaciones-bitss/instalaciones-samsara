import { createClient } from '@/lib/supabase/server' // 1. Traemos al cliente de servidor
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 3. Obtenemos al usuario para darle la bienvenida
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. Traemos los datos de nuestra Vista inteligente 'project_details'
  const { data: projects, error } = await supabase
    .from('project_details')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando project_details:', error.message)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage === 100)
      return 'bg-[family-name:--background-image-brand-gradient]'
    if (percentage <= 30) return 'bg-red-500'
    if (percentage <= 75) return 'bg-yellow-500'
    return 'bg-brand-green'
  }

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      {/* Header con Bienvenida */}
      <header className="mb-12 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold tracking-widest text-white uppercase">
            Panel de Control
          </p>
          <h1 className="mt-1 text-4xl font-bold">
            Hola, {user?.user_metadata?.full_name || 'PM'}
          </h1>
        </div>
        <div className="text-right">
          <span className="bg-brand-green/10 text-brand-green ring-brand-green/20 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset">
            {projects?.length || 0} Proyectos Activos
          </span>
        </div>
      </header>

      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Proyectos
        </h2>
      </div>

      {/* Grid de Proyectos */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`} // <--- Aquí la ruta dinámica
            className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm transition-all hover:border-zinc-700 hover:bg-zinc-900"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-10"
              style={{
                backgroundImage: 'var(--background-image-brand-gradient)',
              }}
            />
            <div className="mb-4 flex items-start justify-between">
              <h3 className="group-hover:text-brand-green text-xl font-semibold text-white transition-colors">
                {project.name}
              </h3>
              <span
                className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${
                  project.status === 'activo'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {project.status}
              </span>
            </div>

            <p className="mb-6 line-clamp-1 text-sm text-zinc-400">
              Cliente: {project.client_name}
            </p>

            {/* Barra de Progreso */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Progreso de Instalación</span>
                <span className="font-medium text-white">
                  {project.progress_percentage}%
                </span>
              </div>
              {/* Barra de Progreso con Gradiente BITSS */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
                <div
                  className={`h-full transition-all duration-500 ease-in-out ${getProgressColor(project.progress_percentage ?? 0)}`}
                  style={{ width: `${project.progress_percentage ?? 0}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-zinc-500">
                {project.units_installed} de {project.total_units_expected}{' '}
                unidades
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Estado vacío si no hay proyectos */}
      {projects?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-800 py-20 text-center">
          <p className="text-zinc-500">No hay proyectos registrados aún.</p>
        </div>
      )}
    </div>
  )
}
