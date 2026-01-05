import type { SyntheticEvent } from "react";
import Icon from "@/components/Icon/Icon";
import { RangeSwitch } from "@/components/Input/Input";
import { REPLAY_SPEEDS } from "./Replay";

export function ReplayControl({
	progress,
	setProgress,
	setOpen,
	setSpeedIndex,
	speedIndex,
	setPlaying,
	playing,
	max,
}: {
	progress: number;
	setProgress: React.Dispatch<React.SetStateAction<number>>;
	setOpen: React.Dispatch<React.SetStateAction<string | null>>;
	setSpeedIndex: React.Dispatch<React.SetStateAction<number>>;
	speedIndex: number;
	setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
	playing: boolean;
	max: number;
}) {
	return (
		<div id="replay-control">
			<button type="button" className="replay-button" onClick={() => setPlaying((prev) => !prev)}>
				<Icon name={playing ? "cancel" : "forward"} size={24} />
			</button>
			<button
				type="button"
				className="replay-button"
				id="replay-speed"
				onClick={() => setSpeedIndex((prev) => (prev === REPLAY_SPEEDS.length - 1 ? 0 : prev + 1))}
			>
				{`${REPLAY_SPEEDS[speedIndex]} x`}
			</button>
			<RangeSwitch
				value={progress}
				onChange={(_event: Event | SyntheticEvent<Element, Event>, newValue: number | number[]) => {
					setProgress(newValue as number);
				}}
				min={0}
				max={max}
			/>
			<button type="button" className="replay-button" id="replay-close" onClick={() => setOpen(null)}>
				<Icon name="cancel" size={24} />
			</button>
		</div>
	);
}
