// Scene.js
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import SubSceneLayer from "@/components/SubSceneLayer";

const AniTown = () => {
	const sceneRef = useRef(null);
	const avatars = ["/images/Afna.png","/images/Jerin.png","/images/Shezad.png"]
	const avatarsRef = useRef<(HTMLImageElement | null)[]>([]);
	const [isModalVisible, setModalVisible] = useState(false);
	const [images, setImages] = useState([
		'/images/two-boy.png',
		'/images/two-poets.png',
	]);

	useEffect(() => {
		avatarsRef.current.forEach(avatar => {
			gsap.to(avatar, {
				duration: 10,
				x: Math.random() * 320,
				y: Math.random() * 400,
				repeat: -1,
				yoyo: true,
				ease: "steps(12)",
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
		<div ref={sceneRef} onClick={handleBackgroundClick} style={{ position: 'absolute', width: '100%', height: '100vh', overflow: 'scroll', backgroundImage: 'url(/images/background.jpeg)' }}>
			{[1, 2, 3].map((id) => (
				<img
					key={id}
					src={avatars[id - 1]}
					// ref={el => avatarsRef.current[id - 1] = el}
					onClick={(event) => handleAvatarClick(event, id)}
					style={{ width: 50, height: 50, position: 'absolute', top: Math.random() * 300, left: Math.random() * 300, cursor: 'pointer' }}
				 alt={"avatar"}/>
			))}
			<SubSceneLayer images={images} isVisible={isModalVisible} onClose={handleCloseModal} onSelectImage={handleSelectImage} />
		</div>
	);
};

export default AniTown;
