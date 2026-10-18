import { useAuth } from '@/features/auth/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page'
import { Avatar, ROL_LABEL } from '@/components/Avatar'
import { useTheme, Theme } from '@/lib/theme'
import { cn } from '@/lib/utils'
import { Mail, ShieldCheck, User, Sun, Moon, Monitor } from 'lucide-react'

const TEMAS: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
]

export default function ConfiguracionPage() {
  const { usuario, session } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <div className="page max-w-3xl">
      <PageHeader title="Configuración" description="Datos de tu cuenta y preferencias de la aplicación." />

      <Card>
        <CardHeader className="flex-row items-center gap-4 border-b border-border pb-5">
          <Avatar nombre={usuario?.nombre ?? '?'} url={usuario?.avatar_url} className="h-14 w-14 text-base ring-0" />
          <div>
            <CardTitle className="text-lg">{usuario?.nombre}</CardTitle>
            <CardDescription>{ROL_LABEL[usuario?.rol ?? ''] ?? usuario?.rol}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          <Fila icon={User} label="Nombre" valor={usuario?.nombre ?? '—'} />
          <Fila icon={Mail} label="Correo" valor={session?.user?.email ?? '—'} />
          <Fila icon={ShieldCheck} label="Rol" valor={ROL_LABEL[usuario?.rol ?? ''] ?? '—'} />
        </CardContent>
        <p className="border-t border-border bg-muted/40 px-5 py-3.5 text-xs text-muted-foreground rounded-b-xl">
          Para cambiar tu contraseña o correo, contacta a gerencia — la administración de cuentas se gestiona desde el módulo <strong className="text-foreground">Usuarios</strong>.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>Elige cómo se ve la aplicación en este dispositivo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {TEMAS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors',
                  theme === t.value ? 'border-primary bg-primary-soft text-primary ring-1 ring-primary' : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                <t.icon size={20} /> {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Fila({ icon: Icon, label, valor }: { icon: React.ElementType; label: string; valor: string }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <Icon size={17} className="shrink-0 text-muted-foreground" />
      <p className="w-24 shrink-0 text-[13px] text-muted-foreground">{label}</p>
      <p className="min-w-0 truncate text-sm font-medium">{valor}</p>
    </div>
  )
}
