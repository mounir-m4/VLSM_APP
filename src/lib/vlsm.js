/**
 * Core VLSM math — pure functions, no React dependencies.
 *
 * IPv4 addresses are handled as unsigned integers (0 .. 2^32 - 1) using
 * arithmetic where possible so we never overflow into negative numbers.
 */

export const MAX_HOSTS = 4294967294

/** Parse a dotted-quad IPv4 string into an unsigned 32-bit integer. */
export function ipToInt(ip) {
  if (typeof ip !== 'string') return null
  const parts = ip.trim().split('.')
  if (parts.length !== 4) return null
  let value = 0
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null
    const octet = Number(part)
    if (octet > 255) return null
    value = value * 256 + octet
  }
  return value
}

/** Render an unsigned 32-bit integer as a dotted-quad IPv4 string. */
export function intToIp(value) {
  const n = value >>> 0
  return `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`
}

/** Subnet mask as an unsigned integer for a prefix length. */
export function maskForPrefix(prefix) {
  if (prefix <= 0) return 0
  if (prefix >= 32) return 0xffffffff >>> 0
  return (0xffffffff << (32 - prefix)) >>> 0
}

/** Wildcard (inverse) mask as an unsigned integer. */
export function wildcardForPrefix(prefix) {
  return (~maskForPrefix(prefix)) >>> 0
}

/** Render a mask integer as a dotted quad. */
export function maskToString(mask) {
  return [24, 16, 8, 0].map((shift) => (mask >>> shift) & 255).join('.')
}

/** Usable host addresses in a subnet of the given prefix length. */
export function usableHosts(prefix) {
  if (prefix >= 32) return 1
  if (prefix === 31) return 2
  return 2 ** (32 - prefix) - 2
}

/**
 * Smallest prefix that holds `hosts` hosts.
 * Classic VLSM reserves network + broadcast, so 1 host needs a /30.
 * With RFC 3021 mode enabled, 2-host links use /31 and 1-host links use /32.
 */
export function hostsToPrefix(hosts, allowPointToPoint = false) {
  const value = Math.max(1, Math.floor(Number(hosts) || 0))
  if (allowPointToPoint) {
    if (value <= 1) return 32
    if (value <= 2) return 31
  }
  const required = value + 2 // network + broadcast
  const hostBits = Math.min(32, Math.ceil(Math.log2(required)))
  return 32 - hostBits
}

/** Parse "10.0.0.0/16" (prefix optional, defaults to /24) and normalize it. */
export function parseCidr(input) {
  const raw = String(input ?? '').trim()
  if (!raw) {
    return { ok: false, error: 'Enter a base network, e.g. 192.168.10.0/24.' }
  }

  const match = /^(\d{1,3}(?:\.\d{1,3}){3})\s*(?:\/\s*(\d{1,2}))?$/.exec(raw)
  if (!match) {
    return { ok: false, error: 'Use CIDR notation, like 10.0.0.0/16.' }
  }

  const ip = ipToInt(match[1])
  if (ip === null) {
    return { ok: false, error: 'That IPv4 address isn’t valid — each octet must be 0 to 255.' }
  }

  const prefix = match[2] === undefined ? 24 : Number(match[2])
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return { ok: false, error: 'The prefix must be between /0 and /32.' }
  }

  const size = 2 ** (32 - prefix)
  const networkInt = Math.floor(ip / size) * size
  const broadcastInt = networkInt + size - 1
  const maskInt = maskForPrefix(prefix)
  const wildcardInt = wildcardForPrefix(prefix)
  const network = intToIp(networkInt)

  return {
    ok: true,
    ip,
    prefix,
    size,
    networkInt,
    broadcastInt,
    maskInt,
    wildcardInt,
    network,
    broadcast: intToIp(broadcastInt),
    mask: maskToString(maskInt),
    wildcard: maskToString(wildcardInt),
    cidr: `${network}/${prefix}`,
    usable: usableHosts(prefix),
    normalized: networkInt !== ip,
    hadPrefix: match[2] !== undefined,
  }
}

/** Human-friendly integer formatting. */
export function formatCount(value) {
  return Number(value).toLocaleString('en-US')
}

/**
 * Build a complete VLSM allocation.
 *
 * @param {object} base        Result of parseCidr()
 * @param {Array}  requirements [{ id, name, hosts, color }]
 * @param {object} options     { allowPointToPoint }
 */
