import React, {useEffect, useRef, useState} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {
	FirstPersonControls,
	KeyboardControls, OrbitControls, PerspectiveCamera, Plane,
	PointerLockControls,
	Sky, useKeyboardControls,
} from '@react-three/drei';
import { CuboidCollider, RigidBody, useRapier } from "@react-three/rapier"
import {DoubleSide, PerspectiveCamera as RawCamera,  RepeatWrapping, TextureLoader, Vector3} from "three";
import { Cube, Cubes } from "@/components/InfiniteStreet/Cube";
import { Physics } from "@react-three/rapier"

const GrassGround = () => {
	const grassTexture = new TextureLoader().load('/images/dirt.jpg'); // Load texture
	grassTexture.wrapS = RepeatWrapping;
	grassTexture.wrapT = RepeatWrapping;
	grassTexture.repeat.set(300, 300); // Repeat texture on the plane

	return (
		<RigidBody type="fixed" colliders={false}>
			<Plane args={[500, 500]} rotation={[-Math.PI/2.2, 0, 0]} position={[0, 0, 0]}>
				<meshStandardMaterial side={DoubleSide} attach="material" map={grassTexture} />
			</Plane>
			<CuboidCollider args={[1000, 2, 1000]} position={[0, -2, 0]} />
		</RigidBody>
	);
};
const Pato = () => {
	const controls = useRef();

	// Optionally use a state to control things like speed
	const maxSpeed = 0.5;

	useFrame((state, delta) => {
		// use the controls to move the camera

		if (controls.current) {
			controls.current.movementSpeed = maxSpeed;
		}
	});

	return (
		<>
			{/*<PerspectiveCamera name={"main_camera"} makeDefault={true} position={[0, 1, 3]}/>*/}
			<Sky sunPosition={[100, 20, 100]}/>
			<ambientLight intensity={1}/>
			<pointLight castShadow intensity={0.8} position={[100, 100, 100]}/>
			<directionalLight position={[0, 10, 5]} intensity={1}/>
			<Physics gravity={[0, -30, 0]}>
				<GrassGround/>
				{/*<Player />*/}
				<Cube position={[0, 0, -2]}/>
				<Cubes/>
			</Physics>
			<PointerLockControls/>
			<axesHelper/>
			{/*<CameraHelper/>*/}
			<FirstPersonControls rotation={[Math.PI/2, 0, Math.PI/2]} makeDefault={true} ref={controls}
         position={[0, 1, 15]} lookSpeed={0.1} movementSpeed={0.1} lookVertical={true}
         autoForward={false} activeLook={false}>
				{/*<PerspectiveCamera name={"main_camera"} makeDefault={true} position={[0, 1, 15]}/>*/}
			</FirstPersonControls>
		</>
	)
}

function CameraHelper() {
	const camera = new RawCamera(30, 420 / 900, 0.1, 1000)
	return <group position={[0, 1, 1]}>
		<cameraHelper args={[camera]} />
	</group>
}

const InfiniteStreet = () => {
	return (
		<KeyboardControls
			map={[
				{ name: "forward", keys: ["ArrowUp", "w", "W"] },
				{ name: "backward", keys: ["ArrowDown", "s", "S"] },
				{ name: "left", keys: ["ArrowLeft"] },
				{ name: "right", keys: ["ArrowRight"] },
				{ name: "jump", keys: ["Space"] },
				{ name: "leftward", keys: ["a", "A"] },
				{ name: "rightward", keys: [ "d", "D"] },
			]}>
			<Canvas shadows>
				<Pato/>
			</Canvas>
		</KeyboardControls>
	)
}

export default InfiniteStreet;
