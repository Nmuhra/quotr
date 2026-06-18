-- Storage Policies for Supabase
-- Allows users to upload and access assets scoped to their business

-- ─────────────────────────────────────────────────────────────────
-- STORAGE BUCKETS (create via dashboard or CLI if not exists)
-- ─────────────────────────────────────────────────────────────────
-- CREATE BUCKET IF NOT EXISTS "business-assets" (for logos)
-- CREATE BUCKET IF NOT EXISTS "signatures" (for client signatures)
-- CREATE BUCKET IF NOT EXISTS "quote-pdfs" (for generated PDFs)

-- ─────────────────────────────────────────────────────────────────
-- BUSINESS ASSETS BUCKET POLICIES
-- ─────────────────────────────────────────────────────────────────

-- Allow users to upload/view their own business logo
CREATE POLICY "Users can upload own business logo" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'business-assets'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own business assets" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'business-assets'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own business assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'business-assets'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own business assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'business-assets'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─────────────────────────────────────────────────────────────────
-- SIGNATURES BUCKET POLICIES
-- ─────────────────────────────────────────────────────────────────

-- Allow users to upload/view client signatures for quotes they own
CREATE POLICY "Users can upload signatures for own quotes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'signatures'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own quote signatures" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'signatures'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own quote signatures" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'signatures'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─────────────────────────────────────────────────────────────────
-- QUOTE PDFS BUCKET POLICIES
-- ─────────────────────────────────────────────────────────────────

-- Allow users to upload/view PDFs for their own quotes
CREATE POLICY "Users can upload PDFs for own quotes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'quote-pdfs'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own quote PDFs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'quote-pdfs'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own quote PDFs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'quote-pdfs'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read of public quote PDFs (via signed URL or webhook)
CREATE POLICY "Public quote PDFs readable via signed URL" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'quote-pdfs'
  );
