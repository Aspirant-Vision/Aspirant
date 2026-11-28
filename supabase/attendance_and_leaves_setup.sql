-- ==============================================================================
-- ASPIRANT VISION — COUNSELLOR ATTENDANCE, SALARY & LEAVE MANAGEMENT SCHEMA
-- ==============================================================================

-- 1. Counsellor Daily Attendance Table
CREATE TABLE IF NOT EXISTS public.counsellor_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counsellor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    clock_in_time TIMESTAMPTZ,
    clock_out_time TIMESTAMPTZ,
    total_hours NUMERIC(4,2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'half_day', 'absent', 'on_leave')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_counsellor_daily_attendance UNIQUE (counsellor_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_counsellor_attendance_date ON public.counsellor_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_counsellor_attendance_counsellor ON public.counsellor_attendance(counsellor_id);

-- 2. Counsellor Leave Applications Table
CREATE TABLE IF NOT EXISTS public.counsellor_leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counsellor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('casual', 'sick', 'paid', 'emergency', 'unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_counsellor_leaves_counsellor ON public.counsellor_leaves(counsellor_id);
CREATE INDEX IF NOT EXISTS idx_counsellor_leaves_status ON public.counsellor_leaves(status);

-- 3. Counsellor Compensation & Salary Configuration Table
CREATE TABLE IF NOT EXISTS public.counsellor_salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counsellor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    base_salary NUMERIC(10,2) NOT NULL DEFAULT 45000.00,
    incentive_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    conversions_bonus NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    deductions NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    net_payable NUMERIC(10,2) NOT NULL DEFAULT 45000.00,
    payment_status TEXT NOT NULL DEFAULT 'approved' CHECK (payment_status IN ('pending', 'approved', 'disbursed')),
    pay_frequency TEXT NOT NULL DEFAULT 'monthly',
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_counsellor_salaries_counsellor ON public.counsellor_salaries(counsellor_id);

-- 4. Grant Permissions to standard roles
GRANT ALL ON TABLE public.counsellor_attendance TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.counsellor_leaves TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.counsellor_salaries TO anon, authenticated, service_role;

-- 5. Seed Initial Attendance Record for existing staff
INSERT INTO public.counsellor_salaries (counsellor_id, base_salary, incentive_rate, conversions_bonus, net_payable, payment_status)
SELECT 
    p.id, 
    48000.00, 
    7.50, 
    12500.00, 
    60500.00, 
    'approved'
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'counsellor'
ON CONFLICT (counsellor_id) DO NOTHING;
