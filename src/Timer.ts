export class Timer {
	public descriptor: number = -1
	public timeout: number

	constructor(
		public handler: (...args: any[]) => void, 
		public interval: number,
		public args: any[] = [],
		public intervalMode: boolean = false) {
	}
}
