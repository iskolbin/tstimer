import { PriorityQueue } from 'tspriorityqueue'
import { now } from 'tsnow'
import { Timer } from './Timer'

export class TimerPool {
	protected _time: number
	protected _timers = new PriorityQueue<Timer,number>()

	constructor( currentTime = now()) {
		this._time = currentTime
	}

	add( timer: Timer ): boolean {
		return this._timers.enqueue( timer )
	}

	delete( timer: Timer ): boolean {
		return this._timers.delete( timer )
	}

	has( timer: Timer ): boolean {
		return this._timers.has( timer )
	}

	setTimeout( handler: (...args:any[]) => void, timeout: number, ...args: any[] ): Timer {
		const timer = new Timer( handler, timeout, args, false )
		this._timers.enqueue( timer, this._time + timeout )
		return timer
	}

	setInterval( handler: (...args:any[]) => void, timeout: number, ...args: any[] ): Timer {
		const timer = new Timer( handler, timeout, args, true )
		this._timers.enqueue( timer, this._time + timeout )
		return timer
	}

	clearTimeout( timer: Timer ): boolean {
		return this.delete( timer )
	}

	clearInterval( timer: Timer ): boolean {
		return this.delete( timer )
	}

	update( time: number = now() ): boolean {
		this._time = time
		if ( this.size === 0 ) {
			return false
		}
		const timers = this._timers
		let topTimer = timers.peek()
		while ( topTimer !== undefined && topTimer.priority <= time ) {
			const timer = (<Timer>timers.dequeue())
			const {handler, timeout, args, intervalMode} = timer
			handler.apply( timer, args )
			if ( intervalMode ) {
				timers.enqueue( timer, timer.priority + timeout )
			}
			topTimer = timers.peek()
		}
		return true
	}

	reset( time = now() ): void {
		const dt = time - this._time
		this._time = time
		this._timers.forEach( timer => {
			timer.priority += dt
		})
	}

	clear(): boolean {
		return this._timers.clear()
	}

	isEmpty(): boolean {
		return this._timers.isEmpty()
	}

	get size(): number {
		return this._timers.length
	}

	get time(): number {
		return this._time
	}
}
