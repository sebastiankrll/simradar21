import type { AirportLong } from "@sk/types/vatsim";
import { AirportGeneral } from "@/components/Panels/Airport/AirportGeneral";
import NotFoundPanel from "@/components/Panels/NotFound";
import { fetchApi } from "@/utils/api";

export default async function Page(props: { params: Promise<{ icao: string }> }) {
	const params = await props.params;
	const airport = await fetchApi<AirportLong>(`/data/airport/${params.icao}`);

	if (!airport)
		return <NotFoundPanel title="Airport not found!" text="This airport does not exist or is currently unavailable." enableHeader={false} />;

	return <AirportGeneral initialAirport={airport} />;
}
