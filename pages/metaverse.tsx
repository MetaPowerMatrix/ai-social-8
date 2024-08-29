import React, {Suspense, useEffect, useRef, useState} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {
	OrbitControls, Plane,
	PerspectiveCamera,
	Sky, useAnimations, useGLTF, PointerLockControls,
} from '@react-three/drei';
import { CuboidCollider, RigidBody, useRapier } from "@react-three/rapier"
import {DoubleSide, Euler, Matrix4, RepeatWrapping, TextureLoader, Vector3} from "three";
import { Cube, Cubes } from "@/components/InfiniteStreet/Cube";
import { Physics } from "@react-three/rapier"

// 模型文件路径
const modelUrl = '/models/robot-draco.glb';

// 定义玩家状态
type PlayerState = {
	position: Vector3;
	rotation: Euler;
};

const GrassGround = () => {
	const grassTexture = new TextureLoader().load('/images/dirt.jpg'); // Load texture
	grassTexture.wrapS = RepeatWrapping;
	grassTexture.wrapT = RepeatWrapping;
	grassTexture.repeat.set(300, 300); // Repeat texture on the plane

	return (
		<RigidBody type="fixed" colliders={false}>
			<Plane args={[500, 500]} rotation={[-Math.PI/2, 0, 0]} position={[0, -0.5, 0]}>
				<meshStandardMaterial side={DoubleSide} attach="material" map={grassTexture} />
			</Plane>
			<CuboidCollider args={[1000, 2, 1000]} position={[0, -2, 0]} />
		</RigidBody>
	);
};

// 定义玩家组件
const Player = () => {
	const cameraRef = useRef();
	const [playerState, setPlayerState] = useState<PlayerState>({
		position: new Vector3(0, 0, 0),
		rotation: new Euler(0, 0, 0),
	});

	// 加载模型
	const { nodes, animations } = useGLTF(modelUrl);
	const { actions } = useAnimations(animations);

	// 处理键盘事件
	const handleKeyDown = (event: KeyboardEvent) => {
		const { key } = event;
		const speed = 0.1;
		const rotationSpeed = 0.1;

		switch (key) {
			case 'ArrowUp':
				setPlayerState((prevState) => ({
					...prevState,
					position: prevState.position.add(new Vector3(0, 0, -speed)),
				}));
				break;
			case 'ArrowDown':
				setPlayerState((prevState) => ({
					...prevState,
					position: prevState.position.add(new Vector3(0, 0, speed)),
				}));
				break;
			case 'ArrowLeft':
				setPlayerState((prevState) => ({
					...prevState,
					position: prevState.position.add(new Vector3(-speed, 0, 0)),
				}));
				break;
			case 'ArrowRight':
				setPlayerState((prevState) => ({
					...prevState,
					position: prevState.position.add(new Vector3(speed, 0, 0)),
				}));
				break;
			case 'a':
				setPlayerState((prevState) => {
					const newRotation = prevState.rotation.clone();
					const matrix = new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), -rotationSpeed);
					newRotation.setFromRotationMatrix(matrix);
					console.log("new rotation state ", newRotation)
					return {
						...prevState,
						rotation: newRotation
					};
				});
				break;
			case 'd':
				setPlayerState((prevState) => {
					const newRotation = prevState.rotation.clone();
					console.log("old rotation state ", newRotation)
					const matrix = new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), rotationSpeed);
					console.log("camera matrix", cameraRef.current.matrix)
					const matrix3 = cameraRef.current?.matrix.multiply(matrix)
					newRotation.setFromRotationMatrix(matrix3,"XYZ", true);
					console.log("new rotation state ", newRotation)
					return {
						...prevState,
						rotation: newRotation
					};
				});
				break;
			default:
				break;
		}

	};

	// 监听键盘事件
	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	useFrame(() => {
		// console.log("update frame ", playerState.rotation)
		if (cameraRef.current) {
			// 更新摄像头位置
			cameraRef.current.position.copy(playerState.position);
			// 更新摄像头旋转
			cameraRef.current.rotation.copy(playerState.rotation);
			// cameraRef.current.updateProjectionMatrix();
			cameraRef.current.lookAt(playerState.position);
		}
	});

	return (
		<>
			<PerspectiveCamera rotation={[0, 0.2, 0]} makeDefault={true} name={"main_camera"} ref={cameraRef} position={[0, 2, 5]}/>
			<group position={playerState.position} rotation={playerState.rotation}>
				{/*<Cube/>*/}
				{/*<primitive object={nodes.scene} dispose={null} />*/}
			</group>
		</>
	);
};

const InfiniteStreet = () => {
	return (
		<div style={{height: "100vh"}}>
			<Canvas camera={{position: [0, 2, 5]}}>
				<Suspense fallback={null}>
					<Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
					<ambientLight intensity={0.5} />
					<directionalLight position={[5, 10, 5]} castShadow />
					<Physics gravity={[0, -30, 0]}>
						<GrassGround/>
						<Cube position={[0, 0, -2]}/>
						<Cubes/>
						<Player/>
					</Physics>
					<OrbitControls/>
					<PointerLockControls/>
					<axesHelper/>
				</Suspense>
			</Canvas>
		</div>
	);
}

export default InfiniteStreet;
