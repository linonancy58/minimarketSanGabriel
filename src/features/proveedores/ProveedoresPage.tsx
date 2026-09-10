import { useState } from 'react'
import { useProveedores, useGuardarProveedor } from '@/hooks/useCatalogo'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Truck } from 'lucide-react'

export default function ProveedoresPage() {
  const { data: proveedores, isLoading } = useProveedores()
  const guardar = useGuardarProveedor()
  const [form, setForm] = useState({ razon_social: '', ruc: '', telefono: '', direccion: '' })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-navy flex items-center gap-2 mb-1">
        <Truck className="text-orange" size={24} /> Proveedores
      </h1>
      <p className="text-sm text-text-secondary mb-5">Empresas que abastecen a los 4 locales.</p>

      <div className="flex gap-2 mb-5 flex-wrap">
        <Input placeholder="Razón social" className="w-56" value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} />
        <Input placeholder="RUC" className="w-40" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} />
        <Input placeholder="Teléfono" className="w-40" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        <Input placeholder="Dirección" className="w-56" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
        <Button variant="accent" onClick={() => {
          if (form.razon_social && form.ruc) {
            guardar.mutate(form)
            setForm({ razon_social: '', ruc: '', telefono: '', direccion: '' })
          }
        }}>
          <Plus size={16} /> Agregar
        </Button>
      </div>

      {isLoading ? <p className="text-text-secondary">Cargando...</p> : (
        <Table>
          <THead><TR><TH>Razón social</TH><TH>RUC</TH><TH>Teléfono</TH><TH>Dirección</TH></TR></THead>
          <TBody>
            {proveedores?.map((p) => (
              <TR key={p.id_proveedor}>
                <TD className="font-medium text-navy">{p.razon_social}</TD>
                <TD>{p.ruc}</TD>
                <TD>{p.telefono ?? '—'}</TD>
                <TD>{p.direccion ?? '—'}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}