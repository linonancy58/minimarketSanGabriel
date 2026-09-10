-- Datos de ejemplo para probar el sistema (opcional, ejecutar después de crear al menos un usuario gerente)

insert into local (nombre, direccion, distrito) values
  ('San Gabriel - Sede Central', 'Av. Carlos Izaguirre 450', 'Los Olivos'),
  ('San Gabriel - Las Palmeras', 'Av. Antúnez de Mayolo 1200', 'Los Olivos'),
  ('San Gabriel - Pro', 'Av. Naranjal 890', 'Los Olivos'),
  ('San Gabriel - Sol de Oro', 'Av. Universitaria 3200', 'Los Olivos');

insert into categoria (nombre, descripcion) values
  ('Abarrotes', 'Productos secos y no perecibles'),
  ('Bebidas', 'Gaseosas, aguas, jugos'),
  ('Lácteos', 'Leche, yogurt, quesos'),
  ('Limpieza', 'Productos de limpieza del hogar'),
  ('Snacks', 'Golosinas y piqueos');

insert into proveedor (razon_social, ruc, telefono, direccion) values
  ('Distribuidora Lima Norte S.A.C.', '20100123456', '014567890', 'Av. Túpac Amaru 2200'),
  ('Alicorp S.A.A.', '20100055802', '016175000', 'Av. Argentina 4793'),
  ('Backus AB InBev', '20100113610', '016139000', 'Av. Nicolás Ayllón 3986');

insert into producto (nombre, codigo_barras, id_categoria, id_proveedor, stock_minimo, stock_maximo, precio_venta)
select
  v.nombre, v.codigo, c.id_categoria, p.id_proveedor, v.min, v.max, v.precio
from (values
  ('Arroz Costeño 5kg', '7750243001015', 'Abarrotes', 'Distribuidora Lima Norte S.A.C.', 10, 100, 22.90),
  ('Aceite Primor 1L', '7751271001023', 'Abarrotes', 'Alicorp S.A.A.', 8, 80, 13.50),
  ('Coca Cola 1.5L', '7750243002012', 'Bebidas', 'Distribuidora Lima Norte S.A.C.', 15, 150, 7.50),
  ('Leche Gloria Evaporada', '7750243003019', 'Lácteos', 'Alicorp S.A.A.', 20, 200, 4.20),
  ('Cerveza Pilsen 620ml', '7750243004026', 'Bebidas', 'Backus AB InBev', 12, 120, 8.90),
  ('Detergente Bolívar 750g', '7750243005033', 'Limpieza', 'Alicorp S.A.A.', 6, 60, 9.90),
  ('Papas Lays 45g', '7750243006040', 'Snacks', 'Distribuidora Lima Norte S.A.C.', 10, 100, 3.50)
) as v(nombre, codigo, cat, prov, min, max, precio)
join categoria c on c.nombre = v.cat
join proveedor p on p.razon_social = v.prov;

-- Inicializa inventario en 0 para todos los productos en todos los locales
insert into inventario (id_producto, id_local, stock_actual)
select p.id_producto, l.id_local, floor(random() * 40 + 10)::int
from producto p cross join local l
on conflict (id_producto, id_local) do nothing;
