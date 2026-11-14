import assert from 'node:assert/strict'
import test from 'node:test'
import {
	MAX_HOSTS,
	blockSizeForPrefix,
	calculatePlan,
	firstUsableInt,
	hasBroadcast,
	hostBitsFor,
	hostsToPrefix,
	intToIp,
	ipToBinary,
	ipToInt,
	isPointToPointPrefix,
	lastUsableInt,
	maskForPrefix,
	maskToBinary,
	parseCidr,
	parseHostCount,
	planToCsv,
	planToText,
	prefixKind,
	subnetToText,
	usableHosts,
	validateRequirements,
} from './vlsm.js'
import { calculateFlsm, flsmToCsv, flsmToText } from './flsm.js'
import { explainSubnet, workedExample } from './learning.js'
import { buildReportHtml } from './report.js'

/* ---------------- IPv4 conversion ---------------- */

test('valid IPv4 addresses convert and round-trip', () => {
	for (const ip of [
		'0.0.0.0',
		'10.0.0.1',
		'192.168.1.100',
		'172.16.254.3',
		'223.255.255.254',
		'255.255.255.255',
	]) {
		assert.equal(intToIp(ipToInt(ip)), ip)
	}
})

test('lowest and highest IPv4 addresses', () => {
	assert.equal(ipToInt('0.0.0.0'), 0)
	assert.equal(ipToInt('255.255.255.255'), 0xffffffff)
	assert.equal(ipToInt('255.255.255.255'), 4294967295)
})

test('invalid octets are rejected', () => {
	assert.equal(ipToInt('256.0.0.1'), null)
	assert.equal(ipToInt('1.2.3.999'), null)
	assert.equal(ipToInt('-1.0.0.0'), null)
})

test('missing and extra octets are rejected', () => {
	assert.equal(ipToInt('1.2.3'), null)
	assert.equal(ipToInt('1.2'), null)
	assert.equal(ipToInt(''), null)
	assert.equal(ipToInt('1.2.3.4.5'), null)
})

test('whitespace is trimmed around the address', () => {
	assert.equal(ipToInt('  10.0.0.1  '), ipToInt('10.0.0.1'))
	assert.equal(parseCidr(' 192.168.1.0/24 ').ok, true)
})

test('non-numeric and malformed input is rejected', () => {
	assert.equal(ipToInt('abc'), null)
	assert.equal(ipToInt('1.2.3.04x'), null)
	assert.equal(ipToInt(null), null)
	assert.equal(ipToInt(42), null)
})

/* ---------------- CIDR and subnet masks ---------------- */

test('mask, wildcard, totals and usable counts for key prefixes', () => {
	const cases = [
		{
			prefix: 0,
			mask: '0.0.0.0',
			wildcard: '255.255.255.255',
			size: 4294967296,
			usable: 4294967294,
		},
		{
			prefix: 8,
			mask: '255.0.0.0',
			wildcard: '0.255.255.255',
			size: 16777216,
			usable: 16777214,
		},
		{
			prefix: 16,
			mask: '255.255.0.0',
			wildcard: '0.0.255.255',
			size: 65536,
			usable: 65534,
		},
		{
			prefix: 24,
			mask: '255.255.255.0',
			wildcard: '0.0.0.255',
			size: 256,
			usable: 254,
		},
		{
			prefix: 25,
			mask: '255.255.255.128',
			wildcard: '0.0.0.127',
			size: 128,
			usable: 126,
		},
		{
			prefix: 26,
			mask: '255.255.255.192',
			wildcard: '0.0.0.63',
			size: 64,
			usable: 62,
		},
		{
			prefix: 27,
			mask: '255.255.255.224',
			wildcard: '0.0.0.31',
			size: 32,
			usable: 30,
		},
		{
			prefix: 30,
			mask: '255.255.255.252',
			wildcard: '0.0.0.3',
			size: 4,
			usable: 2,
		},
		{
			prefix: 31,
			mask: '255.255.255.254',
			wildcard: '0.0.0.1',
			size: 2,
			usable: 2,
		},
		{
			prefix: 32,
			mask: '255.255.255.255',
			wildcard: '0.0.0.0',
			size: 1,
			usable: 1,
		},
	]
	for (const c of cases) {
		const parsed = parseCidr(`10.0.0.0/${c.prefix}`)
		assert.equal(parsed.ok, true, `/ ${c.prefix} should parse`)
		assert.equal(parsed.mask, c.mask, `mask /${c.prefix}`)
		assert.equal(parsed.wildcard, c.wildcard, `wildcard /${c.prefix}`)
		assert.equal(parsed.size, c.size, `size /${c.prefix}`)
		assert.equal(parsed.usable, usableHosts(c.prefix), `usable /${c.prefix}`)
		assert.equal(
			blockSizeForPrefix(c.prefix),
			c.size,
			`block size /${c.prefix}`,
		)
	}
})

