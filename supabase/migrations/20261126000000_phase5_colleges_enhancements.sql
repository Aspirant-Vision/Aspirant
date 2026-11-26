-- ==============================================================================
-- ASPIRANT VISION — PHASE 05: 014 COLLEGE MANAGEMENT ENHANCEMENTS & STORAGE
-- ==============================================================================

-- 1. ADD BACKWARD-COMPATIBLE COLUMNS TO PUBLIC.COLLEGES
ALTER TABLE public.colleges
    ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS facilities TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
    ADD COLUMN IF NOT EXISTS alternate_phone TEXT,
    ADD COLUMN IF NOT EXISTS admission_contact TEXT,
    ADD COLUMN IF NOT EXISTS admission_email TEXT,
    ADD COLUMN IF NOT EXISTS admission_process TEXT,
    ADD COLUMN IF NOT EXISTS eligibility_overview TEXT,
    ADD COLUMN IF NOT EXISTS entrance_exams TEXT,
    ADD COLUMN IF NOT EXISTS admission_start_date DATE,
    ADD COLUMN IF NOT EXISTS admission_end_date DATE,
    ADD COLUMN IF NOT EXISTS accreditation_body TEXT,
    ADD COLUMN IF NOT EXISTS accreditation_grade TEXT,
    ADD COLUMN IF NOT EXISTS naac_grade TEXT,
    ADD COLUMN IF NOT EXISTS nirf_rank INTEGER,
    ADD COLUMN IF NOT EXISTS other_rankings TEXT,
    ADD COLUMN IF NOT EXISTS recognition_details TEXT,
    ADD COLUMN IF NOT EXISTS canonical_url TEXT,
    ADD COLUMN IF NOT EXISTS og_image_url TEXT,
    ADD COLUMN IF NOT EXISTS no_index BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- 2. CREATE INDEXES FOR FAST FILTERING & SEARCH
CREATE INDEX IF NOT EXISTS idx_colleges_publication_status ON public.colleges(publication_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_colleges_is_featured ON public.colleges(is_featured) WHERE publication_status = 'published';
CREATE INDEX IF NOT EXISTS idx_colleges_college_type ON public.colleges(college_type);
CREATE INDEX IF NOT EXISTS idx_colleges_state_city ON public.colleges(state, city);

-- 3. STORAGE CONFIGURATION FOR COLLEGE ASSETS
-- Creates or updates public bucket for logos, covers, and gallery images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'college-assets',
    'college-assets',
    true,
    5242880, -- 5MB limit per asset
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Storage RLS Policies for college-assets
-- Allow public reading of college logos, banners and galleries
DO $$ BEGIN
    CREATE POLICY "Public Read College Assets"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'college-assets');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Allow authenticated staff to upload college assets
DO $$ BEGIN
    CREATE POLICY "Staff Upload College Assets"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'college-assets' AND
            (public.is_admin() OR public.is_counsellor())
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Allow authenticated staff to update/replace college assets
DO $$ BEGIN
    CREATE POLICY "Staff Update College Assets"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (
            bucket_id = 'college-assets' AND
            (public.is_admin() OR public.is_counsellor())
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Allow authenticated staff to delete college assets
DO $$ BEGIN
    CREATE POLICY "Staff Delete College Assets"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
            bucket_id = 'college-assets' AND
            (public.is_admin() OR public.is_counsellor())
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
