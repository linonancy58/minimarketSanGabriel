-- =========================================================
-- Minimarkets San Gabriel S.A.C. — Esquema inicial
-- =========================================================

create extension if not exists pgcrypto;

-- ---------- TABLAS ----------

create table categoria (
  id_categoria uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text
);

create table proveedor (
  id_proveedor uuid primary key default gen_random_uuid(),
  razon_social text not null,
  ruc text unique not null,
  telefono text,
  direccion text
);

create table local (
  id_local uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  distrito text default 'Los Olivos'
);

create table usuario (
  id_usuario uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol text not null check (rol in ('cajero','almacenero','gerente')),
  id_local uuid references local(id_local),
  activo boolean default true
);

create table producto (
  id_producto uuid primary key default gen_random_uuid(),
  nombre text not null,
  codigo_barras text unique,
  id_categoria uuid references categoria(id_categoria),
  id_proveedor uuid references proveedor(id_proveedor),
  stock_minimo integer not null default 0 check (stock_minimo >= 0),
  stock_maximo integer not null check (stock_maximo > stock_minimo),
  precio_venta numeric(8,2) not null check (precio_venta > 0),
  activo boolean default true
);

create table inventario (
  id_inventario uuid primary key default gen_random_uuid(),
  id_producto uuid references producto(id_producto) on delete cascade,
  id_local uuid references local(id_local) on delete cascade,
  stock_actual integer not null default 0 check (stock_actual >= 0),
  fecha_actualizacion timestamptz default now(),
  unique (id_producto, id_local)
);

create table cliente (
  id_cliente uuid primary key default gen_random_uuid(),
  nombre text,
  documento text,
  telefono text
);

create table venta (
  id_venta uuid primary key default gen_random_uuid(),
  id_local uuid references local(id_local),
  id_usuario uuid references usuario(id_usuario),
  id_cliente uuid references cliente(id_cliente),
  fecha timestamptz default now(),
  total numeric(10,2) not null default 0
);

create table detalle_venta (
  id_detalle uuid primary key default gen_random_uuid(),
  id_venta uuid references venta(id_venta) on delete cascade,
  id_producto uuid references producto(id_producto),
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric(8,2) not null
);

create table compra (
  id_compra uuid primary key default gen_random_uuid(),
  id_proveedor uuid references proveedor(id_proveedor),
  id_local uuid references local(id_local),
  id_usuario uuid references usuario(id_usuario),
  fecha timestamptz default now(),
  total numeric(10,2) not null default 0
);

create table detalle_compra (
  id_detalle_compra uuid primary key default gen_random_uuid(),
  id_compra uuid references compra(id_compra) on delete cascade,
  id_producto uuid references producto(id_producto),
  cantidad integer not null check (cantidad > 0),
  costo_unitario numeric(8,2) not null
);

-- ---------- FUNCIONES / TRIGGERS ----------

-- Función auxiliar: obtiene el rol y local del usuario autenticado
create or replace function fn_usuario_actual()
returns table(rol text, id_local uuid) as $$
  select u.rol, u.id_local from usuario u where u.id_usuario = auth.uid();
$$ language sql stable security definer;

-- Trigger: descuenta stock al insertar detalle_venta
create or replace function fn_descontar_stock_venta()
returns trigger as $$
declare
  v_id_local uuid;
begin
  select id_local into v_id_local from venta where id_venta = new.id_venta;

  insert into inventario (id_producto, id_local, stock_actual)
  values (new.id_producto, v_id_local, 0)
  on conflict (id_producto, id_local) do nothing;

  update inventario
     set stock_actual = stock_actual - new.cantidad,
         fecha_actualizacion = now()
   where id_producto = new.id_producto
     and id_local = v_id_local;

  if (select stock_actual from inventario where id_producto = new.id_producto and id_local = v_id_local) < 0 then
    raise exception 'Stock insuficiente para el producto % en el local %', new.id_producto, v_id_local;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_descontar_stock_venta
after insert on detalle_venta
for each row execute function fn_descontar_stock_venta();