test('network and broadcast addresses for a /26', () => {
	const parsed = parseCidr('192.168.10.77/26')
	assert.equal(parsed.network, '192.168.10.64')
	assert.equal(parsed.broadcast, '192.168.10.127')
	assert.equal(parsed.normalized, true)
})

test('/0 spans the whole IPv4 space', () => {
	const parsed = parseCidr('0.0.0.0/0')
	assert.equal(parsed.networkInt, 0)
	assert.equal(parsed.broadcastInt, 0xffffffff)
	assert.equal(parsed.size, 4294967296)
})

test('broadcast exists only for traditional prefixes', () => {
	for (const prefix of [0, 8, 24, 30]) assert.equal(hasBroadcast(prefix), true)
	assert.equal(hasBroadcast(31), false)
	assert.equal(hasBroadcast(32), false)
	assert.equal(prefixKind(31), 'p2p')
	assert.equal(prefixKind(32), 'host')
	assert.equal(prefixKind(24), 'lan')
	assert.equal(isPointToPointPrefix(31), true)
	assert.equal(isPointToPointPrefix(32), true)
	assert.equal(isPointToPointPrefix(30), false)
})

test('first/last usable helpers', () => {
	assert.equal(firstUsableInt(0x0a000000, 24), 0x0a000001)
	assert.equal(lastUsableInt(0x0a000000, 24), 0x0a0000fe)
	// /31: both addresses usable
	assert.equal(firstUsableInt(0x0a000000, 31), 0x0a000000)
	assert.equal(lastUsableInt(0x0a000000, 31), 0x0a000001)
	// /32: the single address
	assert.equal(firstUsableInt(0x0a000001, 32), 0x0a000001)
	assert.equal(lastUsableInt(0x0a000001, 32), 0x0a000001)
})

test('mask binary helpers', () => {
	assert.equal(
		maskToBinary(maskForPrefix(25)),
		'11111111.11111111.11111111.10000000',
	)
	assert.equal(ipToBinary('10.0.0.1'), '00001010.00000000.00000000.00000001')
})

test('invalid CIDR input is rejected', () => {
	assert.equal(parseCidr('not-an-ip').ok, false)
	assert.equal(parseCidr('10.0.0.0/33').ok, false)
	assert.equal(parseCidr('10.0.0.0/-1').ok, false)
	assert.equal(parseCidr('').ok, false)
	assert.equal(parseCidr('10.0.0.256/24').ok, false)
	assert.equal(parseCidr('10.0.0.0.0/24').ok, false)
})

test('implicit /24 and normalization flags', () => {
	const implicit = parseCidr('10.20.30.40')
	assert.equal(implicit.cidr, '10.20.30.0/24')
	assert.equal(implicit.hadPrefix, false)
	assert.equal(implicit.normalized, true)
})

/* ---------------- Host sizing & validation ---------------- */

test('classic host sizing reserves network+broadcast', () => {
	assert.equal(hostsToPrefix(1), 30)
	assert.equal(hostsToPrefix(2), 30)
	assert.equal(hostsToPrefix(3), 29)
	assert.equal(hostsToPrefix(62), 26)
	assert.equal(hostsToPrefix(255), 23)
})

test('point-to-point sizing uses /31 and /32', () => {
	assert.equal(hostsToPrefix(1, true), 32)
	assert.equal(hostsToPrefix(2, true), 31)
	assert.equal(hostsToPrefix(3, true), 29)
	assert.equal(hostBitsFor(2, true).hostBits, 1)
	assert.equal(hostBitsFor(100).hostBits, 7)
	assert.equal(hostBitsFor(100).requiredAddresses, 102)
})

