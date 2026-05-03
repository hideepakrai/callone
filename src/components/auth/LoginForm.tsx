"use client";

import { useEffect, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Briefcase, Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck, UserCog } from "lucide-react";

export function LoginForm({
  defaultEmail,
  defaultPasswordHint,
  presets = [],
  autoLoginEnabled = false,
}: {
  defaultEmail: string;
  defaultPasswordHint: string;
  presets?: Array<{label: string; email: string; description: string}>;
  autoLoginEnabled?: boolean;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const postLoginUrl = callbackUrl.startsWith("/launch")
    ? callbackUrl
    : `/launch?target=${encodeURIComponent(callbackUrl)}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !autoLoginEnabled || autoLoginAttempted) {
      return;
    }

    setAutoLoginAttempted(true);
    startTransition(async () => {
      const response = await signIn("credentials", {
        email,
        password: "__dev_auto_login__",
        redirect: false,
      });

      if (response?.error) {
        setError("Auto login is enabled, but the local role session could not be created.");
        return;
      }

      window.location.href = postLoginUrl;
    });
  }, [autoLoginAttempted, autoLoginEnabled, email, mounted, postLoginUrl, startTransition]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const response = await signIn("credentials", {
        email,
        password: autoLoginEnabled ? "__dev_auto_login__" : password,
        redirect: false,
      });
      
      if (response?.error) {
        setError("Invalid email or password.");
        return;
      }

      window.location.href = postLoginUrl;
    });
  };

  if (!mounted) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {presets.length ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {presets.map((preset) => {
            const isActive = email === preset.email;
            
            // Map labels to icons
            let RoleIcon = ShieldCheck;
            const labelLower = (preset.label || "").toLowerCase();
            if (labelLower.includes('manager')) RoleIcon = UserCog;
            if (labelLower.includes('sales')) RoleIcon = Briefcase;

            return (
              <button
                key={preset.email}
                type="button"
                onClick={() => setEmail(preset.email)}
                className={`group relative flex flex-col items-center justify-center rounded-[18px] border p-3 transition-all active:scale-[0.98] ${
                  isActive 
                    ? "border-[color:var(--primary)] bg-[color:var(--control-bg-hover)]" 
                    : "border-border bg-[color:var(--surface)] hover:border-[color:var(--primary)] hover:bg-[color:var(--control-bg-hover)]"
                }`}
              >
                <div className={`mb-2 ${isActive ? "text-foreground" : "text-foreground/45 group-hover:text-foreground/62"}`}>
                  <RoleIcon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>

                <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] text-center transition-colors ${
                  isActive ? "text-foreground" : "text-foreground/52 group-hover:text-foreground/72"
                }`}>
                  {preset.label}
                </p>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="space-y-5">
        {autoLoginEnabled ? (
          <div className="rounded-xl border border-border bg-[color:var(--surface)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/72">
            Development auto login is active. Selected role access is granted without password validation.
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label className="ml-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/48">
             User Name
          </label>
            <div className="group relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 transition-colors group-focus-within:text-foreground/70">
              <Mail size={16} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-border bg-[color:var(--control-bg)] py-3 pl-10 pr-4 text-sm font-medium tracking-wide text-foreground placeholder:text-foreground/18 transition-all outline-none focus:border-[color:var(--primary)] focus:bg-[color:var(--control-bg-hover)]"
              placeholder="admin@callone.local"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/48">
           Password
          </label>
          <div className="group relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 transition-colors group-focus-within:text-foreground/70">
              <Lock size={16} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={autoLoginEnabled}
              className="w-full rounded-2xl border border-border bg-[color:var(--control-bg)] py-3 pl-10 pr-12 text-sm font-medium tracking-wide text-foreground placeholder:text-foreground/18 transition-all outline-none focus:border-[color:var(--primary)] focus:bg-[color:var(--control-bg-hover)]"
              placeholder={autoLoginEnabled ? "Password bypassed in development" : defaultPasswordHint}
              required={!autoLoginEnabled}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-foreground/34 transition-all hover:bg-[color:var(--control-bg-hover)] hover:text-foreground/72"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-[color:var(--surface)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/72">
          <ShieldCheck size={14} className="shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--background)] transition-all active:scale-[0.99] disabled:opacity-60"
        >
          <div className="relative flex w-full items-center justify-center gap-3 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--background)]">
            {isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--background)]/20 border-t-[color:var(--background)]" />
            ) : (
              // <LogIn size={16} />
              <></>
            )}
            {isPending ? "Authenticating" : "Login"}
            {!isPending && (
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            )}
          </div>
        </button>
      </div>
    </form>
  );
}
