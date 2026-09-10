import { useListaCompras } from '@/hooks/useInventario'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowDownCircle } from 'lucide-react'

export default function EntradasPage() {
  const { data: compras, isLoading } = useListaCompras()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-navy flex items-center gap-2 mb-1">
        <ArrowDownCircle className="text-success" size={24} /> Entradas
      </h1>
      <p className="text-sm text-text-secondary mb-5">Historial de ingresos de stock (compras a proveedores).</p>

      {isLoading ? <p className="text-text-secondary">Cargando...</p> : (
        <Table>
          <THead><TR><TH>Fecha</TH><TH>Producto(s)</TH><TH>Proveedor</TH><TH>Local</TH><TH>Cantidad total</TH><TH>Monto</TH></TR></THead>
          <TBody>
            {compras?.map((c: any) => {
              const cantidadTotal = c.detalle_compra?.reduce((acc: number, d: any) => acc + d.cantidad, 0) ?? 0
              const nombres = c.detalle_compra?.map((d: any) => d.producto?.nombre).join(', ') || '—'
              return (
                <TR key={c.id_compra}>
                  <TD className="text-text-secondary text-xs">{formatDate(c.fecha)}</TD>
                  <TD className="font-medium text-navy max-w-xs truncate" title={nombres}>{nombres}</TD>
                  <TD>{c.proveedor?.razon_social}</TD>
                  <TD>{c.local?.nombre}</TD>
                  <TD className="text-success font-semibold">+{cantidadTotal}</TD>
                  <TD>{formatCurrency(Number(c.total))}</TD>
                </TR>
              )
            })}
            {(!compras || compras.length === 0) && <TR><TD colSpan={6} className="text-text-secondary">Sin movimientos de entrada.</TD></TR>}
          </TBody>
        </Table>
      )}
    </div>
  )
}