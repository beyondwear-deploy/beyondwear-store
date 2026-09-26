import { NotConfigured } from "@/components/admin/NotConfigured";
import { getStoreSettings } from "@/lib/storeSettings";
import { FinancialsNav } from "../FinancialsNav";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Admin — Financial settings" };
export const dynamic = "force-dynamic";

export default async function AdminFinancialSettingsPage() {
  const { configured, settings } = await getStoreSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financial settings</h1>
        <p className="text-sm text-muted">Every report is computed from these two numbers plus your orders and expense log — change them any time.</p>
      </div>

      <FinancialsNav />

      {!configured && <NotConfigured what="Financial settings" />}
      {configured && <SettingsForm settings={settings} />}
    </div>
  );
}
