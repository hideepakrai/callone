export function readBooleanEnvFlag(value: string | undefined) {
  if (!value) return false;

  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
}

export function isAiAdminEnabled() {
  return readBooleanEnvFlag(process.env.NEXT_PUBLIC_CALLONE_ENABLE_AI_ADMIN);
}
