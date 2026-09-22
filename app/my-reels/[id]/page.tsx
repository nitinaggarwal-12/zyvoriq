import { redirect } from "next/navigation";

export default async function ProjectLegacyRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/swarm?project=${encodeURIComponent(id)}`);
}
