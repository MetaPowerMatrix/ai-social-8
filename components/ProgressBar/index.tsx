// ProgressBarComponent.tsx
import React, {useEffect} from 'react';
import { Progress } from 'antd';
import styles from './ProgressBarComponent.module.css'; // Assuming CSS is defined here

interface ProgressBarComponentProps {
	visible: boolean;
	steps: number;
}

const ProgressBarComponent: React.FC<ProgressBarComponentProps> = ({ visible, steps}) => {
	const [percent, setPercent] = React.useState(5);

	useEffect(() => {
		if (!visible){
			// Set up the interval
			const intervalId = setInterval(() => {
				setPercent((prevPercent) => {
					if (prevPercent >= 100) {
						prevPercent = 2
						return prevPercent
						// clearInterval(intervalId); // Clear interval when progress reaches 100%
						// return 100;
					}
					return prevPercent + 2; // Increment progress
				});
			}, 1000); // Update progress every 1000 milliseconds (1 second)

			// Clean up interval on component unmount
			return () => clearInterval(intervalId);
		}
	}, [])

	if (!visible) return null;

	return (
		<div className={styles.progress_bar_container}>
			<div className={styles.progress_bar_content}>
				<Progress strokeColor={"yellow"} trailColor={"white"} steps={steps} percent={percent} size={[20, 30]} status="active" showInfo={false} />
			</div>
		</div>
	);
};

export default ProgressBarComponent;
