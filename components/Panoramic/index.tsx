import React, { useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Mesh, SphereGeometry, MeshBasicMaterial, BackSide, EquirectangularReflectionMapping } from 'three';

// import panorama from './path_to_panorama_image.jpg';  // Ensure the path is correct

const PanoramicSphere: React.FC = () => {
	const mesh = useRef<Mesh>(null);

	// Load the texture using Three.js's TextureLoader
	const texture = useLoader(TextureLoader, "/images/mishi-360.png");
	texture.mapping = EquirectangularReflectionMapping;

	// Rotate the mesh every frame
	useFrame(() => {
		if (mesh.current) {
			mesh.current.rotation.y += 0.001;  // Adjust rotation speed as needed
		}
	});

	return (
		<mesh ref={mesh} scale={[-1, 1, 1]}>
			<sphereGeometry args={[500, 60, 40]} />
			<meshBasicMaterial map={texture} side={BackSide} />
		</mesh>
	);
};

const Panorama: React.FC = () => {
	return (
		<Canvas>
			<ambientLight />
			<PanoramicSphere />
		</Canvas>
	);
};

export default Panorama;
