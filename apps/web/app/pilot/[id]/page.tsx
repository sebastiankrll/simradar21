import PilotPanel from "@/components/Panels/PilotPanel";
import type { PilotLong } from "@sk/types/vatsim";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchPilotLong(id: string): Promise<PilotLong | null> {
	const res = await fetch(`${API_URL}/api/data/pilot/${id}`, {
		cache: "no-store",
	});
	if (!res.ok) return null;
	return res.json();
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const pilot = await fetchPilotLong(params.id);

	if (!pilot) return <div>Pilot not found</div>;
	return <PilotPanel pilot={pilot} />;
}
