// ImageModal.js
import React from 'react';

interface SubSceneLayerPros {
	images: string[],
	isVisible: boolean,
	onSelectImage: (i: number)=>void;
	onClose: ()=>void;
}
const SubSceneLayer = ({ images, isVisible, onClose, onSelectImage }: SubSceneLayerPros) => {
	if (!isVisible) return null;

	return (
		<div style={{
			position: 'fixed',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			backgroundColor: 'rgba(0,0,0,0.5)',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			zIndex: 1000
		}} onClick={onClose}>
			<div onClick={e => e.stopPropagation()} style={{
				padding: '20px',
				backgroundColor: '#fff',
				borderRadius: '10px',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center'
			}}>
				{images.map((image, index) => (
					<img key={index} src={image} alt={`Background ${index}`} style={{ width: '100px', height: '100px', margin: '10px' }} onClick={() => onSelectImage(index)} />
				))}
			</div>
		</div>
	);
};

export default SubSceneLayer;
