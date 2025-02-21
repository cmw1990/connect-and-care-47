-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- Enable Row Level Security
alter table auth.users enable row level security;

-- Create enum types
create type user_role as enum ('caregiver', 'patient', 'family', 'professional', 'admin');
create type user_status as enum ('active', 'inactive', 'pending');
create type care_team_role as enum ('primary', 'secondary', 'professional', 'family');
create type care_plan_status as enum ('draft', 'active', 'completed', 'archived');
create type goal_status as enum ('pending', 'in_progress', 'completed', 'cancelled');
create type vital_type as enum ('blood_pressure', 'heart_rate', 'temperature', 'blood_sugar', 'weight', 'oxygen');
create type health_category as enum ('activity', 'sleep', 'nutrition', 'mood', 'symptoms', 'medication');
create type data_source as enum ('manual', 'device', 'integration');
create type medication_status as enum ('active', 'discontinued', 'completed');
create type medication_log_status as enum ('pending', 'taken', 'missed', 'skipped');
create type service_type as enum ('caregiver', 'companion', 'professional', 'facility');
create type verification_status as enum ('pending', 'verified', 'rejected');
create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'refunded');
create type facility_type as enum ('nursing_home', 'assisted_living', 'retirement', 'daycare');
create type review_status as enum ('pending', 'approved', 'rejected');
create type alert_type as enum ('fall', 'wandering', 'medication', 'emergency', 'check_in');
create type alert_severity as enum ('low', 'medium', 'high', 'critical');
create type alert_status as enum ('active', 'acknowledged', 'resolved');
create type check_in_status as enum ('pending', 'completed', 'missed');
create type resource_category as enum ('article', 'video', 'guide', 'template');
create type resource_status as enum ('draft', 'published', 'archived');
create type product_status as enum ('active', 'out_of_stock', 'discontinued');
create type order_status as enum ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
create type message_type as enum ('text', 'image', 'file', 'alert');

-- Create tables
create table public.users (
    id uuid primary key default uuid_generate_v4(),
    email text unique not null,
    full_name text not null,
    avatar_url text,
    role user_role not null,
    preferences jsonb default '{}',
    status user_status default 'pending',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table public.care_teams (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    patient_id uuid references public.users(id) on delete cascade,
    primary_caregiver_id uuid references public.users(id),
    status text default 'active',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table public.care_team_members (
    id uuid primary key default uuid_generate_v4(),
    care_team_id uuid references public.care_teams(id) on delete cascade,
    user_id uuid references public.users(id) on delete cascade,
    role care_team_role not null,
    permissions text[] default array[]::text[],
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table public.care_plans (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references public.users(id) on delete cascade,
    title text not null,
    description text,
    start_date date not null,
    end_date date,
    status care_plan_status default 'draft',
    created_by uuid references public.users(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table public.care_plan_goals (
    id uuid primary key default uuid_generate_v4(),
    care_plan_id uuid references public.care_plans(id) on delete cascade,
    title text not null,
    description text,
    target_date date,
    status goal_status default 'pending',
    progress int default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table public.vital_records (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references public.users(id) on delete cascade,
    type vital_type not null,
    value jsonb not null,
    recorded_at timestamptz not null,
    recorded_by uuid references public.users(id),
    device_id text,
    notes text,
    created_at timestamptz default now()
);

create table public.health_logs (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references public.users(id) on delete cascade,
    category health_category not null,
    data jsonb not null,
    start_time timestamptz not null,
    end_time timestamptz,
    source data_source default 'manual',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Add more tables for other modules...

-- Create indexes
create index idx_users_email on public.users(email);
create index idx_care_teams_patient on public.care_teams(patient_id);
create index idx_care_team_members_team on public.care_team_members(care_team_id);
create index idx_care_plans_patient on public.care_plans(patient_id);
create index idx_vital_records_patient on public.vital_records(patient_id);
create index idx_health_logs_patient on public.health_logs(patient_id);

-- Enable RLS policies
alter table public.users enable row level security;
alter table public.care_teams enable row level security;
alter table public.care_team_members enable row level security;
alter table public.care_plans enable row level security;
alter table public.care_plan_goals enable row level security;
alter table public.vital_records enable row level security;
alter table public.health_logs enable row level security;

-- Create RLS policies
create policy "Users can view their own profile"
    on public.users for select
    using (auth.uid() = id);

create policy "Care team members can view patient profile"
    on public.users for select
    using (exists (
        select 1 from public.care_team_members
        where user_id = auth.uid()
        and care_team_id in (
            select id from public.care_teams
            where patient_id = public.users.id
        )
    ));

create policy "Care team members can view team"
    on public.care_teams for select
    using (exists (
        select 1 from public.care_team_members
        where user_id = auth.uid()
        and care_team_id = public.care_teams.id
    ));

-- Add more policies for other tables...

-- Create functions
create or replace function public.get_care_team_members(team_id uuid)
returns setof public.care_team_members
language sql
security definer
set search_path = public
stable
as $$
    select * from public.care_team_members
    where care_team_id = team_id;
$$;

-- Add more functions as needed...

-- Create triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger handle_users_updated_at
    before update on public.users
    for each row
    execute procedure public.handle_updated_at();

-- Add more triggers for other tables...
