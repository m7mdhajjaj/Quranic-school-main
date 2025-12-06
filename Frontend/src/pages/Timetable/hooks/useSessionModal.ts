// ============================================================================
// useSessionModal - إدارة حالة مودال الجلسات
// ============================================================================

import { useState } from "react";
import type { Session } from "../types/timetable.types";

export const useSessionModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const openModal = (session?: Session) => {
    if (session) {
      setEditingSession(session);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSession(null);
  };

  const openAddModal = () => openModal();
  const openEditModal = (session: Session) => openModal(session);

  return {
    showModal,
    editingSession,
    openModal,
    closeModal,
    openAddModal,
    openEditModal,
    setShowModal,
    setEditingSession,
  };
};
