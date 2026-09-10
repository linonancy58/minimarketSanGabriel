import { useAuth } from '@/features/auth/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Mail, MapPin, ShieldCheck } from 'lucide-react'

export default function ConfiguracionPage() {
  const { usuario, session } = useAuth()

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-navy flex items-center gap-2 mb-1">
        <Settings className="text-orange" size={24} /> Configuración
      </h1>
      <p className="text-sm text-text-secondary mb-5">Datos de tu cuenta en el sistema.</p>

      <Card>
        <CardHeader><CardTitle>Mi cuenta</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Fila icon={ShieldCheck} label="Nombre" valor={usuario?.nombre ?? '—'} />
          <Fila icon={Mail} label="Correo" valor={session?.user?.email ?? '—'} />
          <Fila icon={MapPin} label="Rol" valor={usuario?.rol ?? '—'} capitalize />
          <p className="text-xs text-text-secondary pt-2 border-t border-border">
            Para cambiar tu contraseña o correo, contacta a gerencia — la administración de cuentas
            se gestiona desde el módulo <strong>Usuarios</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function Fila({ icon: Icon, label, valor, capitalize }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-navy shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-text-secondary">{label}</p>
        <p className={`text-sm font-medium text-navy ${capitalize ? 'capitalize' : ''}`}>{valor}</p>
      </div>
    </div>
  )
}