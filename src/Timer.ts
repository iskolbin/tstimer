export class Timer {
	constructor(
		public priority: number,
		public index: number,
		public handler: (...args: any[]) => void, 
		public timeout: number,
		public args: any[] = [],
		public intervalMode: boolean = false) {
	}
}