-- Trigger: incrementa stock al insertar detalle_compra
create or replace function fn_incrementar_stock_compra()
returns trigger as $$
declare
  v_id_local uuid;
begin
  select id_local into v_id_local from compra where id_compra = new.id_compra;

  insert into inventario (id_producto, id_local, stock_actual)
  values (new.id_producto, v_id_local, new.cantidad)
  on conflict (id_producto, id_local)
  do update set stock_actual = inventario.stock_actual + excluded.stock_actual,
                fecha_actualizacion = now();

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_incrementar_stock_compra
after insert on detalle_compra
for each row execute function fn_incrementar_stock_compra();

-- Trigger: recalcula total de venta
create or replace function fn_recalcular_total_venta()
returns trigger as $$
begin
  update venta set total = (
    select coalesce(sum(cantidad * precio_unitario), 0)
    from detalle_venta where id_venta = coalesce(new.id_venta, old.id_venta)
  ) where id_venta = coalesce(new.id_venta, old.id_venta);
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_total_venta
after insert or update or delete on detalle_venta
for each row execute function fn_recalcular_total_venta();

-- Trigger: recalcula total de compra
create or replace function fn_recalcular_total_compra()
returns trigger as $$
begin
  update compra set total = (
    select coalesce(sum(cantidad * costo_unitario), 0)
    from detalle_compra where id_compra = coalesce(new.id_compra, old.id_compra)
  ) where id_compra = coalesce(new.id_compra, old.id_compra);
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_total_compra
after insert or update or delete on detalle_compra
for each row execute function fn_recalcular_total_compra();

-- ---------- VISTAS ----------

create or replace view vw_stock_critico as
select
  i.id_local,
  l.nombre as local_nombre,
  p.id_producto,
  p.nombre as producto_nombre,
  p.stock_minimo,
  i.stock_actual,
  case
    when i.stock_actual <= 0 then 'CRITICO'
    when i.stock_actual < p.stock_minimo then 'BAJO'
    else 'OK'
  end as estado
from inventario i
join producto p on p.id_producto = i.id_producto
join local l on l.id_local = i.id_local
where i.stock_actual < p.stock_minimo;

create or replace view vw_ventas_por_local as
select
  v.id_local,
  l.nombre as local_nombre,
  date_trunc('day', v.fecha) as dia,
  count(distinct v.id_venta) as num_ventas,
  sum(v.total) as total_vendido,
  round(avg(v.total), 2) as ticket_promedio
from venta v
join local l on l.id_local = v.id_local
group by v.id_local, l.nombre, date_trunc('day', v.fecha);

-- ---------- ROW LEVEL SECURITY ----------

alter table categoria enable row level security;
alter table proveedor enable row level security;
alter table local enable row level security;
alter table usuario enable row level security;
alter table producto enable row level security;
alter table inventario enable row level security;
alter table cliente enable row level security;
alter table venta enable row level security;
alter table detalle_venta enable row level security;
alter table compra enable row level security;
alter table detalle_compra enable row level security;

-- USUARIO: cada quien ve su propio registro; gerente ve todos
create policy usuario_select on usuario for select using (
  id_usuario = auth.uid() or exists (select 1 from usuario u where u.id_usuario = auth.uid() and u.rol = 'gerente')
);
create policy usuario_gerente_all on usuario for all using (
  exists (select 1 from usuario u where u.id_usuario = auth.uid() and u.rol = 'gerente')
) with check (
  exists (select 1 from usuario u where u.id_usuario = auth.uid() and u.rol = 'gerente')
);

-- LOCAL: lectura para todos los autenticados; escritura solo gerente
create policy local_select on local for select using (auth.uid() is not null);
create policy local_write on local for all using (
  exists (select 1 from usuario u where u.id_usuario = auth.uid() and u.rol = 'gerente')
) with check (
  exists (select 1 from usuario u where u.id_usuario = auth.uid() and u.rol = 'gerente')
);

