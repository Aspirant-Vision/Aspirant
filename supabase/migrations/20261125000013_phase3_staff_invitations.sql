-- ==============================================================================
-- ASPIRANT VISION — PHASE 03: 013 STAFF INVITATIONS & PROVISIONING
-- ==============================================================================
-- Enables authorized administrators to invite new staff (admins, counsellors)
-- with expiring cryptographic tokens. Prohibits public admin registration.
-- ==============================================================================

-- 1. STAFF INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.staff_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role user_role NOT NULL CHECK (role IN ('admin', 'counsellor')),
    token TEXT NOT NULL UNIQUE,
    invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for instant token lookup
CREATE INDEX IF NOT EXISTS idx_staff_invitations_token ON public.staff_invitations(token);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_email ON public.staff_invitations(email);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_active ON public.staff_invitations(token, expires_at) WHERE accepted_at IS NULL;

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.staff_invitations ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES
DROP POLICY IF EXISTS "Admins can view and manage staff invitations" ON public.staff_invitations;
CREATE POLICY "Admins can view and manage staff invitations"
    ON public.staff_invitations
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can validate invitation with exact token" ON public.staff_invitations;
CREATE POLICY "Anyone can validate invitation with exact token"
    ON public.staff_invitations
    FOR SELECT
    TO anon, authenticated
    USING (accepted_at IS NULL AND expires_at > NOW());
