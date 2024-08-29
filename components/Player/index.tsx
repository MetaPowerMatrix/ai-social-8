import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, useGLTF } from '@react-three/drei';
import { Group } from "three"

interface PlayerProps {
	speed: number;
}

const Player: React.FC<PlayerProps> = ({ speed }) => {
	const gltf = useGLTF('/models/robot-draco.glb'); // 替换为你的玩家模型路径
	const playerRef = useRef<Group>(null!);
	const [movement, setMovement] = useState({ forward: false, backward: false, left: false, right: false });

	useFrame((state, delta) => {
		if (movement.forward) playerRef.current.translateZ(-speed * delta);
		if (movement.backward) playerRef.current.translateZ(speed * delta);
		if (movement.left) playerRef.current.translateX(-speed * delta);
		if (movement.right) playerRef.current.translateX(speed * delta);
	});

	const handleKeyDown = (e: KeyboardEvent) => {
		switch (e.key) {
			case 'w':
				setMovement({ ...movement, forward: true });
				break;
			case 's':
				setMovement({ ...movement, backward: true });
				break;
			case 'a':
				setMovement({ ...movement, left: true });
				break;
			case 'd':
				setMovement({ ...movement, right: true });
				break;
		}
	};

	const handleKeyUp = (e: KeyboardEvent) => {
		switch (e.key) {
			case 'w':
				setMovement({ ...movement, forward: false });
				break;
			case 's':
				setMovement({ ...movement, backward: false });
				break;
			case 'a':
				setMovement({ ...movement, left: false });
				break;
			case 'd':
				setMovement({ ...movement, right: false });
				break;
		}
	};

	return (
		<group ref={playerRef} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
			<primitive object={gltf.scene} position={[0, 0, 0]} />
			<OrbitControls target={playerRef.current.position} enableZoom={false} enablePan={false} />
		</group>
	);
};

export default Player;
