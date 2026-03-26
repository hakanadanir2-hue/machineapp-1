-- ============================================================
-- MACHINE GYM — TAM KURULUM SQL
-- Supabase Dashboard > SQL Editor > New Query > Yapıştır > Run
-- ============================================================

-- 1. UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLOLAR
-- ============================================================

-- Profiles
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- Services
create table if not exists services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  category text,
  is_active boolean default true,
  order_index integer default 0,
  created_at timestamptz default now()
);

-- Membership Plans
create table if not exists membership_plans (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  duration_months integer not null,
  price numeric(10,2) not null,
  features text[] default '{}',
  is_highlighted boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Appointments
create table if not exists appointments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  service_id uuid references services(id),
  date date not null,
  time_slot text not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text,
  admin_notes text,
  full_name text,
  phone text,
  email text,
  created_at timestamptz default now()
);

-- Payments
create table if not exists payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  amount numeric(10,2) not null,
  currency text default 'TRY',
  type text check (type in ('program', 'membership')),
  status text default 'pending' check (status in ('pending', 'success', 'failed')),
  paytr_order_id text unique,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Fitness Programs
create table if not exists fitness_programs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  payment_id uuid references payments(id),
  input_data jsonb not null,
  program_data jsonb not null,
  pdf_url text,
  created_at timestamptz default now()
);

-- Blog Posts
create table if not exists blog_posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references profiles(id),
  title text not null,
  slug text unique not null,
  content text,
  excerpt text,
  cover_image text,
  tags text[] default '{}',
  seo_title text,
  seo_description text,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- Gallery
create table if not exists gallery_images (
  id uuid default uuid_generate_v4() primary key,
  url text not null,
  alt_text text,
  category text default 'general',
  order_index integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Campaigns
create table if not exists campaigns (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  discount_type text check (discount_type in ('fixed', 'percent', 'extra_days')),
  discount_value numeric(10,2),
  valid_until timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Notifications
create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'info' check (type in ('info', 'success', 'warning', 'appointment')),
  read boolean default false,
  created_at timestamptz default now()
);

-- Site Settings
create table if not exists site_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- Products (Mağaza)
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  category text not null,
  price numeric(10,2) not null,
  sale_price numeric(10,2),
  stock integer default 0,
  sizes text[] default '{}',
  colors text[] default '{}',
  short_description text,
  description text,
  cover_image text,
  gallery_images text[] default '{}',
  is_featured boolean default false,
  is_new boolean default false,
  is_active boolean default true,
  seo_title text,
  seo_description text,
  created_at timestamptz default now()
);

