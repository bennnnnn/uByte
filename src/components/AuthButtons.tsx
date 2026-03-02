"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import AuthModal from "./auth/AuthModal";
import UserMenuDropdown from "./auth/UserMenuDropdown";

export default function AuthButtons() {
  const { user, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => { if (typeof d.unreadCount === "number") setUnreadCount(d.unreadCount); })
      .catch(() => {});
  }, [user]);

  if (loading) {
    return <div className="h-9 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />;
  }

  if (user) {
    return <UserMenuDropdown unreadCount={unreadCount} />;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={() => setShowModal(true)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">Log in</button>
        <button onClick={() => setShowModal(true)} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-800">Sign up</button>
      </div>
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
