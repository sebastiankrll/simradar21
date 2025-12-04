import type { StaticAircraft } from "@sk/types/db";
import type { PilotLong } from "@sk/types/vatsim";
import NotFoundPanel from "@/components/Panels/NotFound";
import PilotPanel from "@/components/Panels/Pilot/PilotPanel";
import { fetchApi } from "@/utils/api";

export default async function Page(props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const pilot = await fetchApi<PilotLong>(`/data/pilot/${params.id}`);
	const reg = pilot?.flight_plan?.ac_reg || "";
	const aircraft = reg ? await fetchApi<StaticAircraft>(`/data/aircraft/${reg}`) : null;

	if (!pilot)
		return (
			<NotFoundPanel
				title="Pilot not found!"
				text="This pilot does not exist or is currently unavailable, most likely because of an incorrect ID or disconnect."
			/>
		);

	return <PilotPanel initialPilot={pilot} aircraft={aircraft} />;
}
