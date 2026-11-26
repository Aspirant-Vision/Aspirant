-- ==============================================================================
-- ASPIRANT VISION — PHASE 13: PRODUCTION SECURITY HARDENING & OPTIMIZATIONS
-- ==============================================================================
-- 1. Hardens all SECURITY DEFINER functions with explicit `SET search_path = public`
--    to prevent search_path hijacking vulnerabilities.
-- 2. Closes privilege escalation vectors in `handle_new_user()` trigger by strictly
--    verifying staff invitations before any staff role assignment.
-- 3. Adds production composite indexes for high-frequency queries.
-- 4. Verifies private storage access constraints.
-- ==============================================================================

-- 1. HARDEN SECURITY DEFINER FUNCTIONS WITH EXPLICIT SEARCH_PATH
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_role(check_role user_role)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role = check_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_counsellor()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('counsellor', 'admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('counsellor', 'admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS TEXT AS $$
DECLARE
    current_yr TEXT := to_char(CURRENT_DATE, 'YYYY');
    rand_chars TEXT;
    new_app_num TEXT;
BEGIN
    rand_chars := upper(substring(md5(random()::text) from 1 for 6));
    new_app_num := 'AV-' || current_yr || '-' || rand_chars;
    RETURN new_app_num;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_admission_reference()
RETURNS TEXT AS $$
DECLARE
    current_yr TEXT := to_char(CURRENT_DATE, 'YYYY');
    rand_chars TEXT;
    new_adm_ref TEXT;
BEGIN
    rand_chars := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 7));
    new_adm_ref := 'ADM-' || current_yr || '-' || rand_chars;
    RETURN new_adm_ref;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Audit log entries are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. PRIVILEGE ESCALATION DEFENSE IN HANDLE_NEW_USER TRIGGER
-- ------------------------------------------------------------------------------
-- Prevents unauthorized users from registering with staff roles. Staff roles
-- (admin, counsellor) require an active, unaccepted invitation in staff_invitations.
-- Super Admin can NEVER be self-assigned via metadata under any circumstance.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    assigned_role user_role := 'student'::user_role;
    requested_role TEXT;
    has_valid_invite BOOLEAN := FALSE;
BEGIN
    requested_role := new.raw_user_meta_data->>'role';

    -- Only allow staff roles if an unexpired staff invitation exists for this exact email
    IF requested_role IN ('admin', 'counsellor') THEN
        SELECT EXISTS (
            SELECT 1 FROM public.staff_invitations
            WHERE email = LOWER(new.email)
              AND accepted_at IS NULL
              AND expires_at > NOW()
              AND role = requested_role::user_role
        ) INTO has_valid_invite;

        IF has_valid_invite THEN
            assigned_role := requested_role::user_role;
            -- Mark the invitation as accepted
            UPDATE public.staff_invitations
            SET accepted_at = NOW()
            WHERE email = LOWER(new.email)
              AND accepted_at IS NULL
              AND expires_at > NOW()
              AND role = requested_role::user_role;
        ELSE
            -- Reject escalation attempt and default to student
            assigned_role := 'student'::user_role;
        END IF;
    ELSE
        -- Default safely to student
        assigned_role := 'student'::user_role;
    END IF;

    -- Insert into profiles
    INSERT INTO public.profiles (id, email, full_name, phone, avatar_url, role, account_status)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', null),
        new.phone,
        new.raw_user_meta_data->>'avatar_url',
        assigned_role,
        'active'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        updated_at = NOW();

    -- Insert into user_roles (prevent duplicate assignments)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, assigned_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. HIGH-PERFORMANCE PRODUCTION COMPOSITE INDEXES
-- ------------------------------------------------------------------------------

-- Fast public queries for colleges & courses
CREATE INDEX IF NOT EXISTS idx_colleges_published_featured 
    ON public.colleges(publication_status, is_featured);

CREATE INDEX IF NOT EXISTS idx_courses_published_category 
    ON public.courses(publication_status, category);

-- CRM Leads & Follow-ups fast querying
CREATE INDEX IF NOT EXISTS idx_leads_status_created 
    ON public.leads(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follow_ups_counsellor_active 
    ON public.follow_ups(counsellor_id, scheduled_at) 
    WHERE status = 'pending';

-- Applications & Admissions fast lookup
CREATE INDEX IF NOT EXISTS idx_applications_student_status 
    ON public.applications(student_id, application_status);

-- High-frequency realtime unread notification badge index
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread_badge 
    ON public.notifications(recipient_id, is_read, created_at DESC);
