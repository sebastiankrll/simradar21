import type { VatsimEvent } from "@sk/types/vatsim";

export function DashboardEvents({ events }: { events: VatsimEvent[] }) {
	return <p>VATSIM events will be on this panel.</p>;
}
