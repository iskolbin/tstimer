import { Timer } from './Timer'
import { now } from 'tsnow'

export class TimerPool {
	protected timers: Timer[] = []
	protected time: number = 0

	add( timer: Timer ): TimerPool {
		if ( timer.index < 0 ) {
			this.enqueueTimer( timer )
		}
		return this
	}

	delete( timer: Timer ): boolean {
		return this.removeTimer( timer )
	}

	has( timer: Timer ): boolean {
		return this.timers[timer.index] === timer
	}

	setTimeout( handler: (...args:any[]) => void, timeout: number, ...args: any[] ): Timer {
		return this.enqueueTimer( new Timer( handler, timeout, args, false ))
	}

	setInterval( handler: (...args:any[]) => void, timeout: number, ...args: any[] ): Timer {
		return this.enqueueTimer( new Timer( handler, timeout, args, true ))
	}

	clearTimeout( timer: Timer ): boolean {
		return this.removeTimer( timer )
	}

	clearInterval( timer: Timer ): boolean {
		return this.removeTimer( timer )
	}

	update( time: number = now() ): boolean {
		this.time = time
		if ( this.size === 0 ) {
			return false
		}
		while ( this.size > 0 && this.timers[0].priority <= time ) {
			const timer = this.dequeueTimer()
			if ( timer ) {
				const {handler, timeout, args, intervalMode} = timer
				handler.apply( timer, args )
				if ( intervalMode ) {
					this.enqueueTimer( timer, this.timers[0].priority + timeout )
				}
			}
		}
		return true
	}

	reset( time = now() ): void {
		const dt = time - this.time
		this.time = time
		for ( const timer of this.timers ) {
			timer.priority += dt
		}
	}

	get size(): number {
		return this.timers.length
	}

	protected enqueueTimer( timer: Timer, time: number = this.time ): Timer {
		if ( timer.index < 0 ) {
			const index = this.size
			this.timers.push( timer )
			timer.priority = time
			timer.index = index
			this.siftUp( index )
		}
		return timer
	}

	protected dequeueTimer(): undefined | Timer {
		const newRoot = this.timers.pop()
		if ( newRoot ) {
			const timer = this.timers[0]
			timer.index = -1
			if ( this.size > 1 ) {
				this.timers[0] = newRoot
				newRoot.index = 0
				this.siftDown( 0 )
			}
			return timer
		} else {
			return undefined
		}
	}

	protected removeTimer( timer: Timer ): boolean {
		const index = timer.index
		const timers = this.timers
		if ( index >= 0 && timers[index] === timer ) {
			timer.index = -1
			const lastTimer = timers.pop()
			if ( lastTimer && lastTimer.index !== this.size - 1 ) {
				timers[index] = lastTimer
				lastTimer.index = index
				if ( this.size > 1 ) {
					this.siftDown( this.siftUp( index ))
				}
			}
			return true
		} else {
			return false
		}
	}

	protected siftUp( at: number ): number {
		let index = at
		let parentIndex = index >> 1
		const timers = this.timers
		while (index > 0 && timers[parentIndex].priority > timers[index].priority ) {
			index = parentIndex
			parentIndex = parentIndex >> 1
		}
		return index
	}

	protected siftDown( limit: number ): void {
		const size = this.size
		const timers = this.timers
		for ( let index = limit-1; index >= 0; index-- ) {
			let leftIndex = index + index
			let rightIndex = leftIndex + 1
			while (leftIndex < size) {
				let smaller = leftIndex
				if ( rightIndex < size && timers[leftIndex].priority > timers[rightIndex].priority ) {
					smaller = rightIndex
				}
				if ( timers[index].priority > timers[smaller].priority ) {
					this.swap( index, smaller )
				} else {
					break
				}
				index = smaller
				leftIndex = index + index
				rightIndex = leftIndex + 1
			}
		}
	}

	protected swap( i: number, j: number ): void {
		const tempTimer = this.timers[i]
		const tempPriority = this.timers[i].priority
		this.timers[i] = this.timers[j]
		this.timers[i].priority = this.timers[j].priority
		this.timers[i].index = i
		this.timers[j] = tempTimer
		this.timers[j].priority = tempPriority
		this.timers[j].index = j
	}
}