test('parseHostCount rejects invalid values with reasons', () => {
	assert.equal(parseHostCount('').reason, 'empty')
	assert.equal(parseHostCount('0').reason, 'zero')
	assert.equal(parseHostCount('-5').reason, 'format')
	assert.equal(parseHostCount('12.5').reason, 'format')
	assert.equal(parseHostCount('abc').reason, 'format')
	assert.equal(parseHostCount('1e3').reason, 'format')
	assert.equal(parseHostCount(String(MAX_HOSTS + 1)).reason, 'tooLarge')
	assert.equal(parseHostCount('100').ok, true)
	assert.equal(parseHostCount('100').hosts, 100)
	assert.equal(parseHostCount(' 7 ').ok, true)
})

test('validateRequirements reports per-row validity', () => {
	const results = validateRequirements([
		{ id: 'a', hosts: '50' },
		{ id: 'b', hosts: '-1' },
		{ id: 'c', hosts: '' },
		{ id: 'd', hosts: '3.14' },
	])
	assert.equal(results[0].ok, true)
	assert.equal(results[1].ok, false)
	assert.equal(results[2].ok, false)
	assert.equal(results[3].ok, false)
})

/* ---------------- VLSM allocation ---------------- */

test('single subnet allocation', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'Only', hosts: 100 },
	])
	assert.equal(plan.subnets.length, 1)
	assert.equal(plan.subnets[0].cidr, '10.0.0.0/25')
	assert.equal(plan.summary.freeAddresses, 128)
	assert.equal(plan.free.length, 1)
	assert.equal(plan.free[0].start, '10.0.0.128')
})

test('requirements entered in random order still allocate deterministically', () => {
	const make = (order) =>
		calculatePlan(
			parseCidr('192.168.10.0/24'),
			order.map(([name, hosts]) => ({ id: name, name, hosts })),
		)
	const a = make([
		['Small', 10],
		['Huge', 100],
		['Mid', 50],
	])
	const b = make([
		['Mid', 50],
		['Huge', 100],
		['Small', 10],
	])
	assert.deepEqual(
		a.subnets.map((s) => s.cidr),
		b.subnets.map((s) => s.cidr),
	)
	assert.deepEqual(
		a.subnets.map((s) => s.cidr),
		['192.168.10.0/25', '192.168.10.128/26', '192.168.10.192/28'],
	)
})

test('equal-sized requirements', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'A', hosts: 10 },
		{ id: 'b', name: 'B', hosts: 10 },
		{ id: 'c', name: 'C', hosts: 10 },
		{ id: 'd', name: 'D', hosts: 10 },
	])
	assert.deepEqual(
		plan.subnets.map((s) => s.cidr),
		['10.0.0.0/28', '10.0.0.16/28', '10.0.0.32/28', '10.0.0.48/28'],
	)
	assert.equal(plan.summary.freeAddresses, 192)
})

test('very large and very small requirements together', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/21'), [
		{ id: 'big', name: 'Big', hosts: 1000 },
		{ id: 'tiny', name: 'Tiny', hosts: 2 },
	])
	// 1000 hosts → /22 (1022 usable). Tiny gets a /30 after it.
	assert.deepEqual(
		plan.subnets.map((s) => s.cidr),
		['10.0.0.0/22', '10.0.4.0/30'],
	)
	assert.equal(plan.summary.failureCount, 0)
})

test('subnet larger than the base network fails with a useful reason', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'big', name: 'Big', hosts: 5000 },
	])
	assert.equal(plan.summary.failureCount, 1)
	assert.equal(plan.failures[0].code, 'tooLarge')
	assert.match(plan.failures[0].reason, /larger than|more than/)
	assert.equal(plan.subnets.length, 0)
})

test('insufficient space: failures do not corrupt later allocations', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'A', hosts: 500 },
		{ id: 'b', name: 'B', hosts: 60 },
		{ id: 'c', name: 'C', hosts: 500 },
		{ id: 'd', name: 'D', hosts: 6 },
	])
	// 500 hosts needs /23 — too large. Both should fail; B and D still fit.
	assert.equal(plan.failures.length, 2)
	assert.deepEqual(
		plan.failures.map((f) => f.code),
		['tooLarge', 'tooLarge'],
	)
	assert.deepEqual(
		plan.subnets.map((s) => s.name),
		['B', 'D'],
	)
	assert.equal(plan.subnets[0].cidr, '10.0.0.0/26')
})

