-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 003 COURSE MANAGEMENT DATABASE
-- ==============================================================================

-- 1. ENUMS FOR COURSES
DO $$ BEGIN
    CREATE TYPE course_status AS ENUM ('active', 'inactive', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE duration_unit AS ENUM ('years', 'months', 'semesters');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    degree_type TEXT NOT NULL,
    stream TEXT NOT NULL,
    duration NUMERIC(4, 1) NOT NULL,
    duration_unit duration_unit NOT NULL DEFAULT 'years',
    description TEXT,
    eligibility TEXT,
    entrance_exam_information TEXT,
    status course_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. COLLEGE COURSES TABLE (Many-to-Many Bridge Table with Academic Overrides)
CREATE TABLE IF NOT EXISTS public.college_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    course_code TEXT,
    intake_capacity INTEGER,
    admission_status admission_status NOT NULL DEFAULT 'open',
    eligibility_override TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_college_courses_college_course UNIQUE (college_id, course_id)
);

-- Enable RLS
ALTER TABLE public.college_courses ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_college_courses_updated_at ON public.college_courses;
CREATE TRIGGER trg_college_courses_updated_at
    BEFORE UPDATE ON public.college_courses
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
