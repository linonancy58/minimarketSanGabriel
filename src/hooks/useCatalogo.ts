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
    mutationFn: async (form: Partial<Producto>) => {
      // Quita las relaciones embebidas (categoria, proveedor): no son columnas de la tabla
      const { categoria: _c, proveedor: _p, ...producto } = form
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
      const { error } = categoria.id_categoria
        ? await supabase.from('categoria').update(categoria).eq('id_categoria', categoria.id_categoria)
        : await supabase.from('categoria').insert(categoria)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  })
}

export function useGuardarProveedor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (proveedor: Partial<Proveedor>) => {
      const { error } = proveedor.id_proveedor
        ? await supabase.from('proveedor').update(proveedor).eq('id_proveedor', proveedor.id_proveedor)
        : await supabase.from('proveedor').insert(proveedor)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proveedores'] }),
  })
}

/** Sube la imagen de un producto al bucket público "productos" y devuelve su URL */
export async function subirImagenProducto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('El archivo debe ser una imagen.')
  if (file.size > 3 * 1024 * 1024) throw new Error('La imagen no debe superar 3 MB.')
  const extension = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('productos').upload(path, file, { cacheControl: '31536000', contentType: file.type })
  if (error) throw error
  return supabase.storage.from('productos').getPublicUrl(path).data.publicUrl
}