test('completely exhausted address space produces no free gaps', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'A', hosts: 120 },
		{ id: 'b', name: 'B', hosts: 60 },
		{ id: 'c', name: 'C', hosts: 30 },
		{ id: 'd', name: 'D', hosts: 14 },
		{ id: 'e', name: 'E', hosts: 6 },
		{ id: 'f', name: 'F', hosts: 2 },
		{ id: 'g', name: 'G', hosts: 2 },
	])
	assert.equal(plan.summary.failureCount, 0)
	assert.equal(plan.summary.freeAddresses, 0)
	assert.equal(plan.free.length, 0)
	assert.equal(plan.summary.spacePct, 100)
})

test('alignment gaps are reported as free space', () => {
	// Largest first: 100 hosts → /25 placed at .0. Then 60 hosts → /26 at .128,
	// leaving the .160–.255 tail free.
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'A', hosts: 60 },
		{ id: 'b', name: 'B', hosts: 100 },
	])
	assert.deepEqual(
		plan.subnets.map((s) => s.cidr),
		['10.0.0.0/25', '10.0.0.128/26'],
	)
	assert.equal(plan.free.length, 1)
	assert.equal(plan.free[0].start, '10.0.0.192')
	assert.equal(plan.free[0].end, '10.0.0.255')
	assert.equal(plan.free[0].size, 64)
})

test('office scenario allocates the expected subnets with no overlap', () => {
	const base = parseCidr('192.168.10.0/24')
	const requirements = [
		{ id: 'staff', name: 'Staff LAN', hosts: 60 },
		{ id: 'guest', name: 'Guest Wi-Fi', hosts: 25 },
		{ id: 'server', name: 'Servers', hosts: 12 },
		{ id: 'print', name: 'Printers', hosts: 6 },
		{ id: 'mgmt', name: 'Management', hosts: 4 },
		{ id: 'wan', name: 'WAN uplink', hosts: 2 },
	]

	const plan = calculatePlan(base, requirements)
	assert.deepEqual(
		plan.subnets.map((subnet) => subnet.cidr),
		[
			'192.168.10.0/26',
			'192.168.10.64/27',
			'192.168.10.96/28',
			'192.168.10.112/29',
			'192.168.10.120/29',
			'192.168.10.128/30',
		],
	)

	assert.equal(plan.summary.subnetCount, 6)
	assert.equal(plan.summary.failureCount, 0)
	assert.equal(plan.summary.freeAddresses, 124)
	assert.equal(plan.free.length, 1)
	assert.equal(plan.free[0].start, '192.168.10.132')
	assert.equal(plan.free[0].end, '192.168.10.255')
})

/* ---------------- Host efficiency (corrected metric) ---------------- */

test('host efficiency uses usable capacity, not block size', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'p2p', name: 'Link', hosts: 2 }, // /30: usable 2 → 100%
	])
	assert.equal(plan.subnets[0].usable, 2)
	assert.equal(plan.subnets[0].efficiency, 100)
})

test('100 hosts on a /25 → ~79% host efficiency', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'A', hosts: 100 },
	])
	assert.equal(plan.subnets[0].usable, 126)
	assert.ok(Math.abs(plan.subnets[0].efficiency - (100 / 126) * 100) < 1e-9)
})

test('address-space utilization stays a separate summary metric', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'A', hosts: 100 },
	])
	assert.equal(plan.summary.spacePct, 50) // /25 of a /24
	assert.ok(Math.abs(plan.summary.hostEfficiency - (100 / 126) * 100) < 1e-9)
	assert.equal(plan.summary.remainingUsableCapacity, 26)
})

/* ---------------- Gateway handling ---------------- */

test('gateway defaults to the first usable address', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'A', hosts: 50 },
	])
	assert.equal(plan.subnets[0].gateway, '10.0.0.1')
})

test('gateway can use the last usable address', () => {
	const plan = calculatePlan(
		parseCidr('10.0.0.0/24'),
		[{ id: 'a', name: 'A', hosts: 50 }],
		{ gatewayMode: 'last' },
	)
	assert.equal(plan.subnets[0].gateway, '10.0.0.62') // last usable of the /26
})

test('gateway assignment can be disabled', () => {
	const plan = calculatePlan(
		parseCidr('10.0.0.0/24'),
		[{ id: 'a', name: 'A', hosts: 50 }],
		{ gatewayMode: 'none' },
	)
	assert.equal(plan.subnets[0].gateway, null)
})

