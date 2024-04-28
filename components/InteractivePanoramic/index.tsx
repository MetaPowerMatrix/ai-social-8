import React, {useRef, useState} from 'react';
import {Canvas, useFrame, extend, useLoader, useThree} from '@react-three/fiber';
import {
	BackSide,
	TextureLoader,
	EquirectangularReflectionMapping, Vector3
} from 'three';
import {OrbitControls, Html, CameraControls} from '@react-three/drei';
import {Col, Row} from "antd";

const CameraMover = () => {
	const { camera } = useThree(); // Access the Three.js camera from the React Three Fiber context
	const [isMoving, setIsMoving] = useState(false);

	useFrame(() => {
		if (isMoving) {
			// This moves the camera forward along its local z-axis
			camera.translateZ(-0.1);
		}
	});

	const toggleCameraMovement = () => setIsMoving(!isMoving);

	return (
		<Html>
			<button onClick={toggleCameraMovement}>
				{isMoving ? 'Stop Moving' : 'Move Forward'}
			</button>
		</Html>
	);
};

// const CameraMover = () => {
// 	const { camera } = useThree();
// 	const moveForward = useRef(false);
//
// 	useFrame(() => {
// 		if (moveForward.current) {
// 			// Calculate the forward vector and move the camera
// 			camera.position.addScaledVector(camera.getWorldDirection(new Vector3()), 0.1);
// 		}
// 	});
//
// 	return (
// 		<Html>
// 			<Row>
// 				<Col span={24} style={{textAlign:"end"}}>
// 					<button onClick={() => {
// 						moveForward.current = !moveForward.current
// 					}}>
// 						{moveForward.current ? '停止' : '向前'}
// 					</button>
// 				</Col>
// 			</Row>
// 		</Html>
// 	);
// };

const PanoramicSphere: React.FC = () => {
	const mesh = useRef(null);
	const texture = useLoader(TextureLoader, "/images/mishi-360.png");
	texture.mapping = EquirectangularReflectionMapping;

	return (
		<mesh scale={[-1, 1, 1]} ref={mesh}>
			<sphereGeometry args={[500, 60, 40]}/>
			<meshBasicMaterial map={texture} side={BackSide}/>
		</mesh>
	);
};

const InteractivePanorama: React.FC = () => {
	return (
		<>
			<Canvas>
				<ambientLight/>
				<OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
				{/*<CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 2} minAzimuthAngle={-Math.PI / 2}*/}
				{/*                maxAzimuthAngle={Math.PI / 2}/>*/}
				<PanoramicSphere/>
				{/*<CameraMover/>*/}
			</Canvas>
		</>
	);
};

export default InteractivePanorama;
