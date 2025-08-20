import { useRouter } from "next/router";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { id } = router.query;

  // Você pode passar o id para o Dashboard se quiser
  return <Dashboard tanqueId={id} />;
}