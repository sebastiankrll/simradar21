import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DashboardHistory({ data }: { data: any[] }) {
	return (
		<ResponsiveContainer width="100%" aspect={1.618} maxHeight={500}>
			<LineChart data={data} margin={{ top: 5, right: 5, bottom: 10, left: 5 }}>
				<YAxis yAxisId="alt" orientation="left" fontSize="10px" width={33} tickSize={4} tickLine={false} axisLine={false} />
				<YAxis yAxisId="spd" orientation="right" fontSize="10px" width={23} tickSize={4} tickLine={false} axisLine={false} />
				<XAxis dataKey="name" tick={false} mirror={true} axisLine={false} />
				<Line type="monotone" dataKey="altitude" yAxisId="alt" stroke="var(--color-red)" dot={false} name="Barometric Altitude (ft)" />
				<Line type="monotone" dataKey="speed" yAxisId="spd" stroke="var(--color-green)" dot={false} name="Groundspeed (kt)" />
				<Legend verticalAlign="bottom" height={5} iconSize={10} wrapperStyle={{ fontSize: "10px" }} />
				<Tooltip wrapperStyle={{ fontSize: "10px" }} />
			</LineChart>
		</ResponsiveContainer>
	);
}
