import {LoginExperience} from "@/components/auth/LoginExperience";
import { getLoginPresets, isDevAutoLoginEnabled } from "@/lib/auth/dev-login";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const defaultEmail =
    process.env.CALLONE_BOOTSTRAP_ADMIN_EMAIL ?? "admin@callone.local";
  const defaultPasswordHint =
    process.env.NODE_ENV === "production"
      ? "Enter your password"
      : process.env.CALLONE_BOOTSTRAP_ADMIN_PASSWORD ?? "CalloneAdmin@123";
  const presets = getLoginPresets();
  const autoLoginEnabled = isDevAutoLoginEnabled();

  return (
    <LoginExperience
      defaultEmail={defaultEmail}
      defaultPasswordHint={defaultPasswordHint}
      presets={presets}
      autoLoginEnabled={autoLoginEnabled}
    />
  );
}
