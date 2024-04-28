// store.ts
import create from 'zustand';

type State = {
	cameraPosition: [number, number, number];
	setCameraPosition: (x: number, y: number, z: number) => void;
};

const useStore = create<State>((set) => ({
	cameraPosition: [0, 0, 0],
	setCameraPosition: (x, y, z) => set(() => ({ cameraPosition: [x, y, z] }))
}));

export default useStore;
