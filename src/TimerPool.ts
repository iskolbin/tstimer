import { PriorityQueue } from 'tspriorityqueue'
import { now } from 'tsnow'
import { Timer } from './Timer'

export class TimerPool {
	protected time: number = 0
	protected timers = new PriorityQueue<Timer,number>()

	add( timer: Timer ): boolean {
		return this.timers.enqueue( timer )
	}

	delete( timer: Timer ): boolean {
		return this.timers.delete( timer )
	}

	has( timer: Timer ): boolean {
		return this.timers.has( timer )
	}

	setTimeout( handler: (...args:any[]) => void, timeout: number, ...args: any[] ): Timer {
		const timer = new Timer( handler, timeout, args, false )
		this.timers.enqueue( timer, this.time + timeout )
		return timer
	}

	setInterval( handler: (...args:any[]) => void, timeout: number, ...args: any[] ): Timer {
		const timer = new Timer( handler, timeout, args, true )
		this.timers.enqueue( timer, this.time + timeout )
		return timer
	}

	clearTimeout( timer: Timer ): boolean {
		return this.delete( timer )
	}

	clearInterval( timer: Timer ): boolean {
		return this.delete( timer )
	}

	update( time: number = now() ): boolean {
		this.time = time
		if ( this.size === 0 ) {
			return false
		}
		const {timers} = this
		let topTimer = timers.peek()
		while ( topTimer !== undefined && topTimer.priority <= time ) {
			const timer = timers.dequeue()
			if ( timer !== undefined ) {
				const {handler, timeout, args, intervalMode} = timer
				handler.apply( timer, args )
				if ( intervalMode ) {
					timers.enqueue( timer, timer.priority + timeout )
				}
			}
			topTimer = timers.peek()
		}
		return true
	}

	reset( time = now() ): void {
		const dt = time - this.time
		this.time = time
		this.timers.forEach( timer => {
			timer.priority += dt
		})
	}

	get size(): number {
		return this.timers.length
	}
}
