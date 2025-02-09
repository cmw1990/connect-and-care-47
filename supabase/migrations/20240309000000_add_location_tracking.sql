
-- Create geofences table
create table "public"."geofences" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "group_id" uuid not null references care_groups(id) on delete cascade,
    "name" text not null,
    "description" text,
    "center_lat" double precision not null,
    "center_lng" double precision not null,
    "radius" double precision not null,
    "active" boolean not null default true,
    "notification_type" text not null default 'all'::text,
    "safe_hours" jsonb,
    constraint geofences_pkey primary key (id)
);

-- Create geofence alerts table
create table "public"."geofence_alerts" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "group_id" uuid not null references care_groups(id) on delete cascade,
    "geofence_id" uuid not null references geofences(id) on delete cascade,
    "location" jsonb not null,
    "status" text not null default 'unresolved'::text,
    "resolved_at" timestamp with time zone,
    "resolved_by" uuid references auth.users(id) on delete set null,
    "resolution_notes" text,
    constraint geofence_alerts_pkey primary key (id)
);

-- Add RLS policies
alter table "public"."geofences" enable row level security;
alter table "public"."geofence_alerts" enable row level security;

create policy "Users can view geofences for their groups"
    on "public"."geofences"
    for select
    using (
        exists (
            select 1 from care_group_members
            where care_group_members.group_id = geofences.group_id
            and care_group_members.user_id = auth.uid()
        )
    );

create policy "Users can manage geofences for their groups"
    on "public"."geofences"
    for all
    using (
        exists (
            select 1 from care_group_members
            where care_group_members.group_id = geofences.group_id
            and care_group_members.user_id = auth.uid()
            and care_group_members.role in ('admin', 'caregiver')
        )
    );

create policy "Users can view alerts for their groups"
    on "public"."geofence_alerts"
    for select
    using (
        exists (
            select 1 from care_group_members
            where care_group_members.group_id = geofence_alerts.group_id
            and care_group_members.user_id = auth.uid()
        )
    );

create policy "Users can manage alerts for their groups"
    on "public"."geofence_alerts"
    for all
    using (
        exists (
            select 1 from care_group_members
            where care_group_members.group_id = geofence_alerts.group_id
            and care_group_members.user_id = auth.uid()
            and care_group_members.role in ('admin', 'caregiver')
        )
    );

-- Add location_history column to patient_locations
alter table "public"."patient_locations" 
add column if not exists "location_history" jsonb[] default array[]::jsonb[];

-- Add indexes
create index if not exists geofences_group_id_idx on geofences(group_id);
create index if not exists geofence_alerts_group_id_idx on geofence_alerts(group_id);
create index if not exists geofence_alerts_geofence_id_idx on geofence_alerts(geofence_id);
