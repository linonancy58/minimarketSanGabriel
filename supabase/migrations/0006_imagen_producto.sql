-- =========================================================
-- Imagen de producto: columna + bucket público de Storage.
-- Lectura pública; solo el gerente puede subir/cambiar/borrar.
-- Ejecutar en Supabase → SQL Editor.
-- =========================================================

alter table producto add column if not exists imagen_url text;

insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

drop policy if exists productos_img_select on storage.objects;
create policy productos_img_select on storage.objects for select using (bucket_id = 'productos');

drop policy if exists productos_img_insert on storage.objects;
create policy productos_img_insert on storage.objects for insert with check (
  bucket_id = 'productos'
  and exists (select 1 from usuario u where u.id_usuario = auth.uid() and u.rol = 'gerente')
);

drop policy if exists productos_img_update on storage.objects;
create policy productos_img_update on storage.objects for update using (
  bucket_id = 'productos'
  and exists (select 1 from usuario u where u.id_usuario = auth.uid() and u.rol = 'gerente')
);

drop policy if exists productos_img_delete on storage.objects;
create policy productos_img_delete on storage.objects for delete using (
  bucket_id = 'productos'
  and exists (select 1 from usuario u where u.id_usuario = auth.uid() and u.rol = 'gerente')
);

notify pgrst, 'reload schema';
