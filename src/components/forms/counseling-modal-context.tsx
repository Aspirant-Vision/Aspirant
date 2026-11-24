"use client";

import React, { createContext, useContext, useState } from "react";
import { CounselingModal } from "./counseling-modal";

interface CounselingModalContextType {
  isOpen: boolean;
  openModal: (collegePref?: string) => void;
  closeModal: () => void;
  collegePref: string;
}

const CounselingModalContext = createContext<CounselingModalContextType | undefined>(undefined);

export function CounselingModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [collegePref, setCollegePref] = useState("");

  const openModal = (pref = "") => {
    setCollegePref(pref);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setCollegePref("");
  };

  return (
    <CounselingModalContext.Provider value={{ isOpen, openModal, closeModal, collegePref }}>
      {children}
      <CounselingModal isOpen={isOpen} onClose={closeModal} initialCollege={collegePref} />
    </CounselingModalContext.Provider>
  );
}

export function useCounselingModal() {
  const context = useContext(CounselingModalContext);
  if (!context) {
    throw new Error("useCounselingModal must be used within a CounselingModalProvider");
  }
  return context;
}
