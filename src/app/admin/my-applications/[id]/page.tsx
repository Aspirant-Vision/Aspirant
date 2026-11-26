import { redirect } from "next/navigation";

interface MyApplicationsDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MyApplicationsDetailPage({
  params,
}: MyApplicationsDetailPageProps) {
  const { id } = await params;
  redirect(`/admin/applications/${id}/review`);
}