-- CATEGORIA / PROVEEDOR / PRODUCTO: lectura para todos autenticados; escritura solo gerente
create policy categoria_select on categoria for select using (auth.uid() is not null);
create policy categoria_write on categoria for all using (
  exists (select 1 from usuario u where u.id_usuario = auth.uid() and u.rol = 'gerente')
) with check (
  exists (select 1 from usuario u where u.id_usuario = auth.uid() and u.rol = 'gerente')
);

create policy proveedor_select on proveedor for select using (auth.uid() is not null);
create policy proveedor_write on proveedor for all using (
  exists (select 1 from usuario u where u.id_usuario = auth.uid() and u.rol = 'gerente')
) with check (
  exists (select 1 from usuario u where u.id_usuario = auth.uid() and u.rol = 'gerente')
);

create policy producto_select on producto for select using (auth.uid() is not null);
create policy producto_write on producto for all using (
  exists (select 1 from usuario u where u.id_usuario = auth.uid() and u.rol = 'gerente')
) with check (
  exists (select 1 from usuario u where u.id_usuario = auth.uid() and u.rol = 'gerente')
);

-- INVENTARIO: gerente ve todo; almacenero/cajero solo su local
create policy inventario_select on inventario for select using (
  exists (
    select 1 from usuario u where u.id_usuario = auth.uid()
    and (u.rol = 'gerente' or u.id_local = inventario.id_local)
  )
);
create policy inventario_write on inventario for all using (
  exists (
    select 1 from usuario u where u.id_usuario = auth.uid()
    and (u.rol = 'gerente' or (u.rol = 'almacenero' and u.id_local = inventario.id_local))
  )
) with check (
  exists (
    select 1 from usuario u where u.id_usuario = auth.uid()
    and (u.rol = 'gerente' or (u.rol = 'almacenero' and u.id_local = inventario.id_local))
  )
);

-- CLIENTE: cualquier usuario autenticado puede leer/crear (para registrar venta)
create policy cliente_select on cliente for select using (auth.uid() is not null);
create policy cliente_insert on cliente for insert with check (auth.uid() is not null);

-- VENTA: cajero solo su local; gerente todos
create policy venta_select on venta for select using (
  exists (
    select 1 from usuario u where u.id_usuario = auth.uid()
    and (u.rol = 'gerente' or u.id_local = venta.id_local)
  )
);
create policy venta_insert on venta for insert with check (
  exists (
    select 1 from usuario u where u.id_usuario = auth.uid()
    and u.rol = 'cajero' and u.id_local = venta.id_local
  )
);

-- DETALLE_VENTA: heredado por join contra venta
create policy detalle_venta_select on detalle_venta for select using (
  exists (
    select 1 from venta v join usuario u on u.id_usuario = auth.uid()
    where v.id_venta = detalle_venta.id_venta
    and (u.rol = 'gerente' or u.id_local = v.id_local)
  )
);
create policy detalle_venta_insert on detalle_venta for insert with check (
  exists (
    select 1 from venta v join usuario u on u.id_usuario = auth.uid()
    where v.id_venta = detalle_venta.id_venta
    and u.rol = 'cajero' and u.id_local = v.id_local
  )
);

-- COMPRA: almacenero solo su local; gerente todos
create policy compra_select on compra for select using (
  exists (
    select 1 from usuario u where u.id_usuario = auth.uid()
    and (u.rol = 'gerente' or u.id_local = compra.id_local)
  )
);
create policy compra_insert on compra for insert with check (
  exists (
    select 1 from usuario u where u.id_usuario = auth.uid()
    and u.rol = 'almacenero' and u.id_local = compra.id_local
  )
);

create policy detalle_compra_select on detalle_compra for select using (
  exists (
    select 1 from compra c join usuario u on u.id_usuario = auth.uid()
    where c.id_compra = detalle_compra.id_compra
    and (u.rol = 'gerente' or u.id_local = c.id_local)
  )
);
create policy detalle_compra_insert on detalle_compra for insert with check (
  exists (
    select 1 from compra c join usuario u on u.id_usuario = auth.uid()
    where c.id_compra = detalle_compra.id_compra
    and u.rol = 'almacenero' and u.id_local = c.id_local
  )
);
