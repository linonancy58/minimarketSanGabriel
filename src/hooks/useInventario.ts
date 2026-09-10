import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { Inventario, EstadoStock } from '@/lib/types'
import { useAuth } from '@/features/auth/AuthContext'

export function estadoDe(stockActual: number, stockMinimo: number): EstadoStock {
  if (stockActual <= 0) return 'CRITICO'
  if (stockActual < stockMinimo) return 'BAJO'
  return 'OK'
}

// Inventario del local del usuario (o de todos si es gerente + id_local opcional)
export function useInventarioLocal(idLocalFiltro?: string) {
  const { usuario } = useAuth()
  const idLocal = usuario?.rol === 'gerente' ? idLocalFiltro : usuario?.id_local

  return useQuery({
    queryKey: ['inventario', idLocal ?? 'todos'],
    enabled: !!usuario,
    queryFn: async () => {
      let query = supabase
        .from('inventario')
        .select('*, producto(*, categoria(*), proveedor(*)), local(*)')
        .order('fecha_actualizacion', { ascending: false })

      if (idLocal) query = query.eq('id_local', idLocal)

      const { data, error } = await query
      if (error) throw error
      return data as Inventario[]
    },
  })
}

// Stock consolidado de un producto en los 4 locales (vista de gerente)
export function useStockConsolidado(idProducto?: string) {
  return useQuery({
    queryKey: ['stock-consolidado', idProducto],
    enabled: !!idProducto,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventario')
        .select('*, local(*)')
        .eq('id_producto', idProducto as string)
      if (error) throw error
      return data as Inventario[]
    },
  })
}

interface ItemCompra {
  id_producto: string
  cantidad: number
  costo_unitario: number
}

export function useRegistrarCompra() {
  const qc = useQueryClient()
  const { usuario } = useAuth()

  return useMutation({
    mutationFn: async ({ id_proveedor, items }: { id_proveedor: string; items: ItemCompra[] }) => {
      if (!usuario?.id_local) throw new Error('El usuario no tiene local asignado')

      const { data: compra, error: errCompra } = await supabase
        .from('compra')
        .insert({ id_proveedor, id_local: usuario.id_local, id_usuario: usuario.id_usuario })
        .select()
        .single()
      if (errCompra) throw errCompra

      const detalle = items.map((it) => ({
        id_compra: compra.id_compra,
        id_producto: it.id_producto,
        cantidad: it.cantidad,
        costo_unitario: it.costo_unitario,
      }))

      const { error: errDetalle } = await supabase.from('detalle_compra').insert(detalle)
      if (errDetalle) throw errDetalle

      return compra
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventario'] })
      qc.invalidateQueries({ queryKey: ['stock-critico'] })
    },
  })
}

export function useStockCritico() {
  return useQuery({
    queryKey: ['stock-critico'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vw_stock_critico').select('*')
      if (error) throw error
      return data
    },
    refetchInterval: 15000,
  })
}
