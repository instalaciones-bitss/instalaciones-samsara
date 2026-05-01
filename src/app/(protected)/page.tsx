import { getAuthSession } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import {
  PROJECT_STATUS_THEME,
  ProjectStatus,
  ProjectSummary,
} from '@/types/app.types'
import Link from 'next/link'

export default async function DashboardPage() {
  // 1. Lógica: Usamos el helper centralizado
  const { user, supabase } = await getAuthSession()

  let projects: ProjectSummary[] = []

  // 2. Lógica: Try-catch quirúrgico solo para la consulta
  try {
    const { data, error } = await supabase
      .from('project_details')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    projects = data || []
  } catch (error: any) {
    console.error('Error cargando project_details:', error.message)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'bg-brand-gradient'
    if (percentage <= 30) return 'bg-danger'
    if (percentage <= 75) return 'bg-warning'
    return 'bg-success'
  }

  return (
    <div className="bg-surface-low text-foreground min-h-screen p-8">
      <header className="mb-12 flex items-end justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
            Panel de Control
          </p>
          <h1 className="mt-1 text-4xl font-bold">
            Hola, {user?.user_metadata?.full_name || 'PM'}
          </h1>
        </div>
        <div className="text-right">
          <span className="bg-success/10 text-success ring-success/20 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset">
            {projects.length} Proyectos Activos
          </span>
        </div>
      </header>

      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Proyectos</h2>
      </div>

      {/* Grid de Proyectos */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="group border-surface-border bg-surface-mid hover:border-surface-high relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-10"
              style={{
                backgroundImage: 'var(--background-image-brand-gradient)',
              }}
            />
            <div className="mb-4 flex items-start justify-between">
              <h3 className="group-hover:text-primary text-xl font-semibold transition-colors">
                {project.name}
              </h3>
              <span
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase',
                  PROJECT_STATUS_THEME[project.status as ProjectStatus]
                    ?.className
                )}
              >
                {PROJECT_STATUS_THEME[project.status as ProjectStatus]?.label ||
                  project.status}
              </span>
            </div>

            <p className="text-muted-foreground mb-6 line-clamp-1 text-sm">
              {project.client_name}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Progreso de Instalación
                </span>
                <span className="text-foreground font-medium">
                  {project.progress_percentage}%
                </span>
              </div>
              <div className="bg-surface-low h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className={`h-full transition-all duration-500 ease-in-out ${getProgressColor(project.progress_percentage ?? 0)}`}
                  style={{ width: `${project.progress_percentage ?? 0}%` }}
                />
              </div>
              <p className="text-muted-foreground mt-2 text-xs font-medium">
                {project.units_installed} de {project.total_units_expected}{' '}
                unidades
              </p>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="border-surface-border rounded-2xl border border-dashed py-20 text-center">
          <p className="text-muted-foreground">
            No hay proyectos registrados aún.
          </p>
        </div>
      )}
    </div>
  )
}
