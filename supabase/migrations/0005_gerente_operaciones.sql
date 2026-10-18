-- =========================================================
-- El gerente puede registrar compras y ventas en cualquier local.
-- (Antes solo el almacenero registraba compras y solo el cajero ventas,
--  ambos limitados a su propio local.)
-- Ejecutar en Supabase → SQL Editor.
-- =========================================================

-- COMPRA
drop policy if exists compra_insert on compra;
create policy compra_insert on compra for insert with check (
  exists (
    select 1 from usuario u where u.id_usuario = auth.uid()
    and (u.rol = 'gerente' or (u.rol = 'almacenero' and u.id_local = compra.id_local))
  )
);

drop policy if exists detalle_compra_insert on detalle_compra;
create policy detalle_compra_insert on detalle_compra for insert with check (
  exists (
    select 1 from compra c join usuario u on u.id_usuario = auth.uid()
    where c.id_compra = detalle_compra.id_compra
    and (u.rol = 'gerente' or (u.rol = 'almacenero' and u.id_local = c.id_local))
  )
);

-- VENTA
drop policy if exists venta_insert on venta;
create policy venta_insert on venta for insert with check (
  exists (
    select 1 from usuario u where u.id_usuario = auth.uid()
    and (u.rol = 'gerente' or (u.rol = 'cajero' and u.id_local = venta.id_local))
  )
);

drop policy if exists detalle_venta_insert on detalle_venta;
create policy detalle_venta_insert on detalle_venta for insert with check (
  exists (
    select 1 from venta v join usuario u on u.id_usuario = auth.uid()
    where v.id_venta = detalle_venta.id_venta
    and (u.rol = 'gerente' or (u.rol = 'cajero' and u.id_local = v.id_local))
  )
);

-- Recarga la caché de la API para que tome los cambios
notify pgrst, 'reload schema';
