import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calculatePlan,
  hostsToPrefix,
  intToIp,
  ipToInt,
  maskForPrefix,
  parseCidr,
  planToCsv,
  planToText,
  subnetToText,
  usableHosts,
} from './vlsm.js'

test('IP addresses round-trip through integers', () => {
  for (const ip of ['0.0.0.0', '10.0.0.1', '172.16.254.3', '255.255.255.255']) {
    assert.equal(intToIp(ipToInt(ip)), ip)
  }
  assert.equal(ipToInt('256.0.0.1'), null)
  assert.equal(ipToInt('1.2.3'), null)
})

test('CIDR parsing normalizes host bits and assumes /24', () => {
  const normalized = parseCidr('192.168.10.77/26')
  assert.equal(normalized.ok, true)
  assert.equal(normalized.cidr, '192.168.10.64/26')
  assert.equal(normalized.normalized, true)
  assert.equal(normalized.broadcast, '192.168.10.127')
  assert.equal(normalized.size, 64)

  const implicit = parseCidr('10.20.30.40')
  assert.equal(implicit.cidr, '10.20.30.0/24')
  assert.equal(implicit.hadPrefix, false)

  assert.equal(parseCidr('not-an-ip').ok, false)
  assert.equal(parseCidr('10.0.0.0/33').ok, false)
  assert.equal(parseCidr('10.0.0.0/12').ok, true)
})

test('mask helpers produce correct dotted quads', () => {
  assert.equal(maskForPrefix(24), 0xffffff00)
  assert.equal(maskForPrefix(0), 0)
  assert.equal(maskForPrefix(32), 0xffffffff)
  assert.equal(parseCidr('10.0.0.0/20').mask, '255.255.240.0')
  assert.equal(parseCidr('10.0.0.0/20').wildcard, '0.0.15.255')
})

test('host sizing follows classic VLSM and RFC 3021', () => {
  assert.equal(hostsToPrefix(1), 30)
  assert.equal(hostsToPrefix(2), 30)
  assert.equal(hostsToPrefix(3), 29)
  assert.equal(hostsToPrefix(62), 26)
  assert.equal(hostsToPrefix(255), 23)
  assert.equal(hostsToPrefix(1, true), 32)
  assert.equal(hostsToPrefix(2, true), 31)
  assert.equal(usableHosts(30), 2)
  assert.equal(usableHosts(31), 2)
  assert.equal(usableHosts(32), 1)
  assert.equal(usableHosts(24), 254)
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

  for (const subnet of plan.subnets) {
    assert.equal(subnet.networkInt % subnet.blockSize, 0, `${subnet.cidr} is not aligned`)
    assert.ok(subnet.networkInt >= base.networkInt)
    assert.ok(subnet.broadcastInt <= base.broadcastInt)
  }

  for (let index = 1; index < plan.subnets.length; index += 1) {
    assert.ok(plan.subnets[index].networkInt > plan.subnets[index - 1].broadcastInt)
  }
})

test('oversized requests fail but smaller requests still fit', () => {
  const base = parseCidr('10.0.0.0/24')
  const plan = calculatePlan(base, [
    { id: 'big', name: 'Big', hosts: 300 },
    { id: 'mid', name: 'Mid', hosts: 100 },
    { id: 'small', name: 'Small', hosts: 10 },
  ])

  assert.equal(plan.summary.failureCount, 1)
  assert.equal(plan.failures[0].name, 'Big')
  assert.match(plan.failures[0].reason, /larger than the entire/)
  assert.deepEqual(
    plan.subnets.map((subnet) => subnet.cidr),
    ['10.0.0.0/25', '10.0.0.128/28'],
  )
  assert.equal(plan.free[0].start, '10.0.0.144')
})

test('point-to-point mode produces /31 and /32 blocks', () => {
  const base = parseCidr('10.255.0.0/24')
  const plan = calculatePlan(
    base,
    [
      { id: 'a', name: 'Link A', hosts: 2 },
      { id: 'b', name: 'Link B', hosts: 2 },
      { id: 'c', name: 'Loopback', hosts: 1 },
    ],
    { allowPointToPoint: true },
  )

  assert.deepEqual(
    plan.subnets.map((subnet) => subnet.cidr),
    ['10.255.0.0/31', '10.255.0.2/31', '10.255.0.4/32'],
  )
  assert.equal(plan.subnets[0].gateway, '10.255.0.0')
  assert.equal(plan.subnets[0].usable, 2)
})

test('summary totals are internally consistent', () => {
  const base = parseCidr('172.16.4.0/22')
  const plan = calculatePlan(base, [
    { id: 'web', name: 'Web', hosts: 200 },
    { id: 'app', name: 'App', hosts: 120 },
    { id: 'db', name: 'DB', hosts: 60 },
  ])
  const allocated = plan.subnets.reduce((sum, subnet) => sum + subnet.blockSize, 0)

  assert.equal(plan.summary.allocatedAddresses, allocated)
  assert.equal(
    plan.summary.allocatedAddresses + plan.summary.freeAddresses,
    plan.summary.totalAddresses,
  )
  assert.equal(plan.summary.totalAddresses, 1024)
})

test('text and CSV exports include allocated and failed rows', () => {
  const plan = calculatePlan(parseCidr('10.0.0.0/24'), [
    { id: 'a', name: 'Mid', hosts: 100 },
    { id: 'b', name: 'Huge', hosts: 5000 },
  ])

  const text = planToText(plan)
  assert.match(text, /VLSM plan for 10\.0\.0\.0\/24/)
  assert.match(text, /10\.0\.0\.0\/25/)
  assert.match(text, /Unplaced requirements/)
  assert.match(text, /Huge/)

  const csv = planToCsv(plan)
  assert.match(csv, /"Allocated","Mid"/)
  assert.match(csv, /"Unplaced","Huge"/)
  assert.match(subnetToText(plan.subnets[0]), /Subnet:\s+10\.0\.0\.0\/25/)
})
