"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffInviteSchema, StaffInviteInput } from "@/lib/validation/auth";
import { sendStaffInviteAction } from "@/lib/auth/actions";
import { UserPlus, Loader2, AlertCircle, CheckCircle2, Copy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InviteStaffForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [invitedResult, setInvitedResult] = useState<{
    email: string;
    invitationUrl: string;
    expiresAt: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffInviteInput>({
    resolver: zodResolver(staffInviteSchema),
    defaultValues: {
      email: "",
      role: "counsellor",
    },
  });

  const onSubmit = async (data: StaffInviteInput) => {
    try {
      setServerError(null);
      setIsSubmitting(true);
      setInvitedResult(null);

      const result = await sendStaffInviteAction(data);

      if (!result.success) {
        setServerError(result.error.message || "Failed to create staff invitation.");
        setIsSubmitting(false);
        return;
      }

      setInvitedResult(result.data);
      setIsSubmitting(false);
      reset();
    } catch (err: unknown) {
      console.error("Invite staff error:", err);
      setServerError("An unexpected error occurred while sending invite.");
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (invitedResult?.invitationUrl) {
      navigator.clipboard.writeText(invitedResult.invitationUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">Invite Admin / Counsellor</h3>
          <p className="text-xs text-gray-500">
            Generate a secure, single-use 48-hour invitation link to onboard an Administrator or Admission Counsellor.
          </p>
        </div>
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 font-medium">{serverError}</div>
        </div>
      )}

      {invitedResult && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Invitation successfully generated for {invitedResult.email}!</span>
          </div>
          <div className="text-[11px] text-gray-600">
            This invitation expires in 48 hours ({new Date(invitedResult.expiresAt).toLocaleString()}).
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={invitedResult.invitationUrl}
              className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="text-xs"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              <span>{isCopied ? "Copied!" : "Copy Link"}</span>
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="inviteEmail">
              Official Administrator / Counsellor Email <span className="text-red-500">*</span>
            </label>
            <input
              id="inviteEmail"
              type="email"
              placeholder="colleague@aspirantvision.com"
              {...register("email")}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all ${
                errors.email ? "border-red-500" : "border-gray-200 focus:border-red-500 hover:border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="inviteRole">
              Assigned Role <span className="text-red-500">*</span>
            </label>
            <select
              id="inviteRole"
              {...register("role")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer hover:border-gray-300"
            >
              <option value="counsellor">Admission Counsellor (CRM & Leads access)</option>
              <option value="admin">Administrator (Colleges, Leads & Reports access)</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="text-xs font-semibold py-2.5 px-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                <span>Generating Invitation...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 mr-2" />
                <span>Send Admin Invitation</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
