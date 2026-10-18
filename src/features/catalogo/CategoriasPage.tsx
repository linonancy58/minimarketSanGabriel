import { useMemo, useState } from 'react'
import { useCategorias, useGuardarCategoria, useProductos } from '@/hooks/useCatalogo'
import { Table, THead, TBody, TR, TH, TD, TEmpty } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input, InputWithIcon } from '@/components/ui/input'
import { Field } from '@/components/ui/label'
import { Modal } from '@/components/ui/dialog'
import { Alert, PageHeader, Toolbar } from '@/components/ui/page'
import { Categoria } from '@/lib/types'
import { Pencil, Plus, Search } from 'lucide-react'
import { useAbrirSiNuevo } from '@/lib/accesos'

export default function CategoriasPage() {
  const { data: categorias, isLoading } = useCategorias()
  const { data: productos } = useProductos()
  const [editando, setEditando] = useState<Partial<Categoria> | null>(null)
  const [busqueda, setBusqueda] = useState('')
  useAbrirSiNuevo(() => setEditando({}))

  const conteo = useMemo(() => {
    const c: Record<string, number> = {}
    for (const p of productos ?? []) if (p.id_categoria) c[p.id_categoria] = (c[p.id_categoria] ?? 0) + 1
    return c
  }, [productos])

  const q = busqueda.trim().toLowerCase()
  const filtradas = (categorias ?? []).filter((c) => !q || c.nombre.toLowerCase().includes(q))

  return (
    <div className="page">
      <PageHeader
        title="Categorías"
        description="Clasificación de productos del catálogo."
        actions={<Button onClick={() => setEditando({})}><Plus size={16} /> Nueva categoría</Button>}
      />

      <Toolbar>
        <InputWithIcon icon={Search} wrapperClassName="sm:max-w-xs" placeholder="Buscar categoría…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <p className="text-[13px] text-muted-foreground sm:ml-auto"><span className="num font-semibold text-foreground">{filtradas.length}</span> categorías</p>
      </Toolbar>

      <Table>
        <THead><TR><TH>Nombre</TH><TH>Descripción</TH><TH className="text-right">Productos</TH><TH className="w-12" /></TR></THead>
        <TBody>
          {isLoading ? (
            <TEmpty colSpan={4}>Cargando…</TEmpty>
          ) : filtradas.length === 0 ? (
            <TEmpty colSpan={4}>{q ? 'Sin resultados.' : 'Aún no hay categorías.'}</TEmpty>
          ) : (
            filtradas.map((c) => (
              <TR key={c.id_categoria}>
                <TD className="font-medium text-foreground">{c.nombre}</TD>
                <TD className="text-muted-foreground">{c.descripcion ?? '—'}</TD>
                <TD className="num text-right">{conteo[c.id_categoria] ?? 0}</TD>
                <TD>
                  <Button variant="ghost" size="icon" onClick={() => setEditando(c)} aria-label={`Editar ${c.nombre}`} className="text-muted-foreground">
                    <Pencil size={15} />
                  </Button>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

      {editando && <ModalCategoria categoria={editando} onClose={() => setEditando(null)} />}
    </div>
  )
}

function ModalCategoria({ categoria, onClose }: { categoria: Partial<Categoria>; onClose: () => void }) {
  const guardar = useGuardarCategoria()
  const [nombre, setNombre] = useState(categoria.nombre ?? '')
  const [descripcion, setDescripcion] = useState(categoria.descripcion ?? '')
  const [error, setError] = useState<string | null>(null)

  async function onGuardar(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    if (!nombre.trim()) { setError('Ingresa el nombre de la categoría.'); return }
    try {
      await guardar.mutateAsync({ id_categoria: categoria.id_categoria, nombre: nombre.trim(), descripcion: descripcion.trim() || null })
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'No se pudo guardar la categoría.')
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={categoria.id_categoria ? 'Editar categoría' : 'Nueva categoría'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onGuardar()} disabled={guardar.isPending}>{guardar.isPending ? 'Guardando…' : 'Guardar categoría'}</Button>
        </>
      }
    >
      <form onSubmit={onGuardar} className="space-y-4">
        <Field label="Nombre"><Input autoFocus value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Abarrotes" /></Field>
        <Field label="Descripción (opcional)"><Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></Field>
        {error && <Alert tone="error">{error}</Alert>}
      </form>
    </Modal>
  )
}
