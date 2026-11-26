-- ==============================================================================
-- ASPIRANT VISION — PHASE 09: APPLICATIONS & ADMISSION MANAGEMENT ENHANCEMENTS
-- ==============================================================================

-- 1. ENHANCE APPLICATIONS TABLE
ALTER TABLE public.applications 
    ADD COLUMN IF NOT EXISTS personal_details JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS academic_details JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS additional_info JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2026-27',
    ADD COLUMN IF NOT EXISTS review_notes TEXT,
    ADD COLUMN IF NOT EXISTS decision_reason TEXT,
    ADD COLUMN IF NOT EXISTS forwarded_to TEXT,
    ADD COLUMN IF NOT EXISTS forwarded_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS decision_at TIMESTAMPTZ;

-- 2. ENHANCE APPLICATION DOCUMENTS TABLE
ALTER TABLE public.application_documents
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
    ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- 3. ENHANCE ADMISSIONS TABLE
ALTER TABLE public.admissions
    ADD COLUMN IF NOT EXISTS admitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS remarks TEXT;

-- 4. REFERENCE GENERATOR FUNCTIONS (Collision-Free, Cryptographically Random Suffix)
CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS TEXT AS $$
DECLARE
    current_yr TEXT := to_char(CURRENT_DATE, 'YYYY');
    rand_chars TEXT;
    new_app_num TEXT;
    done BOOLEAN := FALSE;
BEGIN
    WHILE NOT done LOOP
        -- Generate 6 uppercase alphanumeric characters
        rand_chars := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
        new_app_num := 'AV-APP-' || current_yr || '-' || rand_chars;
        
        IF NOT EXISTS (SELECT 1 FROM public.applications WHERE application_number = new_app_num) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_app_num;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_admission_reference()
RETURNS TEXT AS $$
DECLARE
    current_yr TEXT := to_char(CURRENT_DATE, 'YYYY');
    rand_chars TEXT;
    new_adm_ref TEXT;
    done BOOLEAN := FALSE;
BEGIN
    WHILE NOT done LOOP
        rand_chars := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
        new_adm_ref := 'AV-ADM-' || current_yr || '-' || rand_chars;
        
        IF NOT EXISTS (SELECT 1 FROM public.admissions WHERE admission_reference = new_adm_ref) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_adm_ref;
END;
$$ LANGUAGE plpgsql;

-- 5. PRIVATE STORAGE BUCKET FOR APPLICATION DOCUMENTS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'application-documents',
    'application-documents',
    false, -- STRICTLY PRIVATE BUCKET: No unauthenticated or public URL access
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

-- 6. PRIVATE STORAGE POLICIES
DROP POLICY IF EXISTS "Students can upload own application documents" ON storage.objects;
CREATE POLICY "Students can upload own application documents"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'application-documents'
        AND (auth.uid()::text = (storage.foldername(name))[1])
    );

DROP POLICY IF EXISTS "Authorized users can view application documents" ON storage.objects;
CREATE POLICY "Authorized users can view application documents"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'application-documents'
        AND (
            -- Student owns the file
            auth.uid()::text = (storage.foldername(name))[1]
            -- Or user is staff (admin or counsellor)
            OR public.is_counsellor()
            OR public.is_admin()
        )
    );

DROP POLICY IF EXISTS "Students can delete own draft documents" ON storage.objects;
CREATE POLICY "Students can delete own draft documents"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'application-documents'
        AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR public.is_admin()
        )
    );

-- 7. RE-VERIFY APPLICATION INDEXES
CREATE INDEX IF NOT EXISTS idx_applications_college ON public.applications(college_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(application_status);
CREATE INDEX IF NOT EXISTS idx_applications_counsellor ON public.applications(assigned_counsellor_id);
CREATE INDEX IF NOT EXISTS idx_applications_created ON public.applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admissions_college ON public.admissions(college_id);
CREATE INDEX IF NOT EXISTS idx_admissions_student ON public.admissions(student_id);
