export class TimerPool {
	clock: number
	timers: Timer[]
	
	constructor() {
	}

	setTimeout( f, delay, ...args ) {
		return enqueueTimer( this, new Timer( f, delay, args, false ))
	}

	setInterval( f, delay, ...args ) {
		return enqueueTimer( this, new Timer( f, delay, args, true ))
	}

	clearTimeout( timer ) {
		return removeTimer( this, timer )
	}

	clearInterval( timer ) {
		return removeTimer( this, timer )
	}

	update( clock ) {
		this.clock = clock
		while ( this.size > 0 && this.priorities[0] <= clock ) {
			const timer = dequeueTimer( this )
			const {f,delay,args,interval} = timer
			f.apply( this, args )
			if ( interval ) {
				enqueueTimer( this, timer, this.priorities[0] + delay )
			}
		}
	}

	reset( clock ) {
		const dt = clock - this.clock
		this.clock = clock
		for ( i = 0; i < this.size; i++ ) {
			this.priorities[i] += dt
		}
	}

	get size() {
		return this.priorities.length
	}
}

const enqueueTimer = ( self, timer, clock ) => {
	const index = self.size
	self.timers.push( timer )
	self.priorities.push( clock )
	self.indices.set( timer, index )
	siftUp( self, index )
	return timer
}

const dequeueTimer = ( self ) => {
	const timer = self.timers[0]
	self.indices.delete( timer )
	if ( self.size > 1 ) {
		self.timers[0] = timers.pop()
		self.priorities[0] = priorities.pop()
		self.indices.set( timers[0], 0 )
		siftDown( self, 0 )
	} else {
		self.timers.pop()
		self.priorities.pop()
	}
	return timer
}

const removeTimer = ( self, timer ) => {
	const index = self.indices.get( timer )
	if ( index !== undefined ) {
		const timers = self.timers
		const priorities = self.priorities
		const indices = self.indices
		indices.delete( timer )
		if ( index == self.size-1 ) {
			timers.pop()
			priorities.pop()
		} else {
			timers[index] = timers.pop()
			priorities[index] = priorities.pop()
			indices.set( timers[index], index )
			if ( self.size > 1 ) {
				siftDown( self, siftUp( self, index ))
			}
		}
		return true
	} else {
		return false
	}
}

const siftUp = ( self, from ) => {
	let index = from
	let parentIndex = index >> 1
	while (index > 0 && priorities[parentIndex] > priorities[index]) {
		swap( self, index, parentIndex )
		index = parentIndex
		parentIndex = parentIndex >> 1
	}
	return index
}

const siftDown = ( self, limit ) => {
	const size = self.size
	const priorities = self.priorities
	for ( let index = limit-1; index >= 0; i-- ) {
		let leftIndex = index + index
		let rightIndex = leftIndex + 1
		while (leftIndex < size) {
			let smaller = leftIndex
			if (rightIndex < size && priorities[leftIndex] > priorities[rightIndex]) {
				smaller = rightIndex
			}
			if ( priorities[index] > priorities[smaller] ) {
				swap( self, index, smaller )
			} else {
				break
			}
			index = smaller
			leftIndex = index + index
			rightIndex = leftIndex + 1
		}
	}
}

const swap = ( self, i, j ) => {
	const tempTimer = self.timers[i]
	const tempPriority = self.priorities[i]
	self.timers[i] = self.timers[j]
	self.priorities[i] = self.priorities[j]
	self.indices.set( self.timers[i], i )
	self.timers[j] = tempTimer
	self.priorities[j] = tempPriority
	self.indices.set( tempTimer, j )
}
