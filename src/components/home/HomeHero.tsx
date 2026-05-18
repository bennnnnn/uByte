"use client";

import { useAuth } from "@/components/AuthProvider";
import type { SupportedLanguage } from "@/lib/languages/types";
import GuestHero from "./GuestHero";
import LoggedInHero from "./LoggedInHero";

interface Props {
  totalLessons: number;
  /** Set server-side; avoids flash before client auth resolves */
  isLoggedInServer: boolean;
  /** Last activity link + label from the server */
  leftOff: { href: string; label: string } | null;
  continueLang: SupportedLanguage;
}

export default function HomeHero({
  totalLessons,
  isLoggedInServer,
  leftOff,
  continueLang,
}: Props) {
  const { user, profile, stepCountByLang } = useAuth();

  const name = (user as { name?: string } | null)?.name ?? "";
  const isLoggedIn = (user != null || isLoggedInServer) && !!name;

  const xp = profile?.xp ?? 0;
  const streak = profile?.streak_days ?? 0;
  const plan = profile?.plan ?? "free";
  const totalStepsCompleted = Object.values(stepCountByLang ?? {}).reduce((s, v) => s + v, 0);

  if (isLoggedIn) {
    return (
      <LoggedInHero
        name={name}
        leftOff={leftOff}
        continueLang={continueLang}
        xp={xp}
        streak={streak}
        totalStepsCompleted={totalStepsCompleted}
        plan={plan}
      />
    );
  }

  return <GuestHero totalLessons={totalLessons} />;
}
