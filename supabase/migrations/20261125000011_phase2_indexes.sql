-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 011 PERFORMANCE INDEXING
-- ==============================================================================

-- 1. COLLEGES & CAMPUSES INDEXES
CREATE INDEX IF NOT EXISTS idx_colleges_slug ON public.colleges(slug);
CREATE INDEX IF NOT EXISTS idx_colleges_pub_status ON public.colleges(publication_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_colleges_location ON public.colleges(state, city);
CREATE INDEX IF NOT EXISTS idx_colleges_type ON public.colleges(college_type);
CREATE INDEX IF NOT EXISTS idx_colleges_featured ON public.colleges(is_featured) WHERE publication_status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_colleges_created_by ON public.colleges(created_by);

CREATE INDEX IF NOT EXISTS idx_college_campuses_college ON public.college_campuses(college_id);
CREATE INDEX IF NOT EXISTS idx_college_campuses_location ON public.college_campuses(state, city);

-- 2. COURSES & COLLEGE-COURSES INDEXES
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_stream ON public.courses(stream);
CREATE INDEX IF NOT EXISTS idx_courses_degree_type ON public.courses(degree_type);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);

CREATE INDEX IF NOT EXISTS idx_college_courses_college ON public.college_courses(college_id);
CREATE INDEX IF NOT EXISTS idx_college_courses_course ON public.college_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_college_courses_adm_status ON public.college_courses(admission_status);

-- 3. FEES & SCHOLARSHIPS INDEXES
CREATE INDEX IF NOT EXISTS idx_college_fees_course ON public.college_fees(college_course_id);
CREATE INDEX IF NOT EXISTS idx_college_fees_year ON public.college_fees(academic_year);

CREATE INDEX IF NOT EXISTS idx_scholarships_college ON public.scholarships(college_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_course ON public.scholarships(college_course_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_status ON public.scholarships(status);

-- 4. LEADS & CRM INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_student ON public.leads(student_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_counsellor ON public.leads(assigned_counsellor_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email_phone ON public.leads(email, phone);

CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead ON public.lead_assignments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_counsellor ON public.lead_assignments(counsellor_id, assignment_status);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON public.lead_activities(lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follow_ups_counsellor_status ON public.follow_ups(counsellor_id, status);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled_at ON public.follow_ups(scheduled_at) WHERE status = 'pending';

-- 5. STUDENT MANAGEMENT INDEXES
CREATE INDEX IF NOT EXISTS idx_student_preferences_student ON public.student_preferences(student_id);
CREATE INDEX IF NOT EXISTS idx_student_shortlists_student ON public.student_shortlists(student_id);
CREATE INDEX IF NOT EXISTS idx_student_shortlists_college ON public.student_shortlists(college_id);

-- 6. APPLICATIONS & ADMISSIONS INDEXES
CREATE INDEX IF NOT EXISTS idx_applications_number ON public.applications(application_number);
CREATE INDEX IF NOT EXISTS idx_applications_student ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_college ON public.applications(college_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(application_status);
CREATE INDEX IF NOT EXISTS idx_applications_counsellor ON public.applications(assigned_counsellor_id);

CREATE INDEX IF NOT EXISTS idx_app_documents_application ON public.application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_app_documents_status ON public.application_documents(verification_status);

CREATE INDEX IF NOT EXISTS idx_admissions_application ON public.admissions(application_id);
CREATE INDEX IF NOT EXISTS idx_admissions_student ON public.admissions(student_id);
CREATE INDEX IF NOT EXISTS idx_admissions_college ON public.admissions(college_id);
CREATE INDEX IF NOT EXISTS idx_admissions_reference ON public.admissions(admission_reference);

-- 7. NOTIFICATIONS & AUDIT INDEXES
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON public.notifications(recipient_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);
