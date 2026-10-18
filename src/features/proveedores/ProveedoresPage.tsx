import { useState } from 'react'
import { useProveedores, useGuardarProveedor } from '@/hooks/useCatalogo'
import { Table, THead, TBody, TR, TH, TD, TEmpty } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input, InputWithIcon } from '@/components/ui/input'
import { Field } from '@/components/ui/label'
import { Modal } from '@/components/ui/dialog'
import { Alert, PageHeader, Toolbar } from '@/components/ui/page'
import { Proveedor } from '@/lib/types'
import { Pencil, Plus, Search } from 'lucide-react'
import { useAbrirSiNuevo } from '@/lib/accesos'

export default function ProveedoresPage() {
  const { data: proveedores, isLoading } = useProveedores()
  const [editando, setEditando] = useState<Partial<Proveedor> | null>(null)
  const [busqueda, setBusqueda] = useState('')
  useAbrirSiNuevo(() => setEditando({}))

  const q = busqueda.trim().toLowerCase()
  const filtrados = (proveedores ?? []).filter((p) => !q || p.razon_social.toLowerCase().includes(q) || p.ruc.includes(q))

  return (
    <div className="page">
      <PageHeader
        title="Proveedores"
        description="Empresas que abastecen a los 4 locales."
        actions={<Button onClick={() => setEditando({})}><Plus size={16} /> Nuevo proveedor</Button>}
      />

      <Toolbar>
        <InputWithIcon icon={Search} wrapperClassName="sm:max-w-xs" placeholder="Buscar por razón social o RUC…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <p className="text-[13px] text-muted-foreground sm:ml-auto"><span className="num font-semibold text-foreground">{filtrados.length}</span> proveedores</p>
      </Toolbar>

      <Table>
        <THead><TR><TH>Razón social</TH><TH>RUC</TH><TH>Teléfono</TH><TH>Dirección</TH><TH className="w-12" /></TR></THead>
        <TBody>
          {isLoading ? (
            <TEmpty colSpan={5}>Cargando…</TEmpty>
          ) : filtrados.length === 0 ? (
            <TEmpty colSpan={5}>{q ? 'Sin resultados.' : 'Aún no hay proveedores registrados.'}</TEmpty>
          ) : (
            filtrados.map((p) => (
              <TR key={p.id_proveedor}>
                <TD className="font-medium text-foreground">{p.razon_social}</TD>
                <TD className="num">{p.ruc}</TD>
                <TD className="text-muted-foreground">{p.telefono ?? '—'}</TD>
                <TD className="text-muted-foreground">{p.direccion ?? '—'}</TD>
                <TD>
                  <Button variant="ghost" size="icon" onClick={() => setEditando(p)} aria-label={`Editar ${p.razon_social}`} className="text-muted-foreground">
                    <Pencil size={15} />
                  </Button>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

      {editando && <ModalProveedor proveedor={editando} onClose={() => setEditando(null)} />}
    </div>
  )
}

function ModalProveedor({ proveedor, onClose }: { proveedor: Partial<Proveedor>; onClose: () => void }) {
  const guardar = useGuardarProveedor()
  const [form, setForm] = useState({
    razon_social: proveedor.razon_social ?? '',
    ruc: proveedor.ruc ?? '',
    telefono: proveedor.telefono ?? '',
    direccion: proveedor.direccion ?? '',
  })
  const [error, setError] = useState<string | null>(null)

  async function onGuardar(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    if (!form.razon_social.trim()) { setError('Ingresa la razón social.'); return }
    if (!/^\d{11}$/.test(form.ruc.trim())) { setError('El RUC debe tener 11 dígitos.'); return }
    try {
      await guardar.mutateAsync({
        id_proveedor: proveedor.id_proveedor,
        razon_social: form.razon_social.trim(),
        ruc: form.ruc.trim(),
        telefono: form.telefono.trim() || null,
        direccion: form.direccion.trim() || null,
      })
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'No se pudo guardar el proveedor.')
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={proveedor.id_proveedor ? 'Editar proveedor' : 'Nuevo proveedor'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onGuardar()} disabled={guardar.isPending}>{guardar.isPending ? 'Guardando…' : 'Guardar proveedor'}</Button>
        </>
      }
    >
      <form onSubmit={onGuardar} className="space-y-4">
        <Field label="Razón social"><Input autoFocus value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="RUC"><Input inputMode="numeric" maxLength={11} className="num" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value.replace(/\D/g, '') })} /></Field>
          <Field label="Teléfono (opcional)"><Input inputMode="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></Field>
        </div>
        <Field label="Dirección (opcional)"><Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></Field>
        {error && <Alert tone="error">{error}</Alert>}
      </form>
    </Modal>
  )
}
