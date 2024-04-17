export class SequentialAudioPlayer {
	private audioContext: AudioContext;
	private urls: string[];
	private buffers: AudioBuffer[];
	private currentIndex: number;
	private currentBuffers: number;

	constructor(urls: string[], window: Window) {
		this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
		this.urls = urls;
		this.buffers = [];
		this.currentIndex = 0;
		this.currentBuffers = 0;
	}
	public async addUrl(url: string)  {
		if (!this.urls.includes(url)){
			this.urls.push(url);
			await this.loadBuffers()
			this.currentBuffers = this.buffers.length;
			console.log('update current buffers length:', this.buffers.length)
		}
	}
	private async loadBuffers(): Promise<void> {
		// if (this.buffers.length > 10){
		// 	console.log("clear audio buffer")
		// 	this.clear()
		// }
		console.log('loop current buffers index:', this.currentBuffers)
		console.log('loop current buffers length:', this.buffers.length)
		for (let i = this.currentBuffers; i < this.urls.length; i++) {
			let url = this.urls[i]
			try {
				const response = await fetch(url);
				const arrayBuffer = await response.arrayBuffer();
				const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
				this.buffers.push(audioBuffer);
			}catch (e){
				console.log(e)
			}
		}
	}

	private playBuffer(index: number, callback: (empty: boolean)=>void): boolean {
		if (index >= this.buffers.length) {
			console.log('Finished playing all audio sources.');
			callback(true)
		}

		const source = this.audioContext.createBufferSource();
		source.buffer = this.buffers[index];
		source.connect(this.audioContext.destination);
		source.start();

		source.onended = () => {
			this.playBuffer(index + 1, callback);
		};
		return true
	}
	public clear(){
		this.buffers = [];
		this.currentIndex = 0;
		this.currentBuffers = 0;
		this.urls.splice(0, this.urls.length - 1)
	}
	public play(callback: (empty: boolean)=>void): boolean {
		if (this.currentBuffers === 0) {
			console.log('Audio buffers are still loading.');
			return false;
		}
		return this.playBuffer(this.currentIndex, callback);
	}
}
