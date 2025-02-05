insert into storage.buckets (id, name)
values ('verification_documents', 'verification_documents');

create policy "Authenticated users can upload verification documents"
on storage.objects for insert to authenticated with check (
  bucket_id = 'verification_documents'
);

create policy "Users can view their own verification documents"
on storage.objects for select to authenticated using (
  bucket_id = 'verification_documents' 
  and auth.uid()::text = (storage.foldername(name))[1]
);