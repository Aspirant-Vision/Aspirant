-- ==============================================================================
-- ASPIRANT VISION — PHASE 02: 010 AUDIT LOGGING DATABASE
-- ==============================================================================

-- 1. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address_if_appropriate TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Block all UPDATE and DELETE operations on audit_logs (append-only ledger)
CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Audit log entries are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_mutation ON public.audit_logs;
CREATE TRIGGER trg_prevent_audit_log_mutation
    BEFORE UPDATE OR DELETE ON public.audit_logs
    FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_mutation();
