// NOTA: Estos tipos reflejan el esquema de la sección 4 del prompt.
// En producción, regenéralos con:
//   npx supabase gen types typescript --project-id TU_PROJECT_ID > src/lib/types.ts
// para mantenerlos sincronizados automáticamente con la base de datos real.

export type Rol = 'cajero' | 'almacenero' | 'gerente'
export type EstadoStock = 'OK' | 'BAJO' | 'CRITICO'

export interface Categoria {
  id_categoria: string
  nombre: string
  descripcion: string | null
}

export interface Proveedor {
  id_proveedor: string
  razon_social: string
  ruc: string
  telefono: string | null
  direccion: string | null
}

export interface Local {
  id_local: string
  nombre: string
  direccion: string | null
  distrito: string | null
}

export interface Usuario {
  id_usuario: string
  nombre: string
  rol: Rol
  id_local: string | null
  activo: boolean
}

export interface Producto {
  id_producto: string
  nombre: string
  codigo_barras: string | null
  id_categoria: string | null
  id_proveedor: string | null
  stock_minimo: number
  stock_maximo: number
  precio_venta: number
  activo: boolean
  categoria?: Categoria
  proveedor?: Proveedor
}

export interface Inventario {
  id_inventario: string
  id_producto: string
  id_local: string
  stock_actual: number
  fecha_actualizacion: string
  producto?: Producto
  local?: Local
}

export interface Cliente {
  id_cliente: string
  nombre: string | null
  documento: string | null
  telefono: string | null
}

export interface Venta {
  id_venta: string
  id_local: string
  id_usuario: string
  id_cliente: string | null
  fecha: string
  total: number
}

export interface DetalleVenta {
  id_detalle: string
  id_venta: string
  id_producto: string
  cantidad: number
  precio_unitario: number
  producto?: Producto
}

export interface Compra {
  id_compra: string
  id_proveedor: string
  id_local: string
  id_usuario: string
  fecha: string
  total: number
}

export interface DetalleCompra {
  id_detalle_compra: string
  id_compra: string
  id_producto: string
  cantidad: number
  costo_unitario: number
}

export interface StockCritico {
  id_local: string
  local_nombre: string
  id_producto: string
  producto_nombre: string
  stock_minimo: number
  stock_actual: number
  estado: EstadoStock
}

export interface VentaPorLocal {
  id_local: string
  local_nombre: string
  dia: string
  num_ventas: number
  total_vendido: number
  ticket_promedio: number
}

// Placeholder mínimo para que @supabase/supabase-js<Database> compile sin
// necesidad de generar el esquema completo antes de la primera ejecución.
export type Database = any
