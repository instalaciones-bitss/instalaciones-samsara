import { createClient } from '@/lib/supabase/server'
import ProjectForm from './ProjectForm' // El componente que crearemos en el siguiente paso

export default async function NewProjectPage() {
  const supabase = await createClient()

  // Traemos los 3 catálogos en paralelo para mayor velocidad
  const [clientsRes, pmsRes, modelsRes] = await Promise.all([
    supabase.from('clients').select('id, name').order('name'),
    supabase.from('profiles').select('id, full_name').order('full_name'),
    supabase.from('device_models').select('id, model_name').order('model_name'),
  ])

  // Manejo básico de errores de carga
  if (clientsRes.error || pmsRes.error || modelsRes.error) {
    return <div>Error al cargar los catálogos. Intenta de nuevo.</div>
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold italic">
          NUEVO{' '}
          <span className="text-success font-light not-italic">PROYECTO</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Registra los datos base. El listado de unidades se importará después.
        </p>
      </header>

      {/* Pasamos la data al formulario de cliente */}
      <ProjectForm
        clients={clientsRes.data}
        pms={pmsRes.data}
        deviceModels={modelsRes.data}
      />
    </div>
  )
}
