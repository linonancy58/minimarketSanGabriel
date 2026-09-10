import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useLocales } from '@/hooks/useVentas'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Rol, Usuario } from '@/lib/types'
import { UserPlus, X } from 'lucide-react'

function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase.from('usuario').select('*, local(*)').order('nombre')
      if (error) throw error
      return data as (Usuario & { local?: { nombre: string } })[]
    },
  })
}

function useCambiarEstadoUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id_usuario, activo }: { id_usuario: string; activo: boolean }) => {
      const { error } = await supabase.from('usuario').update({ activo }).eq('id_usuario', id_usuario)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}

export default function UsuariosPage() {
  const { data: usuarios, isLoading } = useUsuarios()
  const cambiarEstado = useCambiarEstadoUsuario()
  const [mostrarAlta, setMostrarAlta] = useState(false)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-navy">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Cajeros, almaceneros y gerentes de los 4 locales.</p>
        </div>
        <Button variant="accent" onClick={() => setMostrarAlta(true)}><UserPlus size={16} /> Nuevo usuario</Button>
      </div>

      {isLoading ? <p className="text-muted-foreground">Cargando...</p> : (
        <Table>
          <THead><TR><TH>Nombre</TH><TH>Rol</TH><TH>Local</TH><TH>Estado</TH><TH></TH></TR></THead>
          <TBody>
            {usuarios?.map((u) => (
              <TR key={u.id_usuario}>
                <TD className="font-medium text-navy">{u.nombre}</TD>
                <TD className="capitalize">{u.rol}</TD>
                <TD>{u.local?.nombre ?? '— (todos)'}</TD>
                <TD>{u.activo ? <span className="badge-ok">Activo</span> : <span className="badge-critico">Inactivo</span>}</TD>
                <TD>
                  <Button size="sm" variant="outline" onClick={() => cambiarEstado.mutate({ id_usuario: u.id_usuario, activo: !u.activo })}>
                    {u.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      {mostrarAlta && <ModalNuevoUsuario onClose={() => setMostrarAlta(false)} />}
    </div>
  )
}

function ModalNuevoUsuario({ onClose }: { onClose: () => void }) {
  const { data: locales } = useLocales()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState<Rol>('cajero')
  const [idLocal, setIdLocal] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const qc = useQueryClient()

  async function crear() {
    setError(null)
    if (!nombre || !email || password.length < 6 || (rol !== 'gerente' && !idLocal)) {
      setError('Completa todos los campos. La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    // Nota: crear usuarios de Auth desde el cliente requiere signUp (o, en producción,
    // una Supabase Edge Function con la service_role key para altas administrativas sin
    // afectar la sesión activa del gerente). Aquí usamos signUp como referencia funcional.
    const { data, error: errAuth } = await supabase.auth.signUp({ email, password })
    if (errAuth || !data.user) {
      setError(errAuth?.message ?? 'No se pudo crear el usuario en Auth.')
      setLoading(false)
      return
    }
    const { error: errPerfil } = await supabase.from('usuario').insert({
      id_usuario: data.user.id,
      nombre,
      rol,
      id_local: rol === 'gerente' ? null : idLocal,
    })
    setLoading(false)
    if (errPerfil) {
      setError(errPerfil.message)
      return
    }
    setOk(true)
    qc.invalidateQueries({ queryKey: ['usuarios'] })
    setTimeout(onClose, 1200)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Nuevo usuario</CardTitle>
          <button onClick={onClose}><X size={20} className="text-muted-foreground" /></button>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <Input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Contraseña temporal" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Select value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
            <option value="cajero">Cajero</option>
            <option value="almacenero">Almacenero</option>
            <option value="gerente">Gerente</option>
          </Select>
          {rol !== 'gerente' && (
            <Select value={idLocal} onChange={(e) => setIdLocal(e.target.value)}>
              <option value="">Selecciona un local</option>
              {locales?.map((l: any) => <option key={l.id_local} value={l.id_local}>{l.nombre}</option>)}
            </Select>
          )}
          {error && <p className="text-sm text-destructive bg-red-50 rounded-lg p-2">{error}</p>}
          {ok && <p className="text-sm text-green-700 bg-green-50 rounded-lg p-2">Usuario creado correctamente.</p>}
          <Button variant="accent" className="w-full" onClick={crear} disabled={loading}>
            {loading ? 'Creando...' : 'Crear usuario'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
