import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

export function Logo({ className, inverted = false }: LogoProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center group select-none shrink-0", className)}>
      <div className="relative h-10 w-44 sm:h-12 sm:w-52 transition-transform duration-200 group-hover:scale-[1.02]">
        <Image
          src={
            inverted
              ? "/images/logo/aspirant_logo_dark.png"
              : "/images/logo/aspirant_logo_main.png"
          }
          alt="Aspirant Vision - Empowering Success"
          fill
          priority
          className="object-contain object-left"
          sizes="(max-width: 640px) 180px, 220px"
        />
      </div>
    </Link>
  );
}
