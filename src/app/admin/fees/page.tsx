import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/crm/page-header";
import { MetricCard } from "@/components/crm/metric-card";
import { Button } from "@/components/ui/button";
import { IndianRupee, Plus, CreditCard, Layers } from "lucide-react";
import { getFeesListingAction } from "@/lib/course/actions";
import { FeeTableClient } from "@/components/crm/fee-table-client";

export default async function AdminFeesPage() {
  await requireAdmin("/admin/login");

  const supabase = await createClient();
  const { count } = await supabase.from("college_fees").select("*", { count: "exact", head: true });
  const totalCount = count ?? 0;

  const initialFees = await getFeesListingAction({ page: 1, pageSize: 10 });
  const fees = initialFees.success && initialFees.data ? initialFees.data.fees : [];
  const initialTotal = initialFees.success && initialFees.data ? initialFees.data.totalCount : totalCount;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Fees Matrix" }]}
        title="College Tuition & Fee Structures"
        description="Configure institutional tuition rates, hostel & mess charges, laboratory fees, and installment schedules."
      >
        <Link href="/admin/fees/new">
          <Button size="sm" className="text-xs bg-[#E31E2B] hover:bg-[#c91824] text-white">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Fee Structure</span>
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Recorded Fee Schedules"
          value={totalCount}
          icon={IndianRupee}
          colorVariant="emerald"
          subtitle="All academic years"
        />
        <MetricCard
          title="Payment Models"
          value="Annual & Semester"
          icon={CreditCard}
          colorVariant="blue"
          subtitle="Flexible installments"
        />
        <MetricCard
          title="Fee Breakdown"
          value="Tuition, Hostel & Labs"
          icon={Layers}
          colorVariant="amber"
          subtitle="Transparent disclosure"
        />
      </div>

      <FeeTableClient initialFees={fees} initialTotal={initialTotal} />
    </div>
  );
}