test('/32 host routes never receive a gateway', () => {
	const plan = calculatePlan(
		parseCidr('10.0.0.0/24'),
		[{ id: 'lo', name: 'Loopback', hosts: 1 }],
		{ allowPointToPoint: true, gatewayMode: 'last' },
	)
	assert.equal(plan.subnets[0].prefix, 32)
	assert.equal(plan.subnets[0].gateway, null)
})

/* ---------------- Point-to-point: /30, /31, /32 ---------------- */

test('/30 in traditional mode: 2 usable, broadcast present', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'Link', hosts: 2 },
	])
	const s = plan.subnets[0]
	assert.equal(s.prefix, 30)
	assert.equal(s.first, '10.0.0.1')
	assert.equal(s.last, '10.0.0.2')
	assert.equal(s.broadcast, '10.0.0.3')
	assert.equal(s.hasBroadcast, true)
	assert.equal(s.gateway, '10.0.0.1')
})

test('/31 in p2p mode: 2 endpoints, NO broadcast, gatewayless is allowed', () => {
	const plan = calculatePlan(
		parseCidr('10.0.0.0/24'),
		[{ id: 'a', name: 'Link', hosts: 2 }],
		{ allowPointToPoint: true },
	)
	const s = plan.subnets[0]
	assert.equal(s.prefix, 31)
	assert.equal(s.first, '10.0.0.0')
	assert.equal(s.last, '10.0.0.1')
	assert.equal(s.broadcast, null, '/31 must not report a broadcast address')
	assert.equal(s.hasBroadcast, false)
	assert.equal(s.usable, 2)
	assert.equal(s.kind, 'p2p')
})

test('/32 in p2p mode: single host address, no broadcast, no gateway', () => {
	const plan = calculatePlan(
		parseCidr('10.0.0.0/24'),
		[{ id: 'a', name: 'Loopback', hosts: 1 }],
		{ allowPointToPoint: true },
	)
	const s = plan.subnets[0]
	assert.equal(s.prefix, 32)
	assert.equal(s.network, '10.0.0.0')
	assert.equal(s.first, '10.0.0.0')
	assert.equal(s.last, '10.0.0.0')
	assert.equal(s.broadcast, null)
	assert.equal(s.gateway, null)
	assert.equal(s.kind, 'host')
})

test('traditional mode still defaults /30 for 1–2 hosts', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'A', hosts: 1 },
		{ id: 'b', name: 'B', hosts: 2 },
	])
	assert.ok(plan.subnets.every((s) => s.prefix === 30))
})

/* ---------------- Property-based style: alignment, overlap, bounds ---------------- */

test('allocations never overlap, stay aligned and inside the base (many cases)', () => {
	const scenarios = [
		['10.0.0.0/24', [[60], [25], [12], [6], [4], [2]]],
		['172.16.4.0/22', [[200], [120], [60], [25], [6]]],
		['10.20.0.0/16', [[4000], [1800], [900], [300], [120], [50]]],
		['192.168.1.0/26', [[10], [4]]],
		['10.0.0.0/20', [[1000], [500], [250], [100], [50], [10], [4], [2]]],
		['10.0.0.0/24', [[120], [60], [30], [14], [6], [2]]],
		['10.0.0.0/23', [[300], [100], [2], [2], [2]]],
	]
	for (const [cidr, reqs] of scenarios) {
		const plan = calculatePlan(
			parseCidr(cidr),
			reqs.map(([hosts], i) => ({ id: `r${i}`, name: `R${i}`, hosts })),
		)
		const sorted = plan.subnets
		for (const s of sorted) {
			assert.equal(
				s.networkInt % s.blockSize,
				0,
				`${s.cidr} in ${cidr} misaligned`,
			)
			assert.ok(s.networkInt >= plan.base.networkInt, `${s.cidr} below base`)
			assert.ok(
				s.broadcastInt <= plan.base.broadcastInt,
				`${s.cidr} exceeds base`,
			)
		}
		for (let i = 1; i < sorted.length; i += 1) {
			assert.ok(
				sorted[i].networkInt > sorted[i - 1].broadcastInt,
				`overlap in ${cidr}`,
			)
		}
		assert.equal(
			plan.summary.allocatedAddresses + plan.summary.freeAddresses,
			plan.summary.totalAddresses,
		)
		assert.ok(plan.summary.spacePct <= 100)
	}
})

