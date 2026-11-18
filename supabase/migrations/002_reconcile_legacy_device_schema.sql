-- Reconcile deployments created from the legacy flat-spec schema.
-- Existing specification values remain in their columns and are copied into
-- payload only where payload is absent. No catalog records are deleted.
begin;

alter table public.devices
  add column if not exists payload jsonb,
  add column if not exists available boolean,
  add column if not exists display varchar,
  add column if not exists "refreshRate" varchar,
  add column if not exists processor varchar,
  add column if not exists ram text,
  add column if not exists storage text,
  add column if not exists camera text,
  add column if not exists battery text,
  add column if not exists charging text,
  add column if not exists os text,
  add column if not exists image text,
  add column if not exists "mobileWeight" text,
  add column if not exists "frontCamera" text,
  add column if not exists "backCamera" text,
  add column if not exists "launchedYear" text;

update public.devices
set payload = jsonb_strip_nulls(jsonb_build_object(
  'id', id,
  'brand', brand,
  'model', model,
  'category', category,
  'price', price,
  'available', available,
  'display', display,
  'refreshRate', "refreshRate",
  'processor', processor,
  'ram', ram,
  'storage', storage,
  'camera', camera,
  'battery', battery,
  'charging', charging,
  'os', os,
  'image', image,
  'mobileWeight', "mobileWeight",
  'frontCamera', "frontCamera",
  'backCamera', "backCamera",
  'launchedYear', "launchedYear"
))
where payload is null;

alter table public.devices
  alter column payload set not null;

alter table public.users
  add column if not exists updated_at timestamptz not null default now();

commit;
