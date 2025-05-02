import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Defina as permissões para cada rota
const routePermissions = {
  '/settings': ['user', 'admin', 'organization'],
  '/settings/users': ['admin'],
  '/settings/roles': ['admin'],
  '/settings/organizations': ['admin'],
  '/settings/my-organizations': ['organization'],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userRole = request.cookies.get('userRole')?.value || '' // Obtenha o papel do usuário (exemplo: via cookie)

  // Verifica se a rota tem permissões definidas
  const allowedRoles = routePermissions[pathname]
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redireciona para a página de acesso negado
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Permite o acesso se o papel for válido
  return NextResponse.next()
}
