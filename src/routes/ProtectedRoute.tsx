import { Navigate, Outlet } from 'react-router-dom'
import { Loader2, UserX } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { BrandMark } from '@/components/Brand'
import { Rol } from '@/lib/types'

function Pantalla({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background p-6 text-center">{children}</div>
}

function Cargando({ texto }: { texto: string }) {
  return (
    <Pantalla>
      <BrandMark className="h-12 w-12 rounded-xl" size={24} />
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 size={15} className="animate-spin" /> {texto}
      </p>
    </Pantalla>
  )
}

export default function ProtectedRoute({ roles }: { roles?: Rol[] }) {
  const { session, usuario, loading, signOut } = useAuth()

  if (loading) return <Cargando texto="Cargando…" />

  if (!session) return <Navigate to="/login" replace />

  if (!usuario) return <Cargando texto="Cargando perfil…" />

  if (!usuario.activo) {
    return (
      <Pantalla>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive-soft text-destructive">
          <UserX size={22} />
        </span>
        <div>
          <p className="font-semibold">Tu usuario está inactivo</p>
          <p className="mt-1 text-sm text-muted-foreground">Contacta a gerencia para reactivar tu cuenta.</p>
        </div>
        <button onClick={signOut} className="text-sm font-medium text-primary hover:underline">Volver al inicio de sesión</button>
      </Pantalla>
    )
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
