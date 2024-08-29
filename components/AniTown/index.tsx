// Scene.js
import React, { useEffect, useRef, useState } from 'react';
import SubSceneLayer from "@/components/SubSceneLayer";
import {Popover} from "antd";
import styles from "./AniTown.module.css";
import {MotionPathPlugin} from "gsap/MotionPathPlugin";
import gsap from 'gsap';

gsap.registerPlugin(MotionPathPlugin);

const SineWave = ({ width, height, amplitude, frequency, id }:{width: number, height:number, amplitude:number, frequency:number, id:string}) => {
	const createSineWavePath = () => {
		let pathD = `M 0 ${height / 2} `; // Start in the middle of the SVG vertically
		const points = width; // Total points (or width of the SVG)

		// Generate the sine wave path
		for (let i = 0; i < points; i++) {
			const y = height / 2 + amplitude * Math.sin(frequency * i); // Calculate y based on sine
			pathD += `L ${i} ${y} `; // Line to each x, y point
		}

		return pathD;
	};

	return (
		<svg width={width} height={height}>
			<path id={id} d={createSineWavePath()} stroke="white" strokeWidth="0" fill="none" />
		</svg>
	);
};
const RandomPath = ({ width, height, id }:{width: number, height:number, id:string}) => {
	const createRandomPath = () => {
		let path = `M 0 ${height / 2} `;
		const points = 50; // Total points (or width of the SVG)

		for (let i = 0; i < points; i++) {
			path += `L ${Math.random() * width} ${Math.random() * height} `
		}
		return path;
	};

	return (
		<svg width={width} height={height}>
			<path id={id} d={createRandomPath()} stroke="white" strokeWidth="1" fill="none" />
		</svg>
	);
};

const AniTown = () => {
	const sceneRef = useRef(null);
	const avatars = ["/images/two-boy.png", "/images/two-poets.png", "/images/wepay.png"]
	const avatarsRef = useRef<(HTMLImageElement | null)[]>([]);
	const [isModalVisible, setModalVisible] = useState(false);
	const [images, setImages] = useState([
		'/images/two-boy.png',
		'/images/two-poets.png',
	]);

	useEffect(() => {
		avatarsRef.current.forEach((avatar, index) => {
			index = index + 1
			console.log("index: ", index)
			gsap.to(avatar, {
				duration: 10,
				// x: Math.random() * 320,
				// y: Math.random() * 400,
				repeat: -1,
				yoyo: true,
				ease: "steps(20)",
				motionPath:{
					path: "#wave"+index,
					align: "#wave"+index,
					autoRotate: false,
					alignOrigin: [0.5, 0.5],
					relative: true,
				}
			});
		});
	}, []);

	const handleAvatarClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, id: number) => {
		event.stopPropagation(); // Prevent triggering background click
		alert(`Avatar ${id} says: Hello!`);
	};

	const handleBackgroundClick = () => {
		setModalVisible(true);
	};

	const handleCloseModal = () => {
		setModalVisible(false);
	};

	const handleSelectImage = (index: number) => {
		alert(`Selected image ${index + 1}`);
	};

	return (
		<div ref={sceneRef} className={styles.background}>
			{[1, 2, 3].map((id, index) => (
				<>
					<RandomPath width={360} height={200} id={"wave" + id} key={id}/>
					{/*<SineWave width={360} height={200} amplitude={40} frequency={0.05} id={"wave" + id} key={id}/>*/}
					<Popover key={index} content={"blahblahblah"} title={"luca"}>
						<img
							key={id}
							src={avatars[id - 1]}
							// ref={el => avatarsRef.current[id - 1] = el}
							// onClick={(event) => handleAvatarClick(event, id)}
							style={{
								width: 50,
								height: 50,
								position: 'absolute',
								borderRadius: 20,
								// top: Math.random() * 300,
								// left: Math.random() * 300,
								cursor: 'pointer'
							}}
							alt={"avatar"}/>
					</Popover>
				</>
			))}
			<SubSceneLayer images={images} isVisible={isModalVisible} onClose={handleCloseModal}
			               onSelectImage={handleSelectImage}/>
		</div>
	);
};

export default AniTown;
