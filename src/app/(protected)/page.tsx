import { createClient } from '@/lib/supabase/server' // 1. Traemos al cliente de servidor

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

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      {/* Header con Bienvenida */}
      <header className="mb-12 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium tracking-widest text-zinc-500 uppercase">
            Panel de Control
          </p>
          <h1 className="mt-1 text-4xl font-bold">
            Hola, {user?.user_metadata?.full_name || 'PM'}
          </h1>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 ring-1 ring-blue-500/20 ring-inset">
            {projects?.length || 0} Proyectos Activos
          </span>
        </div>
      </header>

      {/* Grid de Proyectos */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <div
            key={project.id}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700"
          >
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-xl font-semibold text-white transition-colors group-hover:text-blue-400">
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
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-brand-green transition-all duration-500"
                  style={{ width: `${project.progress_percentage}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-zinc-500">
                {project.units_installed} de {project.total_units_expected}{' '}
                unidades
              </p>
            </div>
          </div>
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
