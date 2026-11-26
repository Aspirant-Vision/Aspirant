-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 001 USER MANAGEMENT & ROLE-BASED ACCESS
-- ==============================================================================

-- 1. ACCOUNT STATUS ENUM
DO $$ BEGIN
    CREATE TYPE account_status AS ENUM ('active', 'suspended', 'pending_verification', 'deactivated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. ENSURE PROFILES TABLE MATCHES SPECIFICATION
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status account_status NOT NULL DEFAULT 'active';

-- 3. USER ROLES TABLE (Decoupled RBAC preventing self-privilege escalation)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. SECURITY DEFINER HELPER FUNCTIONS FOR TRUSTED RBAC
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 5. AUTOMATED TRIGGER: POPULATE PROFILE AND DEFAULT STUDENT ROLE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    assigned_role user_role;
BEGIN
    assigned_role := COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role);

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
$$ LANGUAGE plpgsql SECURITY DEFINER;
