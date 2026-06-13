create extension if not exists "pgcrypto";

create type public.organization_role as enum ('designer', 'admin', 'owner');
create type public.product_source as enum ('csv', 'manual', 'feed');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  default_organization_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.organization_role not null default 'designer',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  client_name text,
  room_name text,
  designer_name text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.moodboards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  format text not null default 'a4_landscape',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.moodboard_pages (
  id uuid primary key default gen_random_uuid(),
  moodboard_id uuid not null references public.moodboards(id) on delete cascade,
  page_type text not null,
  title text not null,
  sort_order integer not null,
  fixed boolean not null default false,
  canvas_json jsonb not null default '{"schemaVersion":1,"canvas":{"width":1190,"height":842,"background":"#f7f3ed"},"elements":[]}'::jsonb,
  schema_version integer not null default 1,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  category text,
  color text,
  price_text text,
  dimensions_text text,
  image_url text,
  image_storage_path text,
  product_url text,
  source public.product_source not null default 'manual',
  created_by uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.paint_colors (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  hex text,
  created_at timestamptz not null default now(),
  unique (code, name)
);

create table public.style_tests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  customer_name text,
  customer_email text,
  token_hash text,
  expires_at timestamptz,
  revoked_at timestamptz,
  submitted_at timestamptz,
  answers_json jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.style_profiles (
  id uuid primary key default gen_random_uuid(),
  style_test_id uuid not null references public.style_tests(id) on delete cascade,
  style_name text,
  summary text,
  keywords jsonb not null default '[]'::jsonb,
  color_direction_json jsonb not null default '{}'::jsonb,
  tikkurila_suggestions_json jsonb not null default '[]'::jsonb,
  product_filters_json jsonb not null default '{}'::jsonb,
  designer_brief text,
  created_at timestamptz not null default now()
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  bucket text not null,
  path text not null,
  file_type text not null,
  created_at timestamptz not null default now(),
  unique (bucket, path)
);

create index projects_organization_id_idx on public.projects(organization_id);
create index projects_owner_id_idx on public.projects(owner_id);
create index moodboards_project_id_idx on public.moodboards(project_id);
create index moodboard_pages_moodboard_id_idx on public.moodboard_pages(moodboard_id);
create index products_organization_id_idx on public.products(organization_id);
create index products_active_idx on public.products(organization_id, is_active);
create index style_tests_project_id_idx on public.style_tests(project_id);
create index files_project_id_idx on public.files(project_id);
create index files_owner_id_idx on public.files(owner_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_touch_updated_at
before update on public.organizations
for each row execute function public.touch_updated_at();

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger projects_touch_updated_at
before update on public.projects
for each row execute function public.touch_updated_at();

create trigger moodboards_touch_updated_at
before update on public.moodboards
for each row execute function public.touch_updated_at();

create trigger moodboard_pages_touch_updated_at
before update on public.moodboard_pages
for each row execute function public.touch_updated_at();

create trigger products_touch_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = auth.uid()
      and role in ('admin', 'owner')
  );
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.moodboards enable row level security;
alter table public.moodboard_pages enable row level security;
alter table public.products enable row level security;
alter table public.paint_colors enable row level security;
alter table public.style_tests enable row level security;
alter table public.style_profiles enable row level security;
alter table public.files enable row level security;

create policy "Members can read their organizations"
on public.organizations for select
to authenticated
using (public.is_org_member(id));

create policy "Org admins can update organizations"
on public.organizations for update
to authenticated
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Members can read organization members"
on public.organization_members for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Org admins can manage members"
on public.organization_members for all
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create policy "Members can read projects"
on public.projects for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Members can create own projects"
on public.projects for insert
to authenticated
with check (public.is_org_member(organization_id) and owner_id = auth.uid());

create policy "Owners and admins can update projects"
on public.projects for update
to authenticated
using (owner_id = auth.uid() or public.is_org_admin(organization_id))
with check (owner_id = auth.uid() or public.is_org_admin(organization_id));

create policy "Owners and admins can delete projects"
on public.projects for delete
to authenticated
using (owner_id = auth.uid() or public.is_org_admin(organization_id));

create policy "Members can read moodboards"
on public.moodboards for select
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = moodboards.project_id
      and public.is_org_member(projects.organization_id)
  )
);

