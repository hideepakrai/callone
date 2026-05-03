import { WorkspaceLaunchScreen } from "@/components/auth/WorkspaceLaunchScreen";

export const dynamic = "force-dynamic";

export default function LaunchPage({
  searchParams,
}: {
  searchParams?: { target?: string };
}) {
  const target =
    searchParams?.target && searchParams.target.startsWith("/")
      ? searchParams.target
      : "/admin";

  return <WorkspaceLaunchScreen target={target} />;
}
