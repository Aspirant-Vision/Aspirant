-- ==============================================================================
-- ASPIRANT VISION — PHASE 10: REALTIME NOTIFICATIONS, PREFERENCES & FOLLOW-UP REMINDERS
-- ==============================================================================

-- 1. EXTEND NOTIFICATIONS TABLE
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general',
    ADD COLUMN IF NOT EXISTS destination_url TEXT,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create high-performance indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id 
    ON public.notifications(recipient_id);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read 
    ON public.notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
    ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_category 
    ON public.notifications(category);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread 
    ON public.notifications(recipient_id, is_read) 
    WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_related_entity 
    ON public.notifications(related_entity_type, related_entity_id);

-- 2. NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    reminder_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_notification_preferences_user_category UNIQUE (user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id 
    ON public.notification_preferences(user_id);

-- Enable RLS on preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users manage their own notification preferences"
    ON public.notification_preferences
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Trigger for updated_at on notification_preferences
DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER trg_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. FOLLOW-UP REMINDER IDEMPOTENCY & AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.follow_up_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follow_up_id UUID NOT NULL REFERENCES public.follow_ups(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL, -- 'upcoming_24h', 'due_today', 'overdue', 'missed'
    idempotency_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'skipped', 'failed'
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_follow_up_id 
    ON public.follow_up_reminders(follow_up_id);

CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_recipient_id 
    ON public.follow_up_reminders(recipient_id);

CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_idempotency_key 
    ON public.follow_up_reminders(idempotency_key);

-- Enable RLS on follow_up_reminders
ALTER TABLE public.follow_up_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view reminder logs" ON public.follow_up_reminders;
CREATE POLICY "Staff can view reminder logs"
    ON public.follow_up_reminders
    FOR SELECT
    TO authenticated
    USING (public.is_staff() OR public.is_admin());

-- 4. ENSURE SERVICE ROLE / STAFF NOTIFICATION INSERT PERMISSIONS
-- Drop and recreate notification RLS policy to allow users to read/update their own,
-- and admins/counsellors or triggers to insert notifications
DROP POLICY IF EXISTS "Users manage their own notifications" ON public.notifications;

CREATE POLICY "Users can select own notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (recipient_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
    ON public.notifications
    FOR DELETE
    TO authenticated
    USING (recipient_id = auth.uid());

CREATE POLICY "Staff and users can insert notifications"
    ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (
        recipient_id = auth.uid() 
        OR public.is_staff() 
        OR public.is_admin()
    );

-- 5. REALTIME PUBLICATION CONFIGURATION
-- Ensure notifications table is part of the supabase_realtime publication
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_object THEN null;
END $$;

-- Set REPLICA IDENTITY FULL so UPDATE / DELETE payloads include full previous data
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
