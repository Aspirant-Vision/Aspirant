-- ==============================================================================
-- ASPIRANT VISION — PHASE 06: COURSES, FEES & SCHOLARSHIPS SCHEMA ENHANCEMENTS
-- ==============================================================================

-- 1. COURSES TABLE ENHANCEMENTS
ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Engineering',
    ADD COLUMN IF NOT EXISTS code TEXT,
    ADD COLUMN IF NOT EXISTS specialization TEXT,
    ADD COLUMN IF NOT EXISTS short_description TEXT,
    ADD COLUMN IF NOT EXISTS study_mode TEXT DEFAULT 'full_time',
    ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'undergraduate',
    ADD COLUMN IF NOT EXISTS intake INTEGER,
    ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English',
    ADD COLUMN IF NOT EXISTS min_qualification TEXT,
    ADD COLUMN IF NOT EXISTS min_percentage NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS required_subjects TEXT,
    ADD COLUMN IF NOT EXISTS age_criteria TEXT,
    ADD COLUMN IF NOT EXISTS additional_requirements TEXT,
    ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
    ADD COLUMN IF NOT EXISTS banner_url TEXT,
    ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS seo_title TEXT,
    ADD COLUMN IF NOT EXISTS seo_description TEXT,
    ADD COLUMN IF NOT EXISTS og_image_url TEXT,
    ADD COLUMN IF NOT EXISTS no_index BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS publication_status TEXT DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. COLLEGE COURSES ENHANCEMENTS
ALTER TABLE public.college_courses
    ADD COLUMN IF NOT EXISTS course_name_override TEXT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS fee_notes_override TEXT;

-- 3. COLLEGE FEES ENHANCEMENTS
-- Drop the single-row per year constraint to allow multiple breakdown components (tuition, hostel, lab, etc.)
ALTER TABLE public.college_fees DROP CONSTRAINT IF EXISTS uq_college_fees_course_year;

ALTER TABLE public.college_fees
    ADD COLUMN IF NOT EXISTS fee_type TEXT DEFAULT 'tuition',
    ADD COLUMN IF NOT EXISTS payment_frequency TEXT DEFAULT 'annual',
    ADD COLUMN IF NOT EXISTS student_category TEXT DEFAULT 'all',
    ADD COLUMN IF NOT EXISTS amount NUMERIC(12, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS effective_date DATE,
    ADD COLUMN IF NOT EXISTS expiry_date DATE,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 4. SCHOLARSHIPS ENHANCEMENTS
-- Allow general / national scholarships by making college_id nullable
ALTER TABLE public.scholarships ALTER COLUMN college_id DROP NOT NULL;

ALTER TABLE public.scholarships
    ADD COLUMN IF NOT EXISTS slug TEXT,
    ADD COLUMN IF NOT EXISTS provider TEXT,
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'merit',
    ADD COLUMN IF NOT EXISTS min_percentage NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS scholarship_percentage NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS max_benefit NUMERIC(12, 2),
    ADD COLUMN IF NOT EXISTS application_start_date DATE,
    ADD COLUMN IF NOT EXISTS application_instructions TEXT,
    ADD COLUMN IF NOT EXISTS official_url TEXT,
    ADD COLUMN IF NOT EXISTS required_documents JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS contact_info TEXT,
    ADD COLUMN IF NOT EXISTS publication_status TEXT DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Unique slug for scholarships
CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarships_slug ON public.scholarships (slug) WHERE deleted_at IS NULL;

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_courses_pub_featured 
    ON public.courses (publication_status, is_featured, name) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_courses_category_degree 
    ON public.courses (category, degree_type);

CREATE INDEX IF NOT EXISTS idx_college_courses_composite 
    ON public.college_courses (college_id, course_id, admission_status);

CREATE INDEX IF NOT EXISTS idx_college_fees_query 
    ON public.college_fees (college_course_id, academic_year, fee_type);

CREATE INDEX IF NOT EXISTS idx_scholarships_pub 
    ON public.scholarships (publication_status, category) 
    WHERE deleted_at IS NULL;

-- 6. STORAGE BUCKET FOR COURSE & SCHOLARSHIP ASSETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'course-assets',
    'course-assets',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Storage RLS on course-assets
DROP POLICY IF EXISTS "Public can view course assets" ON storage.objects;
CREATE POLICY "Public can view course assets"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'course-assets');

DROP POLICY IF EXISTS "Staff can upload course assets" ON storage.objects;
CREATE POLICY "Staff can upload course assets"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'course-assets' 
        AND public.is_staff()
    );

DROP POLICY IF EXISTS "Staff can update course assets" ON storage.objects;
CREATE POLICY "Staff can update course assets"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'course-assets' 
        AND public.is_staff()
    );

DROP POLICY IF EXISTS "Staff can delete course assets" ON storage.objects;
CREATE POLICY "Staff can delete course assets"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'course-assets' 
        AND public.is_staff()
    );

-- 7. REFRESH COURSES & SCHOLARSHIPS RLS POLICIES FOR PUBLISHED STATUS
DROP POLICY IF EXISTS "Public can view active courses" ON public.courses;
CREATE POLICY "Public can view active courses"
    ON public.courses
    FOR SELECT
    TO anon, authenticated
    USING (
        (publication_status = 'published' OR status = 'active')
        AND deleted_at IS NULL
    );

DROP POLICY IF EXISTS "Public can view active scholarships" ON public.scholarships;
CREATE POLICY "Public can view active scholarships"
    ON public.scholarships
    FOR SELECT
    TO anon, authenticated
    USING (
        (publication_status = 'published' OR status = 'active')
        AND deleted_at IS NULL
    );
