"use client";

import React from "react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { Button } from "@/components/ui/button";
import { Sparkles, PhoneCall, GraduationCap } from "lucide-react";

interface CounselingTriggerButtonProps {
  collegeName: string;
  variant?: "primary" | "outline" | "white";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
  showIcon?: boolean;
}

export function CounselingTriggerButton({
  collegeName,
  variant = "primary",
  size = "md",
  className = "",
  label = "Get Free Counselling",
  showIcon = true,
}: CounselingTriggerButtonProps) {
  const { openModal } = useCounselingModal();

  const getVariantStyles = () => {
    switch (variant) {
      case "outline":
        return "border border-[#E31E2B] bg-white text-[#E31E2B] hover:bg-red-50";
      case "white":
        return "bg-white text-[#15182D] hover:bg-gray-100 font-bold border border-gray-200";
      case "primary":
      default:
        return "tactile-btn-red text-white font-bold border-0";
    }
  };

  return (
    <Button
      type="button"
      variant={variant === "primary" ? "primary" : "outline"}
      size={size}
      onClick={() => openModal(`Admission Guidance: ${collegeName}`)}
      className={`${getVariantStyles()} ${className}`}
    >
      {showIcon && <Sparkles className="w-4 h-4 mr-1.5" />}
      <span>{label}</span>
    </Button>
  );
}
