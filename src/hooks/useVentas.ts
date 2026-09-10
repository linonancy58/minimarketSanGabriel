import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/features/auth/AuthContext'
import { VentaPorLocal } from '@/lib/types'

interface ItemCarrito {
  id_producto: string
  cantidad: number
  precio_unitario: number
}

export function useRegistrarVenta() {
  const qc = useQueryClient()
  const { usuario } = useAuth()

  return useMutation({
    mutationFn: async ({ items, id_cliente }: { items: ItemCarrito[]; id_cliente?: string | null }) => {
      if (!usuario?.id_local) throw new Error('El usuario no tiene local asignado')

      const { data: venta, error: errVenta } = await supabase
        .from('venta')
        .insert({ id_local: usuario.id_local, id_usuario: usuario.id_usuario, id_cliente: id_cliente ?? null })
        .select()
        .single()
      if (errVenta) throw errVenta

      const detalle = items.map((it) => ({
        id_venta: venta.id_venta,
        id_producto: it.id_producto,
        cantidad: it.cantidad,
        precio_unitario: it.precio_unitario,
      }))

      const { error: errDetalle } = await supabase.from('detalle_venta').insert(detalle)
      if (errDetalle) throw errDetalle

      return venta
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventario'] })
      qc.invalidateQueries({ queryKey: ['stock-critico'] })
      qc.invalidateQueries({ queryKey: ['ventas-por-local'] })
    },
  })
}

export function useVentasPorLocal() {
  return useQuery({
    queryKey: ['ventas-por-local'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_ventas_por_local')
        .select('*')
        .order('dia', { ascending: true })
      if (error) throw error
      return data as VentaPorLocal[]
    },
    refetchInterval: 20000,
  })
}

export function useLocales() {
  return useQuery({
    queryKey: ['locales'],
    queryFn: async () => {
      const { data, error } = await supabase.from('local').select('*').order('nombre')
      if (error) throw error
      return data
    },
  })
}
