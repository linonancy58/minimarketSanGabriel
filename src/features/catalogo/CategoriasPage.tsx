import { useState } from 'react'
import { useCategorias, useGuardarCategoria } from '@/hooks/useCatalogo'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Tag } from 'lucide-react'

export default function CategoriasPage() {
  const { data: categorias, isLoading } = useCategorias()
  const guardar = useGuardarCategoria()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-navy flex items-center gap-2 mb-1">
        <Tag className="text-orange" size={24} /> Categorías
      </h1>
      <p className="text-sm text-text-secondary mb-5">Clasificación de productos del catálogo.</p>

      <div className="flex gap-2 mb-5 max-w-xl">
        <Input placeholder="Nombre de la categoría" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <Input placeholder="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <Button variant="accent" onClick={() => {
          if (nombre) { guardar.mutate({ nombre, descripcion: descripcion || null }); setNombre(''); setDescripcion('') }
        }}>
          <Plus size={16} /> Agregar
        </Button>
      </div>

      {isLoading ? <p className="text-text-secondary">Cargando...</p> : (
        <Table>
          <THead><TR><TH>Nombre</TH><TH>Descripción</TH></TR></THead>
          <TBody>
            {categorias?.map((c) => (
              <TR key={c.id_categoria}><TD className="font-medium text-navy">{c.nombre}</TD><TD>{c.descripcion ?? '—'}</TD></TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}