create policy "Project owners and admins can manage moodboards"
on public.moodboards for all
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = moodboards.project_id
      and (projects.owner_id = auth.uid() or public.is_org_admin(projects.organization_id))
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = moodboards.project_id
      and (projects.owner_id = auth.uid() or public.is_org_admin(projects.organization_id))
  )
);

create policy "Members can read moodboard pages"
on public.moodboard_pages for select
to authenticated
using (
  exists (
    select 1
    from public.moodboards
    join public.projects on projects.id = moodboards.project_id
    where moodboards.id = moodboard_pages.moodboard_id
      and public.is_org_member(projects.organization_id)
  )
);

create policy "Project owners and admins can manage moodboard pages"
on public.moodboard_pages for all
to authenticated
using (
  exists (
    select 1
    from public.moodboards
    join public.projects on projects.id = moodboards.project_id
    where moodboards.id = moodboard_pages.moodboard_id
      and (projects.owner_id = auth.uid() or public.is_org_admin(projects.organization_id))
  )
)
with check (
  exists (
    select 1
    from public.moodboards
    join public.projects on projects.id = moodboards.project_id
    where moodboards.id = moodboard_pages.moodboard_id
      and (projects.owner_id = auth.uid() or public.is_org_admin(projects.organization_id))
  )
);

create policy "Members can read active products"
on public.products for select
to authenticated
using (is_active and public.is_org_member(organization_id));

create policy "Members can create manual products"
on public.products for insert
to authenticated
with check (
  public.is_org_member(organization_id)
  and created_by = auth.uid()
  and source = 'manual'
);

create policy "Creators and admins can update products"
on public.products for update
to authenticated
using (created_by = auth.uid() or public.is_org_admin(organization_id))
with check (created_by = auth.uid() or public.is_org_admin(organization_id));

create policy "Authenticated users can read paint colors"
on public.paint_colors for select
to authenticated
using (true);

create policy "Members can read style tests"
on public.style_tests for select
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = style_tests.project_id
      and public.is_org_member(projects.organization_id)
  )
);

create policy "Project owners and admins can manage style tests"
on public.style_tests for all
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = style_tests.project_id
      and (projects.owner_id = auth.uid() or public.is_org_admin(projects.organization_id))
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = style_tests.project_id
      and (projects.owner_id = auth.uid() or public.is_org_admin(projects.organization_id))
  )
);

create policy "Members can read style profiles"
on public.style_profiles for select
to authenticated
using (
  exists (
    select 1
    from public.style_tests
    join public.projects on projects.id = style_tests.project_id
    where style_tests.id = style_profiles.style_test_id
      and public.is_org_member(projects.organization_id)
  )
);

create policy "Project owners and admins can manage style profiles"
on public.style_profiles for all
to authenticated
using (
  exists (
    select 1
    from public.style_tests
    join public.projects on projects.id = style_tests.project_id
    where style_tests.id = style_profiles.style_test_id
      and (projects.owner_id = auth.uid() or public.is_org_admin(projects.organization_id))
  )
)
with check (
  exists (
    select 1
    from public.style_tests
    join public.projects on projects.id = style_tests.project_id
    where style_tests.id = style_profiles.style_test_id
      and (projects.owner_id = auth.uid() or public.is_org_admin(projects.organization_id))
  )
);

create policy "Members can read files"
on public.files for select
to authenticated
using (owner_id = auth.uid() or public.is_org_member(organization_id));

create policy "Members can create own files"
on public.files for insert
to authenticated
with check (owner_id = auth.uid() and public.is_org_member(organization_id));

create policy "Owners and admins can update files"
on public.files for update
to authenticated
using (owner_id = auth.uid() or public.is_org_admin(organization_id))
with check (owner_id = auth.uid() or public.is_org_admin(organization_id));

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', false),
  ('project-uploads', 'project-uploads', false),
  ('exports', 'exports', false)
on conflict (id) do nothing;
