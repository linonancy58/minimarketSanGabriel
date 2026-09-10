import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { Rol } from '@/lib/types'

export default function ProtectedRoute({ roles }: { roles?: Rol[] }) {
  const { session, usuario, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-navy">Cargando...</div>
  }

  if (!session) return <Navigate to="/login" replace />

  if (!usuario) {
    return <div className="min-h-screen flex items-center justify-center text-navy">Cargando perfil...</div>
  }

  if (!usuario.activo) {
    return <div className="min-h-screen flex items-center justify-center text-destructive">Tu usuario está inactivo. Contacta a gerencia.</div>
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
