import { useListaVentas } from '@/hooks/useVentas'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowUpCircle } from 'lucide-react'

export default function SalidasPage() {
  const { data: ventas, isLoading } = useListaVentas()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-navy flex items-center gap-2 mb-1">
        <ArrowUpCircle className="text-destructive" size={24} /> Salidas
      </h1>
      <p className="text-sm text-text-secondary mb-5">Historial de salidas de stock (ventas realizadas).</p>

      {isLoading ? <p className="text-text-secondary">Cargando...</p> : (
        <Table>
          <THead><TR><TH>Fecha</TH><TH>Producto(s)</TH><TH>Cajero</TH><TH>Local</TH><TH>Cantidad total</TH><TH>Monto</TH></TR></THead>
          <TBody>
            {ventas?.map((v: any) => {
              const cantidadTotal = v.detalle_venta?.reduce((acc: number, d: any) => acc + d.cantidad, 0) ?? 0
              const nombres = v.detalle_venta?.map((d: any) => d.producto?.nombre).join(', ') || '—'
              return (
                <TR key={v.id_venta}>
                  <TD className="text-text-secondary text-xs">{formatDate(v.fecha)}</TD>
                  <TD className="font-medium text-navy max-w-xs truncate" title={nombres}>{nombres}</TD>
                  <TD>{v.usuario?.nombre}</TD>
                  <TD>{v.local?.nombre}</TD>
                  <TD className="text-destructive font-semibold">-{cantidadTotal}</TD>
                  <TD>{formatCurrency(Number(v.total))}</TD>
                </TR>
              )
            })}
            {(!ventas || ventas.length === 0) && <TR><TD colSpan={6} className="text-text-secondary">Sin movimientos de salida.</TD></TR>}
          </TBody>
        </Table>
      )}
    </div>
  )
}