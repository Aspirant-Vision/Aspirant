-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 012 ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Strictly enforces multi-tenant RBAC:
-- - Super Admin: Full administrative sovereignty
-- - Admin: Operational CRUD (Colleges, Courses, Fees, CRM, Admissions)
-- - Counsellor: Assigned Leads, Scheduled Follow-ups, Review Applications
-- - Student: Self-managed Profile, Preferences, Shortlists, Applications
-- - Public / Anon: Read published colleges, courses, campuses, fees, scholarships; Submit enquiries
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USER ROLES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
CREATE POLICY "Admins can view all user roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins can manage user roles" ON public.user_roles;
CREATE POLICY "Super admins can manage user roles"
    ON public.user_roles
    FOR ALL
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- ------------------------------------------------------------------------------
-- 2. COLLEGES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view published non-deleted colleges" ON public.colleges;
CREATE POLICY "Public can view published non-deleted colleges"
    ON public.colleges
    FOR SELECT
    TO anon, authenticated
    USING (publication_status = 'published' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admins and counsellors can view all colleges" ON public.colleges;
CREATE POLICY "Admins and counsellors can view all colleges"
    ON public.colleges
    FOR SELECT
    TO authenticated
    USING (public.is_counsellor());

DROP POLICY IF EXISTS "Admins have full CRUD on colleges" ON public.colleges;
CREATE POLICY "Admins have full CRUD on colleges"
    ON public.colleges
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. COLLEGE CAMPUSES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view campuses of published colleges" ON public.college_campuses;
CREATE POLICY "Public can view campuses of published colleges"
    ON public.college_campuses
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.colleges c
            WHERE c.id = college_campuses.college_id
              AND c.publication_status = 'published'
              AND c.deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Admins can manage campuses" ON public.college_campuses;
CREATE POLICY "Admins can manage campuses"
    ON public.college_campuses
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. COURSES & COLLEGE COURSES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active courses" ON public.courses;
CREATE POLICY "Public can view active courses"
    ON public.courses
    FOR SELECT
    TO anon, authenticated
    USING (status = 'active');

DROP POLICY IF EXISTS "Admins have full CRUD on courses" ON public.courses;
CREATE POLICY "Admins have full CRUD on courses"
    ON public.courses
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view published college courses" ON public.college_courses;
CREATE POLICY "Public can view published college courses"
    ON public.college_courses
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.colleges c
            WHERE c.id = college_courses.college_id
              AND c.publication_status = 'published'
              AND c.deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Admins have full CRUD on college courses" ON public.college_courses;
CREATE POLICY "Admins have full CRUD on college courses"
    ON public.college_courses
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. FEES & SCHOLARSHIPS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view fees of published college courses" ON public.college_fees;
CREATE POLICY "Public can view fees of published college courses"
    ON public.college_fees
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.college_courses cc
            JOIN public.colleges c ON c.id = cc.college_id
            WHERE cc.id = college_fees.college_course_id
              AND c.publication_status = 'published'
              AND c.deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Admins have full CRUD on college fees" ON public.college_fees;
CREATE POLICY "Admins have full CRUD on college fees"
    ON public.college_fees
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view active scholarships" ON public.scholarships;
CREATE POLICY "Public can view active scholarships"
    ON public.scholarships
    FOR SELECT
    TO anon, authenticated
    USING (status = 'active');

DROP POLICY IF EXISTS "Admins have full CRUD on scholarships" ON public.scholarships;
CREATE POLICY "Admins have full CRUD on scholarships"
    ON public.scholarships
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. LEADS & CRM POLICIES
-- ------------------------------------------------------------------------------
-- Anyone (including anonymous prospective students) can submit a lead enquiry
DROP POLICY IF EXISTS "Public can submit lead enquiry" ON public.leads;
CREATE POLICY "Public can submit lead enquiry"
    ON public.leads
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Students can view their own submitted leads
DROP POLICY IF EXISTS "Students can view own leads" ON public.leads;
CREATE POLICY "Students can view own leads"
    ON public.leads
    FOR SELECT
    TO authenticated
    USING (student_user_id = auth.uid());

-- Counsellors can view & update assigned leads
DROP POLICY IF EXISTS "Counsellors can view assigned leads" ON public.leads;
CREATE POLICY "Counsellors can view assigned leads"
    ON public.leads
    FOR SELECT
    TO authenticated
    USING (
        assigned_counsellor_id = auth.uid()
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.lead_assignments la
            WHERE la.lead_id = leads.id
              AND la.counsellor_id = auth.uid()
              AND la.assignment_status = 'active'
        )
    );