test('deterministic across repeated runs with shuffled insertion', () => {
	const base = ['Huge|1000', 'Mid|500', 'Small|50', 'Tiny|2']
	const orders = [
		base,
		[...base].reverse(),
		['Small|50', 'Huge|1000', 'Tiny|2', 'Mid|500'],
	]
	const results = orders.map((order) =>
		calculatePlan(
			parseCidr('10.9.0.0/21'),
			order.map((entry) => {
				const [name, hosts] = entry.split('|')
				return { id: name, name, hosts: Number(hosts) }
			}),
		).subnets.map((s) => s.cidr),
	)
	assert.deepEqual(results[0], results[1])
	assert.deepEqual(results[0], results[2])
})

test('free-space totals account for every skipped address', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'A', hosts: 60 },
		{ id: 'b', name: 'B', hosts: 100 },
	])
	const freeTotal = plan.free.reduce((sum, gap) => sum + gap.size, 0)
	assert.equal(freeTotal, plan.summary.freeAddresses)
	assert.equal(freeTotal, 64)
})

/* ---------------- Exports ---------------- */

test('text export includes allocated and failed rows plus metrics', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'Mid', hosts: 100 },
		{ id: 'b', name: 'Huge', hosts: 5000 },
	])

	const text = planToText(plan)
	assert.match(text, /VLSM plan for 10\.0\.0\.0\/24/)
	assert.match(text, /10\.0\.0\.0\/25/)
	assert.match(text, /Unplaced requirements/)
	assert.match(text, /Huge/)
	assert.match(text, /Host efficiency/)
	assert.match(text, /utilization/i)
	assert.match(subnetToText(plan.subnets[0]), /Subnet:\s+10\.0\.0\.0\/25/)
})

test('/31 and /32 are represented accurately in exports', () => {
	const plan = calculatePlan(
		parseCidr('10.0.0.0/24'),
		[
			{ id: 'a', name: 'Link', hosts: 2 },
			{ id: 'b', name: 'Lo', hosts: 1 },
		],
		{ allowPointToPoint: true },
	)
	const text = subnetToText(plan.subnets[0])
	assert.match(text, /RFC 3021/)
	assert.ok(!/Broadcast:/.test(text))

	const csv = planToCsv(plan)
	assert.match(csv, /n\/a/) // broadcast column marked n/a for /31 and /32
	assert.match(csv, /"p2p"/)
	assert.match(csv, /"host"/)
})

test('CSV export includes summary block and quoted cells', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'A', hosts: 100 },
	])
	const csv = planToCsv(plan)
	assert.match(csv, /"Summary"/)
	assert.match(csv, /"Host efficiency %","79\.4"/)
	assert.match(csv, /"Address-space utilization %","50\.0"/)
	assert.ok(csv.includes('\r\n'))
})

/* ---------------- FLSM ---------------- */

test('FLSM: 4 subnets of 50 hosts from a /24 → /26', () => {
	const flsm = calculateFlsm(parseCidr('192.168.1.0/24'), 4, 50)
	assert.equal(flsm.ok, true)
	assert.equal(flsm.prefix, 26)
	assert.equal(flsm.subnetBits, 2)
	assert.equal(flsm.hostBits, 6)
	assert.equal(flsm.subnetMask, '255.255.255.192')
	assert.equal(flsm.blockSize, 64)
	assert.equal(flsm.totalSubnets, 4)
	assert.equal(flsm.hostsAvailable, 62)
	assert.deepEqual(
		flsm.subnets.map((s) => s.cidr),
		[
			'192.168.1.0/26',
			'192.168.1.64/26',
			'192.168.1.128/26',
			'192.168.1.192/26',
		],
	)
	assert.equal(flsm.summary.freeAddresses ?? 0, 0)
})

test('FLSM rounds up subnet count to a power of two', () => {
	const flsm = calculateFlsm(parseCidr('10.0.0.0/24'), 5, 10)
	assert.equal(flsm.totalSubnets, 8)
	assert.equal(flsm.prefix, 27)
	assert.equal(flsm.unusedSubnets, 3)
})

