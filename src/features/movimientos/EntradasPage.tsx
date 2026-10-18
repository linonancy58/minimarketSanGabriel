import { useListaCompras } from '@/hooks/useInventario'
import { Table, THead, TBody, TR, TH, TD, TEmpty } from '@/components/ui/table'
import { PageHeader } from '@/components/ui/page'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function EntradasPage() {
  const { data: compras, isLoading } = useListaCompras()

  return (
    <div className="page">
      <PageHeader title="Entradas" description="Historial de ingresos de stock (compras a proveedores)." />

      <Table>
        <THead>
          <TR>
            <TH>Fecha</TH><TH>Producto(s)</TH><TH>Proveedor</TH><TH>Local</TH>
            <TH className="text-right">Unidades</TH><TH className="text-right">Monto</TH>
          </TR>
        </THead>
        <TBody>
          {isLoading ? (
            <TEmpty colSpan={6}>Cargando…</TEmpty>
          ) : !compras?.length ? (
            <TEmpty colSpan={6}>Sin movimientos de entrada.</TEmpty>
          ) : (
            compras.map((c: any) => {
              const cantidadTotal = c.detalle_compra?.reduce((acc: number, d: any) => acc + d.cantidad, 0) ?? 0
              const nombres = c.detalle_compra?.map((d: any) => d.producto?.nombre).join(', ') || '—'
              return (
                <TR key={c.id_compra}>
                  <TD className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(c.fecha)}</TD>
                  <TD className="max-w-xs truncate font-medium text-foreground" title={nombres}>{nombres}</TD>
                  <TD>{c.proveedor?.razon_social}</TD>
                  <TD className="text-muted-foreground">{c.local?.nombre}</TD>
                  <TD className="num text-right font-semibold text-success">+{cantidadTotal}</TD>
                  <TD className="num text-right">{formatCurrency(Number(c.total))}</TD>
                </TR>
              )
            })
          )}
        </TBody>
      </Table>
    </div>
  )
}
