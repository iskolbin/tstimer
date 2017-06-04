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
		if ( this.has( timer )) {
			return false 
		} else {
			timer.descriptor = this._timers.enqueue( timer, timer.timeout )
			return true
		}
	}

	delete( timer: Timer ): boolean {
		return this._timers.delete( timer, timer.descriptor )
	}

	has( timer: Timer ): boolean {
		return this._timers.has( timer, timer.descriptor )
	}

	setTimeout( handler: (...args:any[]) => void, interval: number, ...args: any[] ): Timer {
		const timer = new Timer( handler, interval, args, false )
		timer.timeout = this._time + interval
		timer.descriptor = this._timers.enqueue( timer, timer.timeout )
		return timer
	}

	setInterval( handler: (...args:any[]) => void, interval: number, ...args: any[] ): Timer {
		const timer = new Timer( handler, interval, args, true )
		timer.timeout = this._time + interval
		timer.descriptor = this._timers.enqueue( timer, timer.timeout )
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
		let closestTimeout = timers.firstPriority()
		while ( closestTimeout !== undefined && closestTimeout <= time ) {
			const timer = (<Timer>timers.dequeue())
			const {handler, args, intervalMode} = timer
			handler.apply( timer, args )
			if ( intervalMode ) {
				timer.timeout = closestTimeout + timer.interval
				timers.enqueue( timer, timer.timeout )
			}
			closestTimeout = timers.firstPriority()
		}
		return true
	}

	reset( time = now() ): void {
		const dt = time - this._time
		this._time = time
		this._timers.forEach( timer => {
			timer.timeout += dt
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
