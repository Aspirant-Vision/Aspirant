-- ==============================================================================
-- ASPIRANT VISION — PHASE 08: STUDENT PORTAL & PROFILE ENHANCEMENTS
-- ==============================================================================

-- 1. ENHANCE PROFILES TABLE FOR STUDENT PERSONAL DETAILS
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS alternate_phone TEXT,
    ADD COLUMN IF NOT EXISTS date_of_birth DATE,
    ADD COLUMN IF NOT EXISTS gender TEXT,
    ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'India',
    ADD COLUMN IF NOT EXISTS pin_code TEXT;

-- 2. CREATE STUDENT ACADEMICS TABLE (1-to-1 with student profile)
CREATE TABLE IF NOT EXISTS public.student_academics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    education_level TEXT NOT NULL DEFAULT '12th',
    highest_qualification TEXT,
    institution_name TEXT,
    board_or_university TEXT,
    passing_year INTEGER,
    percentage_or_cgpa NUMERIC(5, 2),
    stream TEXT,
    entrance_exam_name TEXT,
    entrance_exam_score TEXT,
    additional_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_academics_student UNIQUE (student_id)
);

-- Enable RLS
ALTER TABLE public.student_academics ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_student_academics_updated_at ON public.student_academics;
CREATE TRIGGER trg_student_academics_updated_at
    BEFORE UPDATE ON public.student_academics
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS Policies for student_academics
DROP POLICY IF EXISTS "Students manage own academic record" ON public.student_academics;
CREATE POLICY "Students manage own academic record"
    ON public.student_academics
    FOR ALL
    TO authenticated
    USING (student_id = auth.uid() OR public.is_admin())
    WITH CHECK (student_id = auth.uid() OR public.is_admin());

-- 3. ENHANCE STUDENT PREFERENCES TABLE
ALTER TABLE public.student_preferences
    ADD COLUMN IF NOT EXISTS preferred_study_level TEXT,
    ADD COLUMN IF NOT EXISTS preferred_specialization TEXT,
    ADD COLUMN IF NOT EXISTS preferred_college_type TEXT,
    ADD COLUMN IF NOT EXISTS preferred_study_mode TEXT,
    ADD COLUMN IF NOT EXISTS preferred_admission_year INTEGER,
    ADD COLUMN IF NOT EXISTS entrance_exam_preference TEXT;

-- 4. ENHANCE STUDENT SHORTLISTS (Support both colleges & courses)
ALTER TABLE public.student_shortlists
    ALTER COLUMN college_id DROP NOT NULL;

ALTER TABLE public.student_shortlists
    ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

-- Drop previous single-column unique constraint
ALTER TABLE public.student_shortlists
    DROP CONSTRAINT IF EXISTS uq_student_shortlists_student_college;

-- Create partial unique indexes so student cannot duplicate a college or course shortlist
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_shortlists_college
    ON public.student_shortlists (student_id, college_id)
    WHERE college_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_student_shortlists_course
    ON public.student_shortlists (student_id, course_id)
    WHERE course_id IS NOT NULL;

-- 5. INDEXES FOR STUDENT PORTAL FAST RETRIEVAL
CREATE INDEX IF NOT EXISTS idx_student_academics_student ON public.student_academics(student_id);
CREATE INDEX IF NOT EXISTS idx_student_shortlists_course ON public.student_shortlists(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON public.notifications(recipient_id, is_read);

-- 6. STORAGE BUCKET FOR STUDENT PROFILE AVATARS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-avatars',
    'student-avatars',
    true,
    3145728, -- 3MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 3145728,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Bucket RLS
DROP POLICY IF EXISTS "Public can view student avatars" ON storage.objects;
CREATE POLICY "Public can view student avatars"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'student-avatars');

DROP POLICY IF EXISTS "Students can upload own avatars" ON storage.objects;
CREATE POLICY "Students can upload own avatars"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'student-avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Students can update own avatars" ON storage.objects;
CREATE POLICY "Students can update own avatars"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'student-avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Students can delete own avatars" ON storage.objects;
CREATE POLICY "Students can delete own avatars"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'student-avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