-- Exercises (Egzersiz Kütüphanesi)
create table if not exists exercises (
  id uuid default uuid_generate_v4() primary key,
  exercise_name text not null,
  slug text unique not null,
  primary_muscle text,
  secondary_muscles text[] default '{}',
  category text,
  equipment text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  description text,
  instructions text,
  image_url text,
  video_url text,
  source text default 'custom',
  source_url text,
  source_license text,
  attribution_required boolean default false,
  is_active boolean default false,
  is_verified boolean default false,
  wger_id integer unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contact Requests
create table if not exists contact_requests (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text,
  email text,
  message text not null,
  status text default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamptz default now()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

alter table profiles enable row level security;
alter table appointments enable row level security;
alter table payments enable row level security;
alter table fitness_programs enable row level security;
alter table notifications enable row level security;
alter table blog_posts enable row level security;
alter table gallery_images enable row level security;
alter table services enable row level security;
alter table membership_plans enable row level security;
alter table campaigns enable row level security;
alter table site_settings enable row level security;
alter table products enable row level security;
alter table exercises enable row level security;
alter table contact_requests enable row level security;

-- Profiles policies
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admin can view all profiles" on profiles;
drop policy if exists "Enable insert for authenticated users" on profiles;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admin can view all profiles" on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "Enable insert for authenticated users" on profiles for insert with check (auth.uid() = id);

-- Appointments
drop policy if exists "Users view own appointments" on appointments;
drop policy if exists "Users insert own appointments" on appointments;
drop policy if exists "Admin manage all appointments" on appointments;
create policy "Users view own appointments" on appointments for select using (auth.uid() = user_id);
create policy "Users insert own appointments" on appointments for insert with check (true);
create policy "Admin manage all appointments" on appointments for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Payments
drop policy if exists "Users view own payments" on payments;
drop policy if exists "Service role manage payments" on payments;
drop policy if exists "Admin view all payments" on payments;
create policy "Users view own payments" on payments for select using (auth.uid() = user_id);
create policy "Service role manage payments" on payments for all using (true);
create policy "Admin view all payments" on payments for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Fitness Programs
drop policy if exists "Users view own programs" on fitness_programs;
drop policy if exists "Admin view all programs" on fitness_programs;
create policy "Users view own programs" on fitness_programs for select using (auth.uid() = user_id);
create policy "Admin view all programs" on fitness_programs for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Notifications
drop policy if exists "Users manage own notifications" on notifications;
create policy "Users manage own notifications" on notifications for all using (auth.uid() = user_id);

-- Blog Posts
drop policy if exists "Public read published posts" on blog_posts;
drop policy if exists "Admin manage blog" on blog_posts;
create policy "Public read published posts" on blog_posts for select using (published = true);
create policy "Admin manage blog" on blog_posts for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Gallery
drop policy if exists "Public read gallery" on gallery_images;
drop policy if exists "Admin manage gallery" on gallery_images;
create policy "Public read gallery" on gallery_images for select using (is_active = true);
create policy "Admin manage gallery" on gallery_images for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Services
drop policy if exists "Public read services" on services;
drop policy if exists "Admin manage services" on services;
create policy "Public read services" on services for select using (is_active = true);
create policy "Admin manage services" on services for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Membership Plans
drop policy if exists "Public read plans" on membership_plans;
drop policy if exists "Admin manage plans" on membership_plans;
create policy "Public read plans" on membership_plans for select using (is_active = true);
create policy "Admin manage plans" on membership_plans for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Campaigns
drop policy if exists "Public read campaigns" on campaigns;
drop policy if exists "Admin manage campaigns" on campaigns;
create policy "Public read campaigns" on campaigns for select using (is_active = true);
create policy "Admin manage campaigns" on campaigns for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Site Settings
drop policy if exists "Admin manage settings" on site_settings;
create policy "Admin manage settings" on site_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Products
drop policy if exists "Public read active products" on products;
drop policy if exists "Admin manage products" on products;
create policy "Public read active products" on products for select using (is_active = true);
create policy "Admin manage products" on products for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Exercises
drop policy if exists "Public read active verified exercises" on exercises;
drop policy if exists "Admin manage exercises" on exercises;
create policy "Public read active verified exercises" on exercises for select using (is_active = true and is_verified = true);
create policy "Admin manage exercises" on exercises for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Contact Requests
drop policy if exists "Anyone can insert contact request" on contact_requests;
drop policy if exists "Admin manage contact requests" on contact_requests;
create policy "Anyone can insert contact request" on contact_requests for insert with check (true);
create policy "Admin manage contact requests" on contact_requests for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- TRIGGER: Yeni kullanıcı kaydında otomatik profil oluştur
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SEED DATA — Gerçek Machine Gym verileri
-- ============================================================

insert into services (name, description, category, is_active, order_index) values
  ('Fitness Üyelik', 'Modern ekipmanlar ve klimatize ortamda fitness deneyimi.', 'fitness', true, 1),
  ('Personal Trainer', 'Sertifikalı kişisel antrenörlerimizle bire bir çalışma.', 'fitness', true, 2),
  ('Boks Özel Ders', 'Profesyonel boks teknikleri ve kondisyon çalışması.', 'dövüş', true, 3),
  ('Kickboks', 'Tam vücut egzersizi sağlayan kickboks dersleri.', 'dövüş', true, 4),
  ('Muay Thai', 'Tayland boks sanatı ile sekiz uzuv tekniği.', 'dövüş', true, 5)
on conflict do nothing;

insert into membership_plans (name, duration_months, price, features, is_highlighted) values
  ('Aylık',   1, 2000, ARRAY['Sınırsız Fitness','Soyunma Odası','Sauna'], false),
  ('3 Aylık', 3, 4200, ARRAY['Sınırsız Fitness','Soyunma Odası','Sauna','1 Ücretsiz PT Seansı'], true),
  ('6 Aylık', 6, 7000, ARRAY['Sınırsız Fitness','Soyunma Odası','Sauna','2 Ücretsiz PT Seansı','Program Analizi'], false)
on conflict do nothing;

insert into site_settings (key, value) values
  ('whatsapp_number',       '903742701455'),
  ('phone',                 '0374 270 14 55'),
  ('email',                 'info@machinegym.com.tr'),
  ('address',               'Tabaklar Mah. / Uygur Sokak NO:3, Bolu Merkez'),
  ('instagram',             'https://instagram.com/gymachinebolu'),
  ('facebook',              'https://facebook.com/machinegym'),
  ('working_hours_weekday', 'Pzt – Cum: 08:00 – 01:00'),
  ('working_hours_saturday','Cumartesi: 10:00 – 01:00'),
  ('working_hours_sunday',  'Pazar: 12:00 – 20:00')
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============================================================
-- ADIM 2: Admin kullanıcısı oluşturduktan SONRA bu satırı çalıştır
-- (Authentication > Users > Add User ile önce kullanıcıyı ekle)
-- ============================================================
-- UPDATE profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@machinegym.com.tr');
