export class Timer {
	public priority: number = -1
	public index: number = -1

	constructor(
		public handler: (...args: any[]) => void, 
		public timeout: number,
		public args: any[] = [],
		public intervalMode: boolean = false) {
	}
}
