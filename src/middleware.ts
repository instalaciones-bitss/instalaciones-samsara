import { NextResponse, type NextRequest } from 'next/server' // 2. Herramientas de respuesta de Next.js
import { createMiddlewareClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 3. Creamos una respuesta base
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 4. Inicializamos Supabase dentro del Middleware
  const supabase = createMiddlewareClient(request, response)

  // 5. Verificamos quién es el usuario
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 6. REGLA DE ORO: Si no hay usuario y no está en /login, patada al login
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 7. Si hay usuario e intenta ir al login, mándalo al home (ya está logueado)
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

// 8. CONFIGURACIÓN: Le dice a Next.js en qué páginas debe trabajar este bouncer
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
