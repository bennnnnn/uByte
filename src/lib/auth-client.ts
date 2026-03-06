export type EmailAuthMode = "login" | "signup";

type LoginFn = (email: string, password: string) => Promise<string | null>;
type SignupFn = (name: string, email: string, password: string) => Promise<string | null>;

export async function submitEmailAuth(
  mode: EmailAuthMode,
  fields: { name: string; email: string; password: string },
  handlers: { login: LoginFn; signup: SignupFn }
): Promise<string | null> {
  if (mode === "signup") {
    return handlers.signup(fields.name, fields.email, fields.password);
  }
  return handlers.login(fields.email, fields.password);
}

export async function requestPasswordReset(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: data.error ?? "Something went wrong." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
