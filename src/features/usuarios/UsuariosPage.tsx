import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useLocales } from '@/hooks/useVentas'
import { Table, THead, TBody, TR, TH, TD, TEmpty } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/label'
import { Modal } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, PageHeader } from '@/components/ui/page'
import { Avatar, ROL_LABEL } from '@/components/Avatar'
import { Rol, Usuario } from '@/lib/types'
import { UserPlus } from 'lucide-react'
import { useAbrirSiNuevo } from '@/lib/accesos'

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
  useAbrirSiNuevo(() => setMostrarAlta(true))

  return (
    <div className="page">
      <PageHeader
        title="Usuarios"
        description="Cajeros, almaceneros y gerentes de los 4 locales."
        actions={<Button onClick={() => setMostrarAlta(true)}><UserPlus size={16} /> Nuevo usuario</Button>}
      />

      <Table>
        <THead><TR><TH>Usuario</TH><TH>Rol</TH><TH>Local</TH><TH>Estado</TH><TH className="text-right">Acciones</TH></TR></THead>
        <TBody>
          {isLoading ? (
            <TEmpty colSpan={5}>Cargando…</TEmpty>
          ) : !usuarios?.length ? (
            <TEmpty colSpan={5}>Aún no hay usuarios.</TEmpty>
          ) : (
            usuarios.map((u) => (
              <TR key={u.id_usuario}>
                <TD>
                  <div className="flex items-center gap-3">
                    <Avatar nombre={u.nombre} url={u.avatar_url} className="h-8 w-8 ring-0" />
                    <span className="font-medium text-foreground">{u.nombre}</span>
                  </div>
                </TD>
                <TD><Badge tone={u.rol === 'gerente' ? 'primary' : 'neutral'}>{ROL_LABEL[u.rol] ?? u.rol}</Badge></TD>
                <TD className="text-muted-foreground">{u.local?.nombre ?? 'Todos los locales'}</TD>
                <TD>{u.activo ? <Badge tone="success" dot>Activo</Badge> : <Badge tone="danger" dot>Inactivo</Badge>}</TD>
                <TD className="text-right">
                  <Button size="sm" variant="outline" onClick={() => cambiarEstado.mutate({ id_usuario: u.id_usuario, activo: !u.activo })}>
                    {u.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

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
    <Modal
      open
      onClose={onClose}
      title="Nuevo usuario"
      description="Se creará con una contraseña temporal."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={crear} disabled={loading || ok}>{loading ? 'Creando…' : 'Crear usuario'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nombre completo"><Input value={nombre} onChange={(e) => setNombre(e.target.value)} /></Field>
        <Field label="Correo"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@sangabriel.pe" /></Field>
        <Field label="Contraseña temporal" hint="Mínimo 6 caracteres."><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rol">
            <Select value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
              <option value="cajero">Cajero</option>
              <option value="almacenero">Almacenero</option>
              <option value="gerente">Gerente</option>
            </Select>
          </Field>
          {rol !== 'gerente' && (
            <Field label="Local">
              <Select value={idLocal} onChange={(e) => setIdLocal(e.target.value)}>
                <option value="">Selecciona un local</option>
                {locales?.map((l: any) => <option key={l.id_local} value={l.id_local}>{l.nombre}</option>)}
              </Select>
            </Field>
          )}
        </div>
        {error && <Alert tone="error">{error}</Alert>}
        {ok && <Alert tone="success">Usuario creado correctamente.</Alert>}
      </div>
    </Modal>
  )
}
