import React, {useRef, useState} from 'react';
import {Canvas, useFrame, extend, useLoader, useThree} from '@react-three/fiber';
import {
	BackSide,
	TextureLoader,
	EquirectangularReflectionMapping, Vector3
} from 'three';
import {OrbitControls, Html, CameraControls} from '@react-three/drei';

const CameraMover = () => {
	const { camera } = useThree(); // Access the Three.js camera from the React Three Fiber context
	const [isMoving, setIsMoving] = useState(false);

	useFrame(() => {
		if (isMoving) {
			// This moves the camera forward along its local z-axis
			camera.translateZ(-0.06);
			// camera.translateX(0.01);
			// camera.translateY(-0.01);
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

const PanoramicSphere: React.FC = () => {
	const mesh = useRef(null);
	const texture = useLoader(TextureLoader, "/images/mishi-360.png");
	texture.mapping = EquirectangularReflectionMapping;

	return (
		<mesh scale={[-1, 1, 1]} ref={mesh} dispose={null}>
			<sphereGeometry args={[200, 60, 40]}/>
			<meshBasicMaterial map={texture} side={BackSide}/>
		</mesh>
	);
};

const InteractivePanorama: React.FC = () => {
	return (
		<>
			<Canvas>
				<ambientLight/>
				<OrbitControls enableZoom={true} enablePan={true}/>
				{/*<CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 2} minAzimuthAngle={-Math.PI / 2}*/}
				{/*                maxAzimuthAngle={Math.PI / 2}/>*/}
				<PanoramicSphere/>
				{/*<CameraMover/>*/}
			</Canvas>
		</>
	);
};

export default InteractivePanorama;