export function calculatePlan(base, requirements, options = {}) {
  const allowP2P = Boolean(options.allowPointToPoint)

  const prepared = requirements
    .map((req) => {
      const hosts = Math.max(1, Math.floor(Number(req.hosts) || 0))
      const prefix = hostsToPrefix(hosts, allowP2P)
      return {
        ...req,
        hosts,
        prefix,
        blockSize: 2 ** (32 - prefix),
        originalOrder: req.order ?? 0,
      }
    })
    // Largest blocks first; ties broken by host count, then name for stability.
    .sort(
      (a, b) =>
        b.blockSize - a.blockSize ||
        b.hosts - a.hosts ||
        String(a.name).localeCompare(String(b.name)),
    )
    .map((req, index) => ({ ...req, step: index + 1 }))

  let cursor = base.networkInt
  const placed = []
  const failures = []

  for (const req of prepared) {
    const networkInt = Math.ceil(cursor / req.blockSize) * req.blockSize
    const broadcastInt = networkInt + req.blockSize - 1

    if (broadcastInt > base.broadcastInt) {
      failures.push({
        ...req,
        reason:
          req.blockSize > base.size
            ? `A /${req.prefix} block is larger than the entire ${base.cidr} space.`
            : `No contiguous /${req.prefix} block remains in ${base.cidr}.`,
      })
      continue
    }

    const firstUsable = networkInt + (req.prefix >= 31 ? 0 : 1)
    const lastUsable = broadcastInt - (req.prefix >= 31 ? 0 : 1)

    placed.push({
      ...req,
      networkInt,
      broadcastInt,
      firstInt: firstUsable,
      lastInt: lastUsable,
      network: intToIp(networkInt),
      broadcast: intToIp(broadcastInt),
      first: intToIp(firstUsable),
      last: intToIp(lastUsable),
      gateway: intToIp(firstUsable),
      mask: maskToString(maskForPrefix(req.prefix)),
      wildcard: maskToString(wildcardForPrefix(req.prefix)),
      cidr: `${intToIp(networkInt)}/${req.prefix}`,
      usable: usableHosts(req.prefix),
      efficiency: Math.min(100, (req.hosts / req.blockSize) * 100),
    })

    cursor = broadcastInt + 1
  }

  const subnets = [...placed].sort((a, b) => a.networkInt - b.networkInt)

  // Find every unallocated gap, including space skipped by alignment.
  const free = []
  let pointer = base.networkInt
  for (const subnet of subnets) {
    if (subnet.networkInt > pointer) {
      free.push({
        startInt: pointer,
        endInt: subnet.networkInt - 1,
        size: subnet.networkInt - pointer,
      })
    }
    pointer = subnet.broadcastInt + 1
  }
  if (pointer <= base.broadcastInt) {
    free.push({
      startInt: pointer,
      endInt: base.broadcastInt,
      size: base.broadcastInt - pointer + 1,
    })
  }
  free.forEach((gap) => {
    gap.start = intToIp(gap.startInt)
    gap.end = intToIp(gap.endInt)
  })

  const allocatedAddresses = subnets.reduce((sum, s) => sum + s.blockSize, 0)
  const requestedHosts = subnets.reduce((sum, s) => sum + s.hosts, 0)
  const totalRequested = prepared.reduce((sum, s) => sum + s.hosts, 0)
  const usableTotal = subnets.reduce((sum, s) => sum + s.usable, 0)
  const freeAddresses = base.size - allocatedAddresses

  const summary = {
    subnetCount: subnets.length,
    failureCount: failures.length,
    requirementCount: prepared.length,
    totalAddresses: base.size,
    allocatedAddresses,
    freeAddresses,
    freeBlocks: free.length,
    requestedHosts,
    totalRequested,
    usableHosts: usableTotal,
    spacePct: (allocatedAddresses / base.size) * 100,
    hostEfficiency: allocatedAddresses ? (requestedHosts / allocatedAddresses) * 100 : 0,
  }

  return { base, subnets, failures, free, summary }
}

/** Plain-text summary for a single subnet row. */
export function subnetToText(subnet) {
  const name = subnet.name?.trim() || `Subnet ${subnet.step}`
  return [
    name,
    `Subnet:    ${subnet.cidr}`,
    `Mask:      ${subnet.mask}`,
    `Wildcard:  ${subnet.wildcard}`,
    `Range:     ${subnet.first} – ${subnet.last}`,
    `Gateway:   ${subnet.gateway}`,
    `Broadcast: ${subnet.broadcast}`,
    `Usable:    ${formatCount(subnet.usable)} hosts (${formatCount(subnet.hosts)} requested)`,
  ].join('\n')
}

/** Full plan as plain text, ready for a ticket or chat message. */
export function planToText(plan) {
  const { base, subnets, failures, summary } = plan
  const lines = [
    `VLSM plan for ${base.cidr}`,
    `${formatCount(summary.totalAddresses)} addresses · ${formatCount(base.usable)} usable in the base block`,
    `Allocated ${formatCount(summary.allocatedAddresses)} addresses across ${summary.subnetCount} subnets`,
    '',
  ]

  for (const subnet of subnets) {
    lines.push(
      `${String(subnet.step).padStart(2, '0')}. ${(subnet.name?.trim() || `Subnet ${subnet.step}`).padEnd(18)} ${subnet.cidr.padEnd(18)} ${subnet.first} – ${subnet.last}  (${formatCount(subnet.usable)} usable)`,
    )
  }

  if (failures.length) {
    lines.push('', 'Unplaced requirements:')
    for (const failure of failures) {
      lines.push(
        `  - ${failure.name?.trim() || 'Unnamed'} (${formatCount(failure.hosts)} hosts, needs /${failure.prefix}): ${failure.reason}`,
      )
    }
  }

  if (summary.freeAddresses > 0) {
    lines.push('', `Free space: ${formatCount(summary.freeAddresses)} addresses in ${summary.freeBlocks} gap(s)`)
  }

  return lines.join('\n')
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

/** Full plan as CSV text. */
export function planToCsv(plan) {
  const header = [
    'Status',
    'Subnet',
    'Required hosts',
    'CIDR',
    'Subnet mask',
    'Wildcard mask',
    'Network',
    'First usable',
    'Last usable',
    'Gateway',
    'Broadcast',
    'Usable hosts',
    'Block size',
    'Efficiency %',
  ]

  const rows = plan.subnets.map((s) => [
    'Allocated',
    s.name?.trim() || `Subnet ${s.step}`,
    s.hosts,
    s.cidr,
    s.mask,
    s.wildcard,
    s.network,
    s.first,
    s.last,
    s.gateway,
    s.broadcast,
    s.usable,
    s.blockSize,
    Math.round(s.efficiency),
  ])

  const failureRows = plan.failures.map((f) => [
    'Unplaced',
    f.name?.trim() || 'Unnamed',
    f.hosts,
    `needs /${f.prefix}`,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    f.blockSize,
    '',
  ])

  return [header, ...rows, ...failureRows].map((row) => row.map(csvCell).join(',')).join('\r\n')
}