test('FLSM rejects subnets or hosts that cannot fit', () => {
	assert.equal(calculateFlsm(parseCidr('10.0.0.0/24'), 300, 10).ok, false)
	assert.equal(calculateFlsm(parseCidr('10.0.0.0/24'), 2, 500).ok, false)
	assert.equal(calculateFlsm(parseCidr('10.0.0.0/24'), 0, 10).ok, false)
	assert.equal(calculateFlsm(parseCidr('10.0.0.0/24'), 2, 0).ok, false)
	const err = calculateFlsm(parseCidr('10.0.0.0/24'), 2, 5000)
	assert.match(err.error, /\/3[23]|longer|larger/i)
})

test('FLSM exports', () => {
	const flsm = calculateFlsm(parseCidr('192.168.1.0/24'), 4, 50)
	const text = flsmToText(flsm)
	assert.match(text, /FLSM plan for 192\.168\.1\.0\/24/)
	assert.match(text, /\/26/)
	const csv = flsmToCsv(flsm)
	assert.match(csv, /"192\.168\.1\.64\/26"/)
	assert.match(csv, /"255\.255\.255\.192"/)
})

/* ---------------- Learning Mode ---------------- */

test('learning explanations follow the classic 100-host derivation', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'Users', hosts: 100 },
	])
	const { steps } = explainSubnet(plan.subnets[0], { lang: 'en' })
	const all = steps.map((s) => s.body).join(' ')
	assert.match(all, /102/)
	assert.match(all, /7/)
	assert.match(all, /\/25/)
	assert.match(all, /255\.255\.255\.128/)
	assert.match(all, /126/)
})

test('learning explanations flag /31 and /32 semantics', () => {
	const plan = calculatePlan(
		parseCidr('10.0.0.0/24'),
		[
			{ id: 'a', name: 'Link', hosts: 2 },
			{ id: 'b', name: 'Lo', hosts: 1 },
		],
		{ allowPointToPoint: true },
	)
	const link = explainSubnet(plan.subnets[0], {
		lang: 'en',
		allowPointToPoint: true,
	})
	const linkText = link.steps.map((s) => `${s.title} ${s.body}`).join(' ')
	assert.match(linkText, /NOT a broadcast/i)

	const loop = explainSubnet(plan.subnets[1], {
		lang: 'en',
		allowPointToPoint: true,
	})
	const loopText = loop.steps.map((s) => `${s.title} ${s.body}`).join(' ')
	assert.match(loopText, /not a conventional point-to-point subnet|ONE single/i)
})

test('learning explanations localize to French', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'Users', hosts: 100 },
	])
	const { steps } = explainSubnet(plan.subnets[0], { lang: 'fr' })
	const all = steps.map((s) => `${s.title} ${s.body}`).join(' ')
	assert.match(all, /Bits d’hôte|Puissances/)
	assert.match(all, /Résultat : \/25/)
})

test('worked example matches the spec narrative', () => {
	const text = workedExample(100)
	assert.match(text, /100 \+ 2 = 102/)
	assert.match(text, /Host bits = 7/)
	assert.match(text, /\/25/)
	assert.match(text, /255\.255\.255\.128/)
	assert.match(text, /126/)
})

/* ---------------- PDF report ---------------- */

test('PDF report HTML includes table, summary and free ranges', () => {
	const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
		{ id: 'a', name: 'Users', hosts: 100, color: '#38bdf8' },
		{ id: 'b', name: 'Huge', hosts: 5000 },
	])
	const html = buildReportHtml(plan, 'en')
	assert.match(html, /IPv4 Network Allocation Report/)
	assert.match(html, /Users/)
	assert.match(html, /\/25 · 255\.255\.255\.128/)
	assert.match(html, /10\.0\.0\.1 – 10\.0\.0\.126/)
	assert.match(html, /Host efficiency/)
	assert.match(html, /Failed requirements/)
	assert.match(html, /Remaining free ranges/)

	const fr = buildReportHtml(plan, 'fr')
	assert.match(fr, /Rapport d'allocation réseau IPv4/)
})

test('PDF report explains /31 links', () => {
	const plan = calculatePlan(
		parseCidr('10.0.0.0/24'),
		[{ id: 'a', name: 'Link', hosts: 2 }],
		{ allowPointToPoint: true },
	)
	const html = buildReportHtml(plan, 'en')
	assert.match(html, /RFC 3021/)
})
