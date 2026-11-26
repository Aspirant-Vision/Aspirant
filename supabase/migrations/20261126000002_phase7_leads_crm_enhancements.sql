-- ==============================================================================
-- ASPIRANT VISION — PHASE 07: LEAD MANAGEMENT & COUNSELLING CRM ENHANCEMENTS
-- ==============================================================================

-- 1. ENHANCE LEADS TABLE
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS preferred_location TEXT,
  ADD COLUMN IF NOT EXISTS current_qualification TEXT,
  ADD COLUMN IF NOT EXISTS passing_year INTEGER,
  ADD COLUMN IF NOT EXISTS landing_page TEXT,
  ADD COLUMN IF NOT EXISTS referring_page TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_params JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS lost_reason TEXT,
  ADD COLUMN IF NOT EXISTS status_reason TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. ENHANCE FOLLOW_UPS TABLE
ALTER TABLE public.follow_ups
  ADD COLUMN IF NOT EXISTS priority lead_priority NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS completion_notes TEXT;

-- 3. ENHANCE LEAD_ACTIVITIES TABLE
ALTER TABLE public.lead_activities
  ADD COLUMN IF NOT EXISTS is_internal BOOLEAN NOT NULL DEFAULT true;

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_interested_college ON public.leads(interested_college_id);
CREATE INDEX IF NOT EXISTS idx_leads_interested_course ON public.leads(interested_course_id);
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at ON public.leads(deleted_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_lead ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due_date ON public.follow_ups(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_priority ON public.follow_ups(priority);
CREATE INDEX IF NOT EXISTS idx_lead_activities_actor ON public.lead_activities(actor_id);
