import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  if (user) {
    // L'utilisateur est connecté. On vérifie son rôle en base.
    // Attention : pour éviter trop de requêtes à chaque navigation,
    // on vérifie le rôle uniquement si on accède aux routes protégées ou page d'accueil
    if (path === '/' || path === '/login' || path === '/signup' || path.startsWith('/coach') || path.startsWith('/client')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
          
        const role = profile?.role

        // Redirection depuis l'accueil ou le login vers le bon dashboard
        if (path === '/' || path === '/login' || path === '/signup') {
            if (role) return NextResponse.redirect(new URL(`/${role}`, request.url))
        }

        // Sécurité pour le routage selon le rôle
        if (path.startsWith('/coach') && role !== 'coach') {
            return NextResponse.redirect(new URL('/client', request.url))
        }

        if (path.startsWith('/client') && role !== 'client') {
            return NextResponse.redirect(new URL('/coach', request.url))
        }
    }
  } else {
    // Si l'utilisateur n'est pas connecté et essaie d'accéder à un espace privé
    if (path.startsWith('/coach') || path.startsWith('/client')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}
