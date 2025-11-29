import type { PilotLong } from "@sk/types/vatsim";
import type { PilotPanelFetchData } from "../PilotPanel";

export function PilotTitle({ pilot, data }: { pilot: PilotLong; data: PilotPanelFetchData }) {
	const callsignNumber = pilot.callsign.slice(3);
	const flightNumber = data.airline?.iata ? data.airline.iata + callsignNumber : pilot?.callsign;

	return (
		<div className="panel-container title-section">
			<figure className="panel-icon" style={{ backgroundColor: data.airline?.bg ?? "none" }}>
				<p
					style={{
						color: data.airline?.font ?? "var(--color-green)",
					}}
				>
					{data.airline?.iata || "?"}
				</p>
			</figure>
			<div className="panel-title">
				<p>{data.airline?.name}</p>
				<div className="panel-desc-items">
					<div className="panel-desc-item">
						<div className="panel-desc-icon">#</div>
						<div className="panel-desc-text">{flightNumber}</div>
					</div>
					<div className="panel-desc-item">
						<div className="panel-desc-icon">A</div>
						<div className="panel-desc-text">{pilot.aircraft}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
