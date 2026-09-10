-- =========================================================
-- Avatares de usuario: columna + bucket de Storage
-- =========================================================

alter table usuario add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Cualquier autenticado puede leer avatares (bucket público, pero igual protegemos escritura)
drop policy if exists avatars_select on storage.objects;
create policy avatars_select on storage.objects for select using (bucket_id = 'avatars');

-- Cada usuario solo puede subir/actualizar/borrar su propio avatar
-- (el archivo debe nombrarse como su UUID, ej: 885656d8-....png)
drop policy if exists avatars_insert on storage.objects;
create policy avatars_insert on storage.objects for insert with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists avatars_update on storage.objects;
create policy avatars_update on storage.objects for update using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists avatars_delete on storage.objects;
create policy avatars_delete on storage.objects for delete using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);