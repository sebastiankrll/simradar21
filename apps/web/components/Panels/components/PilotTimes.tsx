import type { PilotLong } from "@sk/types/vatsim";

export function PilotTimes({ pilot }: { pilot: PilotLong }) {
	const getTime = (time: string | Date | undefined) => {
		if (!time) {
			return "xx:xx";
		}

		const date = new Date(time);
		const hours = String(date.getUTCHours()).padStart(2, "0");
		const minutes = String(date.getUTCMinutes()).padStart(2, "0");

		return `${hours}:${minutes}`;
	};

	const getDelayColor = (scheduled: string | Date | undefined, actual: string | Date | undefined) => {
		if (!scheduled || !actual) {
			return null;
		}
		const scheduledDate = new Date(scheduled);
		const actualDate = new Date(actual);
		const delayMinutes = (actualDate.getTime() - scheduledDate.getTime()) / 60000;
		if (delayMinutes >= 30) {
			return "red";
		} else if (delayMinutes >= 15) {
			return "yellow";
		} else if (delayMinutes > 0) {
			return "green";
		}
		return "green";
	};

	return (
		<div id="panel-pilot-times">
			<p>{getTime(pilot.times?.sched_off_block)}</p>
			<p className="panel-pilot-time-desc">SCHED</p>
			<p className="panel-pilot-time-desc">SCHED</p>
			<p>{getTime(pilot.times?.sched_on_block)}</p>
			<p>{getTime(pilot.times?.off_block)}</p>
			<p className="panel-pilot-time-desc">EST</p>
			<p className="panel-pilot-time-desc">EST</p>
			<p className={`panel-pilot-arrival-status ${getDelayColor(pilot.times?.sched_on_block, pilot.times?.on_block) ?? null}`}>
				{getTime(pilot.times?.on_block)}
			</p>
		</div>
	);
}
