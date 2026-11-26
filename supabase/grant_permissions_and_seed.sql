-- ==============================================================================
-- ASPIRANT VISION — POSTGRESQL PERMISSIONS GRANT & INITIAL VERIFIED SEED
-- ==============================================================================
-- 1. Grant table access to Supabase client roles so RLS policies take effect
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 2. Seed Initial Published Premier College
INSERT INTO public.colleges (
    name,
    slug,
    short_description,
    description,
    college_type,
    ownership_type,
    country,
    state,
    city,
    address,
    established_year,
    accreditation,
    admission_status,
    publication_status,
    is_featured,
    seo_title,
    seo_description
) VALUES (
    'Kalinga Institute of Industrial Technology (KIIT)',
    'kiit-university-bhubaneswar',
    'A premier institution recognized as an Institution of Eminence by the Ministry of Education, Government of India.',
    'Kalinga Institute of Industrial Technology (KIIT) is a world-class university located in Bhubaneswar, Odisha. Known for state-of-the-art campus infrastructure, industry-focused engineering and management curricula, and exceptional 100% placement track records.',
    'University',
    'Private',
    'India',
    'Odisha',
    'Bhubaneswar',
    'Patia, Bhubaneswar, Odisha 751024',
    1992,
    'NAAC A++',
    'open',
    'published',
    true,
    'KIIT University Admissions 2026 - Courses, Fees, Placements & Eligibility',
    'Explore KIIT University Bhubaneswar admissions, verified fee structures, eligibility criteria, and highest placement packages.'
)
ON CONFLICT (slug) DO UPDATE SET
    publication_status = 'published',
    is_featured = true;

-- 3. Seed Premier Course
INSERT INTO public.courses (
    name,
    slug,
    degree_type,
    stream,
    duration,
    duration_unit,
    description,
    eligibility,
    category,
    study_mode,
    level,
    publication_status,
    is_featured,
    seo_title,
    seo_description
) VALUES (
    'B.Tech in Computer Science & Engineering',
    'btech-computer-science-and-engineering',
    'B.Tech',
    'Engineering & Technology',
    4.0,
    'years',
    'Flagship 4-year undergraduate program focusing on algorithms, artificial intelligence, software architecture, full-stack engineering, and cloud computing.',
    'Passed 10+2 examination with Physics and Mathematics as compulsory subjects along with one of Chemistry/Biotechnology/Biology with at least 60% marks in aggregate.',
    'Engineering',
    'full_time',
    'undergraduate',
    'published',
    true,
    'B.Tech Computer Science & Engineering - Admissions & Eligibility',
    'Complete guide to B.Tech Computer Science admission, curriculum, eligibility, and top college options.'
)
ON CONFLICT (slug) DO UPDATE SET
    publication_status = 'published',
    is_featured = true;

-- 4. Link College to Course
DO $$
DECLARE
    v_college_id UUID;
    v_course_id UUID;
BEGIN
    SELECT id INTO v_college_id FROM public.colleges WHERE slug = 'kiit-university-bhubaneswar' LIMIT 1;
    SELECT id INTO v_course_id FROM public.courses WHERE slug = 'btech-computer-science-and-engineering' LIMIT 1;

    IF v_college_id IS NOT NULL AND v_course_id IS NOT NULL THEN
        INSERT INTO public.college_courses (
            college_id,
            course_id,
            course_code,
            intake_capacity,
            admission_status,
            is_active
        ) VALUES (
            v_college_id,
            v_course_id,
            'CSE-101',
            360,
            'open',
            true
        )
        ON CONFLICT (college_id, course_id) DO NOTHING;
    END IF;
END $$;
