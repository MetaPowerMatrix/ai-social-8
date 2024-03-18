import React, {useEffect, useState} from 'react';
import styles from "./MaskedHighlightComponent.module.css";

interface Props {
	zones: {
		id: string;
		top: number;
		left: number;
		height: number;
		width: number;
		tips: string;
	}[];
	visible: boolean
}

const MaskedHighlightComponent: React.FC<Props> = ({ zones, visible }) => {
	const [activeZone, setActiveZone] = useState<string | null>("zone1");

	const handleZoneClick = (index: number) => {
		let next_index = index + 1
		if (next_index > zones.length - 1) {
			next_index = zones.length - 1
			document.cookie = `guide-completed=1`;
			setActiveZone(null)
			return
		}
		setActiveZone(zones[next_index].id);
	};

	const handleMaskClick = () => {
		// setActiveZone(null);
	};

	useEffect(() => {
		if (visible){
			console.log(activeZone)
			console.log("show guide")
		}
	}, [visible])

	if (!visible) return null;

	return (
		<div>
			<div
				id="mask"
				style={{ display: activeZone ? 'block' : 'none', height: "100%", width: "100%", position: "fixed", top: 0, left: 0, backgroundColor: "rgba(0, 0, 0, 0.9)", }}
				onClick={handleMaskClick}
			/>
			{zones.map((zone, index) => (
				<div
					key={zone.id}
					id={zone.id}
					style={{
						position: 'absolute',
						top: zone.top,
						left: zone.left,
						padding: 10,
						height: zone.height,
						width: zone.width,
						backgroundColor: "rgba(255, 255, 255, 0.4)",
						border: '1px solid #ccc',
						display: activeZone === zone.id ? 'block' : 'none',
					}}
					onClick={() => handleZoneClick(index)}
				><h3 style={{color: "yellow"}}>{zone.tips}</h3></div>
			))}
		</div>
	);
};

export default MaskedHighlightComponent;
