-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 004 FEE & SCHOLARSHIP DATABASE
-- ==============================================================================

-- 1. COLLEGE FEES TABLE
CREATE TABLE IF NOT EXISTS public.college_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_course_id UUID NOT NULL REFERENCES public.college_courses(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL,
    tuition_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    admission_fee NUMERIC(12, 2) DEFAULT 0.00,
    hostel_fee NUMERIC(12, 2) DEFAULT 0.00,
    other_fees NUMERIC(12, 2) DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    fee_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_college_fees_course_year UNIQUE (college_course_id, academic_year)
);

-- Enable RLS
ALTER TABLE public.college_fees ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_college_fees_updated_at ON public.college_fees;
CREATE TRIGGER trg_college_fees_updated_at
    BEFORE UPDATE ON public.college_fees
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. SCHOLARSHIPS TABLE (College-wide or Course-specific)
CREATE TABLE IF NOT EXISTS public.scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    college_course_id UUID REFERENCES public.college_courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    eligibility TEXT,
    scholarship_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    application_deadline DATE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_scholarships_updated_at ON public.scholarships;
CREATE TRIGGER trg_scholarships_updated_at
    BEFORE UPDATE ON public.scholarships
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
