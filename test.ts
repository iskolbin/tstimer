import { Timer } from './src/Timer'
import { TimerPool } from './src/TimerPool'
import { equal, deepEqual } from 'assert'
import { suite, test } from 'mocha-typescript'
import { now } from 'tsnow'

@suite class TimerPoolTestSute {
	@test("default constructor") case0() {
		const tp = new TimerPool()
		const nowTime = now()
		equal( nowTime - tp.time <= 0.1, true )
	}
	
	@test("size") case1() {
		const tp = new TimerPool(0);
		([0,1,2,3,4]).forEach( i => {
			equal( tp.size, i )
			tp.setTimeout( () => {}, 100 )
			equal( tp.size, i+1 )
		})
	}

	@test("add and delete") case2() {
		const tp = new TimerPool(0)
		const t1 = tp.setTimeout( () => {}, 100, 1, 2 )
		const t2 = tp.setTimeout( () => {}, 200, 3, 4 )
		equal( tp.size, 2 )
		equal( tp.has( t1 ), true )
		equal( tp.has( t2 ), true )
		tp.delete( t1 )
		equal( tp.has( t1 ), false )
		equal( tp.has( t2 ), true )
		tp.delete( t2 )
		equal( tp.has( t1 ), false )
		equal( tp.has( t2 ), false )
	}

	@test("add and delete multiple times") case3() {
		const tp = new TimerPool(0)
		const t1 = tp.setTimeout( () => {}, 100 )
		const t2 = tp.setTimeout( () => {}, 200 )
		equal( tp.add( t1 ), false )
		equal( tp.add( t2 ), false )
		equal( tp.size, 2 )
		equal( tp.has( t1 ), true )
		equal( tp.has( t2 ), true )
		equal( tp.delete( t1 ), true )
		equal( tp.delete( t1 ), false )
		equal( tp.has( t1 ), false )
		equal( tp.has( t2 ), true )
		equal( tp.delete( t2 ), true )
		equal( tp.delete( t2 ), false )
		equal( tp.has( t1 ), false )
		equal( tp.has( t2 ), false )
	}

	@test("is empty and clear") case4() {
		const tp = new TimerPool(0)
		equal( tp.isEmpty(), true )
		equal( tp.clear(), false );
		[0,1,2,3,4].forEach( i => {
			tp.setTimeout( () => {}, 100 )
		})
		equal( tp.isEmpty(), false )
		equal( tp.size, 5 )
		equal( tp.clear(), true )
		equal( tp.size, 0 )
	}

	@test("manually add") case5() {
		const tp = new TimerPool(0)
		const v1 = {handler: () => {}, timeout: 100, interval: 100, args: [], descriptor: -1, intervalMode: true }
		const v2 = {handler: () => {}, timeout: 100, interval: 100, args: [], descriptor: -1, intervalMode: false }
		const v3 = {handler: () => {}, timeout: 100, interval: 100, args: [], descriptor: 0, intervalMode: true }
		const v4 = new Timer( () => {}, 100 )
		const v5 = new Timer( () => {}, 100, [] )
		const v6 = new Timer( () => {}, 100, [], true )
		equal( tp.add( v3 ), true )
		equal( tp.add( v1 ), true )
		equal( tp.add( v1 ), false )
		equal( tp.size, 2 )
		equal( tp.add( v2 ), true )
		equal( tp.add( v2 ), false )
		equal( tp.size, 3 )
		equal( tp.add( v3 ), false )
		equal( tp.add( v4 ), true )
		equal( tp.add( v5 ), true )
		equal( tp.add( v6 ), true )
		equal( tp.size, 6 )
	}

	@test("setTimeout/setInterval/clearTimeout/clearInterval") case6() {
		const tp = new TimerPool(0)
		const t1 = tp.setTimeout( () => {}, 200 )
		equal( tp.has( t1 ), true )
		const t2 = tp.setInterval( () => {}, 100, 1, 2 )
		equal( tp.has( t2 ), true )
		equal( tp.clearTimeout( t1 ), true )
		equal( tp.clearTimeout( t1 ), false )
		equal( tp.clearInterval( t2 ), true )
		equal( tp.clearInterval( t2 ), false )
		const t3 = tp.setInterval( () => {}, 100 )
		equal( tp.has( t3 ), true )
		equal( tp.clearInterval( t3 ), true )
	}

	@test("reset") case7() {
		const tp = new TimerPool(0)
		const ts = [0,1,2,3,4].map( i => tp.setTimeout( () => {}, i * 100 ))
		tp.reset( 300 )
		ts.forEach( ({timeout},i) => {
			equal( timeout, i*100 + 300 )
		})
		const currentTime = now()
		tp.reset()
		ts.forEach( ({timeout},i) => {
			equal( (currentTime - timeout - i*100 - 300) <= 0.1, true )
		})
	}

	@test("simulation timeouts") case8() {
		const tp = new TimerPool(0)
		let message = ""
		tp.setTimeout( () => { message = message + "H" }, 50 )
		tp.setTimeout( () => { message = message + "e" }, 100 )
		tp.setTimeout( () => { message = message + "l" }, 150 )
		tp.setTimeout( () => { message = message + "l" }, 200 )
		tp.setTimeout( () => { message = message + "o" }, 250 )
		tp.update( 50 )
		equal( message, "H" )
		tp.update( 100 )
		equal( message, "He" )
		tp.update( 150 )
		equal( message, "Hel" )
		tp.update( 200 )
		equal( message, "Hell" )
		tp.update( 250 )
		equal( message, "Hello" )
		equal( tp.isEmpty(), true )
	}

	@test("simulation intervals") case9() {
		const tp = new TimerPool(0)
		let message = ""
		const t = tp.setInterval( () => { message = message + "*" }, 50 )
		tp.update( 50 )
		equal( message, "*" )
		tp.update( 100 )
		equal( message, "**" )
		tp.update( 150 )
		equal( message, "***" )
		tp.update( 200 )
		equal( message, "****" )
		tp.update( 250 )
		equal( message, "*****" )
		equal( tp.isEmpty(), false )
		tp.clearInterval( t )
		tp.update( 300 )
		equal( message, "*****" )
		equal( tp.isEmpty(), true )
	}

	@test("simulation real") case10() {
		const tp = new TimerPool()
		let message = ""
		tp.setTimeout( () => { message = message + "H" }, 50 )
		tp.setTimeout( () => { message = message + "e" }, 100 )
		tp.setTimeout( () => { message = message + "l" }, 150 )
		tp.setTimeout( () => { message = message + "l" }, 200 )
		tp.setTimeout( () => { message = message + "o" }, 250 )
		setInterval( () => { tp.update() } )
		setTimeout( () => {equal( message, "H" )}, 50 )
		setTimeout( () => {equal( message, "He" )}, 100 )
		setTimeout( () => {equal( message, "Hel" )}, 150 )
		setTimeout( () => {equal( message, "Hell" )}, 200 )
		setTimeout( () => {equal( message, "Hello" )}, 250 )
	}
}
