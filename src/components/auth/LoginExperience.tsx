"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function LoginExperience({
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
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen w-full bg-background" />;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background text-foreground selection:bg-white selection:text-black lg:flex-row">
      
      <section className="group relative min-h-[30vh] w-full overflow-hidden lg:min-h-screen lg:w-[58%]">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale contrast-125 transition-transform duration-[12s] group-hover:scale-[1.03]"
          style={{
            backgroundImage: "url('https://callawaytech.s3.ap-south-1.amazonaws.com/omsimages/uploads/18_b3b08ebc11.png')",
          }}
        />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.2),transparent_30%),linear-gradient(135deg,rgba(0,0,0,0.9),rgba(0,0,0,0.58),rgba(0,0,0,0.84))] pointer-events-none" />
        <div className="absolute inset-0 z-[11] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_22%,transparent_78%,rgba(255,255,255,0.03))]" />
        
        <div className="relative z-20 flex h-full flex-col justify-between p-8 text-white md:p-12 lg:p-16">
          <div className="flex items-center gap-5">
            <div className="rounded-2xl border border-white/15 bg-white px-3 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
              <Image
                src="/images/brands/callaway-logo-white.png"
                alt="Callaway"
                width={100}
                height={50}
                className="h-7 w-auto object-contain invert"
                priority
              />
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-white/72">Admin</span>
              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/50">v4.2.0</span>
            </div>
          </div>

          <div className="mb-8 max-w-2xl space-y-6 lg:mb-0">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.45)]" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/82">System live // Secure</span>
            </div>

            <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.06em] text-white md:text-6xl lg:text-7xl">
              Minimal control.
              <br />
              Maximum clarity.
            </h1>

            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { label: "Inventory", val: "Global" },
                { label: "Approvals", val: "Precise" },
                { label: "Insights", val: "Live" }
              ].map((stat) => (
                <div key={stat.label} className="space-y-0.5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/38">{stat.label}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white">{stat.val}</p>
                </div>
              ))}
            </div>
          </div>

          <footer className="hidden lg:block">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/62">
              &copy; 2026 Callaway Golf Workspace
            </p>
          </footer>
        </div>
      </section>

      <section className="relative flex min-h-screen flex-1 flex-col border-l border-white/8 bg-background">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%,transparent_82%,rgba(255,255,255,0.015))]" />
        
        <header className="relative z-30 flex justify-end p-6 lg:p-5">
          <ThemeToggle className="h-10 px-2.5" />
        </header>

        <main className="relative z-20 flex flex-1 flex-col items-center justify-center px-8 pb-12 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground/42">
                Secure access
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground lg:text-5xl">
                Login
              </h2>
              <div className="mt-4 h-px w-14 bg-white/20" />
              <p className="mt-4 text-sm leading-6 text-foreground/54">
                Secure access gateway for authorized personnel.
              </p>
            </div>

            <LoginForm
              defaultEmail={defaultEmail}
              defaultPasswordHint={defaultPasswordHint}
              presets={presets}
              autoLoginEnabled={autoLoginEnabled}
            />

            <div className="mt-8 text-center lg:text-left">
              <a href="#" className="border-b border-transparent pb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/36 transition-colors hover:border-white/20 hover:text-foreground/78 cursor-pointer">
                TECHNICAL SUPPORT
              </a>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}
