import React, {PointerEventHandler, useEffect, useRef} from 'react';
import {Canvas, useThree, extend, ReactThreeFiber, useLoader, ThreeEvent} from '@react-three/fiber';
import {
	Mesh,
	SphereGeometry,
	MeshBasicMaterial,
	BackSide,
	TextureLoader,
	EquirectangularReflectionMapping
} from 'three';
import useStore from './store';
import {useGesture} from "@use-gesture/react";

type MeshWithGesture = Mesh & ReactThreeFiber.Object3DNode<Mesh, typeof Mesh> & {
	onPointerMove?: (event: PointerEvent) => void;
	onPointerUp?: (event: PointerEvent) => void;
};

const PanoramicSphere: React.FC = () => {
	const mesh = useRef<MeshWithGesture>(null);
	const { camera } = useThree();

	const setCameraPosition = useStore(state => state.setCameraPosition);
	const texture = useLoader(TextureLoader, "/images/mishi-360.png");
	texture.mapping = EquirectangularReflectionMapping;

	const bind = useGesture({
		onDrag: ({ offset: [x, y] }) => {
			const rotationSpeed = 0.01;
			camera.rotation.y += x * rotationSpeed;
			camera.rotation.x += y * rotationSpeed;
		},
		onPinch: ({ da: [d] }) => {
			const pinchScaleFactor = 0.01;
			const newZ = camera.position.z + d * pinchScaleFactor;
			camera.position.z = newZ;
			setCameraPosition(camera.position.x, camera.position.y, camera.position.z);
		}
	}, {
		drag: { threshold: 1 },
		pinch: { distanceBounds: { min: 1, max: 5 }, rubberband: true },
	});

	return (
			<mesh
				ref={mesh}
				onPointerMove={()=>bind().onPointerMove}
				onPointerUp={()=>bind().onPointerUp}
				scale={[-1, 1, 1]}
				geometry={new SphereGeometry(500, 60, 40)}
				material={new MeshBasicMaterial({map: texture, side: BackSide})}
			/>
	);
};

const Panorama: React.FC = () => {
	return (
		<Canvas>
			<ambientLight/>
			<PanoramicSphere/>
		</Canvas>
	);
};

export default Panorama;
