-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 002 COLLEGE MANAGEMENT DATABASE
-- ==============================================================================

-- 1. ENUMS FOR COLLEGES
DO $$ BEGIN
    CREATE TYPE college_publication_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admission_status AS ENUM ('open', 'closing_soon', 'closed', 'upcoming');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. COLLEGES TABLE
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    college_type TEXT,
    ownership_type TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    website_url TEXT,
    email TEXT,
    phone TEXT,
    country TEXT NOT NULL DEFAULT 'India',
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    pincode TEXT,
    established_year INTEGER,
    accreditation TEXT,
    affiliation TEXT,
    ranking_information JSONB DEFAULT '{}'::jsonb,
    average_placement NUMERIC(12, 2),
    highest_placement NUMERIC(12, 2),
    placement_percentage NUMERIC(5, 2),
    admission_status admission_status NOT NULL DEFAULT 'open',
    publication_status college_publication_status NOT NULL DEFAULT 'draft',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    seo_title TEXT,
    seo_description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- Auto updated_at trigger
DROP TRIGGER IF EXISTS trg_colleges_updated_at ON public.colleges;
CREATE TRIGGER trg_colleges_updated_at
    BEFORE UPDATE ON public.colleges
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. COLLEGE CAMPUSES TABLE (1-to-many relationship)
CREATE TABLE IF NOT EXISTS public.college_campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    campus_name TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    pincode TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.college_campuses ENABLE ROW LEVEL SECURITY;

-- Auto updated_at trigger
DROP TRIGGER IF EXISTS trg_college_campuses_updated_at ON public.college_campuses;
CREATE TRIGGER trg_college_campuses_updated_at
    BEFORE UPDATE ON public.college_campuses
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
