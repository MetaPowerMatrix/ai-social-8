import React from 'react';
import {ListItemInfo} from "@/common";

interface ModalProps {
	items: ListItemInfo[];
	onSelect: (item: ListItemInfo) => void;
}

const ListModalComponent: React.FC<ModalProps> = ({ items, onSelect }) => {
	return (
		<div className="modal">
			<ul>
				{items.map((item, index) => (
					<li key={index} onClick={() => onSelect(item)}>
						{item.name}
					</li>
				))}
			</ul>
		</div>
	);
};

export default ListModalComponent;
