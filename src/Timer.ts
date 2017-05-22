import { Priority } from 'tspriorityqueue'

export class Timer implements Priority<number> {
	public priority: number = -1
	public queueIndex: number = -1

	constructor(
		public handler: (...args: any[]) => void, 
		public timeout: number,
		public args: any[] = [],
		public intervalMode: boolean = false) {
	}
}
