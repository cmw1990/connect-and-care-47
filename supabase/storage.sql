insert into storage.buckets (id, name, public)
values ('medication_verification', 'medication_verification', true);

create policy "Anyone can upload medication verification"
  on storage.objects for insert
  with check (bucket_id = 'medication_verification');

create policy "Anyone can view medication verification"
  on storage.objects for select
  using (bucket_id = 'medication_verification');