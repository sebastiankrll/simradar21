import type { DashboardData } from "@sk/types/vatsim";
import DashboardPanel from "@/components/Panels/Dashboard/DashboardPanel";
import { fetchApi } from "@/utils/api";

export default async function Page() {
	const dashboardData = await fetchApi<DashboardData>(`/data/dashboard`);

	if (!dashboardData) return <div className="info-panel error">Failed to load dashboard data.</div>;
	return <DashboardPanel initialData={dashboardData} />;
}