DROP POLICY IF EXISTS "Counsellors can update assigned leads" ON public.leads;
CREATE POLICY "Counsellors can update assigned leads"
    ON public.leads
    FOR UPDATE
    TO authenticated
    USING (
        assigned_counsellor_id = auth.uid()
        OR public.is_admin()
    )
    WITH CHECK (
        assigned_counsellor_id = auth.uid()
        OR public.is_admin()
    );

-- Admins have full management access on leads
DROP POLICY IF EXISTS "Admins have full access to leads" ON public.leads;
CREATE POLICY "Admins have full access to leads"
    ON public.leads
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Lead Assignments & Activities
DROP POLICY IF EXISTS "Staff can view lead assignments" ON public.lead_assignments;
CREATE POLICY "Staff can view lead assignments"
    ON public.lead_assignments
    FOR SELECT
    TO authenticated
    USING (counsellor_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage lead assignments" ON public.lead_assignments;
CREATE POLICY "Admins can manage lead assignments"
    ON public.lead_assignments
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Staff can view lead activities" ON public.lead_activities;
CREATE POLICY "Staff can view lead activities"
    ON public.lead_activities
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.leads l
            WHERE l.id = lead_activities.lead_id
              AND (l.assigned_counsellor_id = auth.uid() OR l.student_user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Staff can insert lead activities" ON public.lead_activities;
CREATE POLICY "Staff can insert lead activities"
    ON public.lead_activities
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_counsellor());

-- Follow Ups
DROP POLICY IF EXISTS "Counsellors can view and manage assigned follow-ups" ON public.follow_ups;
CREATE POLICY "Counsellors can view and manage assigned follow-ups"
    ON public.follow_ups
    FOR ALL
    TO authenticated
    USING (counsellor_id = auth.uid() OR public.is_admin())
    WITH CHECK (counsellor_id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. STUDENT MANAGEMENT POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students manage own preferences" ON public.student_preferences;
CREATE POLICY "Students manage own preferences"
    ON public.student_preferences
    FOR ALL
    TO authenticated
    USING (student_id = auth.uid() OR public.is_admin())
    WITH CHECK (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Students manage own shortlists" ON public.student_shortlists;
CREATE POLICY "Students manage own shortlists"
    ON public.student_shortlists
    FOR ALL
    TO authenticated
    USING (student_id = auth.uid() OR public.is_admin())
    WITH CHECK (student_id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 8. APPLICATIONS & DOCUMENTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can view own applications" ON public.applications;
CREATE POLICY "Students can view own applications"
    ON public.applications
    FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR assigned_counsellor_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Students can create own applications" ON public.applications;
CREATE POLICY "Students can create own applications"
    ON public.applications
    FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students and staff can update applications" ON public.applications;
CREATE POLICY "Students and staff can update applications"
    ON public.applications
    FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid() OR assigned_counsellor_id = auth.uid() OR public.is_admin())
    WITH CHECK (student_id = auth.uid() OR assigned_counsellor_id = auth.uid() OR public.is_admin());

-- Application Documents
DROP POLICY IF EXISTS "Application documents view policy" ON public.application_documents;
CREATE POLICY "Application documents view policy"
    ON public.application_documents
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_documents.application_id
              AND (a.student_id = auth.uid() OR a.assigned_counsellor_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Students can upload application documents" ON public.application_documents;
CREATE POLICY "Students can upload application documents"
    ON public.application_documents
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_documents.application_id
              AND a.student_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can verify application documents" ON public.application_documents;
CREATE POLICY "Staff can verify application documents"
    ON public.application_documents
    FOR UPDATE
    TO authenticated
    USING (public.is_counsellor())
    WITH CHECK (public.is_counsellor());

-- ------------------------------------------------------------------------------
-- 9. ADMISSIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admissions view policy" ON public.admissions;
CREATE POLICY "Admissions view policy"
    ON public.admissions
    FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR public.is_counsellor());

DROP POLICY IF EXISTS "Admins can manage admissions" ON public.admissions;
CREATE POLICY "Admins can manage admissions"
    ON public.admissions
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 10. NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users manage their own notifications" ON public.notifications;
CREATE POLICY "Users manage their own notifications"
    ON public.notifications
    FOR ALL
    TO authenticated
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 11. AUDIT LOGS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Staff can insert audit logs" ON public.audit_logs;
CREATE POLICY "Staff can insert audit logs"
    ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_counsellor());
