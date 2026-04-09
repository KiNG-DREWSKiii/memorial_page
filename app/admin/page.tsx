import { AdminPanel } from "@/components/admin-panel";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <main className="admin-page">
      <AdminPanel />
    </main>
  );
}
