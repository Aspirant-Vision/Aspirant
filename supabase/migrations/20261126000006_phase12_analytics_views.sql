-- ==============================================================================
-- ASPIRANT VISION — PHASE 12: ANALYTICS, REPORTING & PERFORMANCE DASHBOARDS
-- ==============================================================================

-- 1. HIGH-PERFORMANCE ANALYTICS INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_counsellor ON public.leads(assigned_counsellor_id);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON public.applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_applications_college_id ON public.applications(college_id);
CREATE INDEX IF NOT EXISTS idx_applications_college_course_id ON public.applications(college_course_id);
CREATE INDEX IF NOT EXISTS idx_admissions_admission_date ON public.admissions(admission_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_counsellor_status ON public.follow_ups(counsellor_id, status);
CREATE INDEX IF NOT EXISTS idx_lead_activities_actor ON public.lead_activities(actor_id, activity_type);

-- 2. SECURE ANALYTICS RPC FUNCTIONS
-- All functions run with fixed search_path to prevent security vulnerabilities.

-- A. Leads Summary & Funnel RPC
CREATE OR REPLACE FUNCTION public.get_analytics_leads_funnel(
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_counsellor_id UUID DEFAULT NULL
)
RETURNS TABLE (
    total_leads BIGINT,
    new_leads BIGINT,
    contacted_leads BIGINT,
    interested_leads BIGINT,
    apps_started BIGINT,
    apps_submitted BIGINT,
    admitted_leads BIGINT,
    lost_leads BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_leads,
        COUNT(*) FILTER (WHERE status = 'new')::BIGINT AS new_leads,
        COUNT(*) FILTER (WHERE status = 'contacted')::BIGINT AS contacted_leads,
        COUNT(*) FILTER (WHERE status = 'interested')::BIGINT AS interested_leads,
        COUNT(*) FILTER (WHERE status = 'application_started')::BIGINT AS apps_started,
        COUNT(*) FILTER (WHERE status = 'application_submitted')::BIGINT AS apps_submitted,
        COUNT(*) FILTER (WHERE status = 'admitted')::BIGINT AS admitted_leads,
        COUNT(*) FILTER (WHERE status IN ('not_interested', 'lost'))::BIGINT AS lost_leads
    FROM public.leads
    WHERE created_at >= p_start_date
      AND created_at <= p_end_date
      AND (p_counsellor_id IS NULL OR assigned_counsellor_id = p_counsellor_id);
END;
$$;

-- B. Counsellor Performance Summary RPC
CREATE OR REPLACE FUNCTION public.get_counsellor_performance_summary(
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_counsellor_id UUID DEFAULT NULL
)
RETURNS TABLE (
    counsellor_id UUID,
    full_name TEXT,
    email TEXT,
    assigned_leads BIGINT,
    contacted_leads BIGINT,
    interested_leads BIGINT,
    admitted_leads BIGINT,
    completed_followups BIGINT,
    overdue_followups BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id AS counsellor_id,
        COALESCE(p.full_name, 'Counsellor') AS full_name,
        p.email,
        COUNT(DISTINCT l.id)::BIGINT AS assigned_leads,
        COUNT(DISTINCT l.id) FILTER (WHERE l.status IN ('contacted', 'interested', 'application_started', 'application_submitted', 'admitted'))::BIGINT AS contacted_leads,
        COUNT(DISTINCT l.id) FILTER (WHERE l.status IN ('interested', 'application_started', 'application_submitted', 'admitted'))::BIGINT AS interested_leads,
        COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'admitted')::BIGINT AS admitted_leads,
        (
            SELECT COUNT(*)::BIGINT
            FROM public.follow_ups f
            WHERE f.counsellor_id = p.id
              AND f.status = 'completed'
              AND f.updated_at >= p_start_date
              AND f.updated_at <= p_end_date
        ) AS completed_followups,
        (
            SELECT COUNT(*)::BIGINT
            FROM public.follow_ups f
            WHERE f.counsellor_id = p.id
              AND f.status = 'pending'
              AND f.scheduled_at < NOW()
        ) AS overdue_followups
    FROM public.profiles p
    LEFT JOIN public.leads l 
      ON l.assigned_counsellor_id = p.id
     AND l.created_at >= p_start_date
     AND l.created_at <= p_end_date
    WHERE (p.role = 'counsellor' OR EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = p.id AND ur.role = 'counsellor'
    ))
    AND (p_counsellor_id IS NULL OR p.id = p_counsellor_id)
    GROUP BY p.id, p.full_name, p.email
    ORDER BY assigned_leads DESC;
END;
$$;

-- C. College & Course Demand Leaderboard RPC
CREATE OR REPLACE FUNCTION public.get_college_demand_leaderboard(
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    college_id UUID,
    college_name TEXT,
    college_city TEXT,
    college_state TEXT,
    leads_count BIGINT,
    applications_count BIGINT,
    admissions_count BIGINT,
    shortlists_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS college_id,
        c.name AS college_name,
        COALESCE(c.city, '') AS college_city,
        COALESCE(c.state, '') AS college_state,
        COUNT(DISTINCT l.id)::BIGINT AS leads_count,
        COUNT(DISTINCT a.id)::BIGINT AS applications_count,
        COUNT(DISTINCT adm.id)::BIGINT AS admissions_count,
        COUNT(DISTINCT s.id)::BIGINT AS shortlists_count
    FROM public.colleges c
    LEFT JOIN public.leads l 
      ON l.interested_college_id = c.id
     AND l.created_at >= p_start_date
     AND l.created_at <= p_end_date
    LEFT JOIN public.applications a 
      ON a.college_id = c.id
     AND a.created_at >= p_start_date
     AND a.created_at <= p_end_date
    LEFT JOIN public.admissions adm 
      ON adm.college_id = c.id
     AND adm.created_at >= p_start_date
     AND adm.created_at <= p_end_date
    LEFT JOIN public.student_shortlists s 
      ON s.college_id = c.id
     AND s.created_at >= p_start_date
     AND s.created_at <= p_end_date
    GROUP BY c.id, c.name, c.city, c.state
    ORDER BY (COUNT(DISTINCT l.id) + COUNT(DISTINCT a.id) * 2 + COUNT(DISTINCT adm.id) * 3) DESC
    LIMIT p_limit;
END;
$$;

-- Grant execution to authenticated users (functions internally scope permissions)
GRANT EXECUTE ON FUNCTION public.get_analytics_leads_funnel TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_counsellor_performance_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_college_demand_leaderboard TO authenticated;
