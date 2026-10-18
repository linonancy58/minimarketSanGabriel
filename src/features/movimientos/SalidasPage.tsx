import { useListaVentas } from '@/hooks/useVentas'
import { Table, THead, TBody, TR, TH, TD, TEmpty } from '@/components/ui/table'
import { PageHeader } from '@/components/ui/page'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function SalidasPage() {
  const { data: ventas, isLoading } = useListaVentas()

  return (
    <div className="page">
      <PageHeader title="Salidas" description="Historial de salidas de stock (ventas realizadas)." />

      <Table>
        <THead>
          <TR>
            <TH>Fecha</TH><TH>Producto(s)</TH><TH>Cajero</TH><TH>Local</TH>
            <TH className="text-right">Unidades</TH><TH className="text-right">Monto</TH>
          </TR>
        </THead>
        <TBody>
          {isLoading ? (
            <TEmpty colSpan={6}>Cargando…</TEmpty>
          ) : !ventas?.length ? (
            <TEmpty colSpan={6}>Sin movimientos de salida.</TEmpty>
          ) : (
            ventas.map((v: any) => {
              const cantidadTotal = v.detalle_venta?.reduce((acc: number, d: any) => acc + d.cantidad, 0) ?? 0
              const nombres = v.detalle_venta?.map((d: any) => d.producto?.nombre).join(', ') || '—'
              return (
                <TR key={v.id_venta}>
                  <TD className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(v.fecha)}</TD>
                  <TD className="max-w-xs truncate font-medium text-foreground" title={nombres}>{nombres}</TD>
                  <TD>{v.usuario?.nombre}</TD>
                  <TD className="text-muted-foreground">{v.local?.nombre}</TD>
                  <TD className="num text-right font-semibold text-destructive">−{cantidadTotal}</TD>
                  <TD className="num text-right">{formatCurrency(Number(v.total))}</TD>
                </TR>
              )
            })
          )}
        </TBody>
      </Table>
    </div>
  )
}
