import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { Categoria, Producto, Proveedor } from '@/lib/types'

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categoria').select('*').order('nombre')
      if (error) throw error
      return data as Categoria[]
    },
  })
}

export function useProveedores() {
  return useQuery({
    queryKey: ['proveedores'],
    queryFn: async () => {
      const { data, error } = await supabase.from('proveedor').select('*').order('razon_social')
      if (error) throw error
      return data as Proveedor[]
    },
  })
}

export function useProductos() {
  return useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('producto')
        .select('*, categoria(*), proveedor(*)')
        .order('nombre')
      if (error) throw error
      return data as Producto[]
    },
  })
}

export function useGuardarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (producto: Partial<Producto>) => {
      if (producto.id_producto) {
        const { error } = await supabase.from('producto').update(producto).eq('id_producto', producto.id_producto)
        if (error) throw error
      } else {
        const { error } = await supabase.from('producto').insert(producto)
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useGuardarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (categoria: Partial<Categoria>) => {
      const { error } = await supabase.from('categoria').insert(categoria)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  })
}

export function useGuardarProveedor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (proveedor: Partial<Proveedor>) => {
      const { error } = await supabase.from('proveedor').insert(proveedor)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proveedores'] }),
  })
}
