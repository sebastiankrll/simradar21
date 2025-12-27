export default async function Page(props: { params: Promise<{ callsign: string }> }) {
	const params = await props.params;
	const callsign = params.callsign;

	return <p>Flight data for callsign: {callsign}</p>;
}
