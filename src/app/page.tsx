import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl text-center">
        <span className="bg-brand-teal-light/10 text-brand-teal-light mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
          Operaciones
        </span>

        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          Samsara <span className="text-brand-success">Manager</span>
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-400">
          Bienvenido al centro de control. Gestiona tus instalaciones con la
          paleta oficial.
        </p>

        <div className="mt-10">
          <Link
            href="/login"
            className="bg-brand-primary inline-block rounded-xl px-8 py-4 text-sm font-semibold text-white shadow-[0_0_20px_rgba(45,88,141,0.3)] transition-all hover:brightness-110 active:scale-95"
          >
            Comenzar ahora
          </Link>
        </div>
      </div>
    </main>
  )
}
