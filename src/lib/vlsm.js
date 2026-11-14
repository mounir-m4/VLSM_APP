/**
 * Core IPv4 / VLSM math — pure functions, no React dependencies.
 *
 * IPv4 addresses are handled as unsigned integers (0 .. 2^32 - 1) using
 * arithmetic where possible so we never overflow into negative numbers.
 *
 * Semantics by prefix:
 *  - traditional (default): network + broadcast reserved, usable = size - 2.
 *  - /31 (RFC 3021, point-to-point only): BOTH addresses are usable endpoints;
 *    there is no broadcast address on a /31 link.
 *  - /32: a single host address (host route / loopback); never a gateway.
 */

export const MAX_HOSTS = 4294967294

/** Parse a dotted-quad IPv4 string into an unsigned 32-bit integer, or null. */
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

/** Mask rendered in binary, four dotted octets (e.g. "11111111.11111111.11111111.10000000"). */
export function maskToBinary(mask) {
  return maskToString(mask)
    .split('.')
    .map((octet) => String(Number(octet).toString(2)).padStart(8, '0'))
    .join('.')
}

/** Binary rendering of an IPv4 address (for Learning Mode). */
export function ipToBinary(ip) {
  return String(ip)
    .split('.')
    .map((octet) => String(Number(octet).toString(2)).padStart(8, '0'))
    .join('.')
}

/** Total addresses in a subnet of the given prefix length. */
export function blockSizeForPrefix(prefix) {
  if (prefix >= 32) return 1
  return 2 ** (32 - prefix)
}

/**
 * Usable host addresses for a prefix.
 *  - traditional: size - 2 (network + broadcast reserved)
 *  - /31: 2 (RFC 3021 — both endpoints usable, no network/broadcast)
 *  - /32: 1 (a single host address)
 */
export function usableHosts(prefix) {
  if (prefix >= 32) return 1
  if (prefix === 31) return 2
  return 2 ** (32 - prefix) - 2
}

/**
 * Does this prefix have a conventional broadcast address?
 * Only traditional (non point-to-point) prefixes do; /31 and /32 do not.
 */
export function hasBroadcast(prefix) {
  return prefix < 31
}

/** First usable host address in a subnet, as an integer. */
export function firstUsableInt(networkInt, prefix) {
  if (prefix >= 31) return networkInt
  return networkInt + 1
}

/** Last usable host address in a subnet, as an integer (networkInt for /32). */
export function lastUsableInt(networkInt, prefix) {
  const size = blockSizeForPrefix(prefix)
  if (prefix >= 31) return networkInt + size - 1
  return networkInt + size - 2
}

/**
 * Is `prefix` only valid in point-to-point mode? (/31 and /32 are RFC 3021 /
 * host-route prefixes and require the point-to-point flag to be allocated.)
 */
export function isPointToPointPrefix(prefix) {
  return prefix >= 31
}

/** How the prefix should be described in UI/exports. */
export function prefixKind(prefix) {
  if (prefix >= 32) return 'host' // single address, host route
  if (prefix === 31) return 'p2p' // RFC 3021 point-to-point link
  return 'lan' // traditional subnet
}

/**
 * Smallest prefix that holds `hosts` hosts.
 * Classic VLSM reserves network + broadcast, so 1 host needs a /30.
 * With point-to-point mode enabled, 2-host links use /31 and 1-host links /32.
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

/**
 * Minimum host bits required to fit `hosts` hosts (traditional mode: hosts+2).
 * Returns an object so Learning Mode can show the powers-of-two reasoning.
 */
export function hostBitsFor(hosts, allowPointToPoint = false) {
  const value = Math.max(1, Math.floor(Number(hosts) || 0))
  if (allowPointToPoint && value <= 2) {
    return { hostBits: 32 - hostsToPrefix(value, true), requiredAddresses: value }
  }
  const required = value + 2
  const hostBits = Math.min(32, Math.ceil(Math.log2(required)))
  return { hostBits, requiredAddresses: required }
}

/**
 * Parse "10.0.0.0/16" (prefix optional, defaults to /24) and normalize it.
 * Returns { ok:false, error } on failure — never silently coerces bad input.
 */
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

  const size = blockSizeForPrefix(prefix)
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

/**
 * Strict host-count validation. Accepts a string or number and returns
 * a validated positive integer, or a specific reason for rejection.
 * This is the centralized rule — UI and engine both use it.
 */
export function parseHostCount(value, max = MAX_HOSTS) {
  const raw = String(value ?? '').trim()
  if (raw === '') return { ok: false, reason: 'empty' }
  // Reject "12.0", "1e3", "0x2", " 12 " is trimmed, "-3", "+4" style input.
  if (!/^\d+$/.test(raw)) return { ok: false, reason: 'format' }
  const n = Number(raw)
  if (!Number.isSafeInteger(n)) return { ok: false, reason: 'tooLarge' }
  if (n < 1) return { ok: false, reason: 'zero' }
  if (n > max) return { ok: false, reason: 'tooLarge' }
  return { ok: true, hosts: n }
}

/** Validate a whole requirements list; returns per-row results. */
export function validateRequirements(rows, max = MAX_HOSTS) {
  return rows.map((row) => {
    const result = parseHostCount(row.hosts, max)
    return { id: row.id, ...result, hosts: result.ok ? result.hosts : null }
  })
}

/**
 * Human-readable failure reason codes for allocation:
 *  - 'tooLarge'  : the required block exceeds the base network size
 *  - 'noContiguous': no aligned block of that size remains
 */
function failureReasonFor(blockSize, base, prefix) {
  if (blockSize > base.size) {
    return {
      code: 'tooLarge',
      reason: `A /${prefix} block needs ${blockSize} addresses — more than the entire ${base.cidr} space (${base.size}).`,
    }
  }
  return {
    code: 'noContiguous',
    reason: `No contiguous /${prefix} block remains in ${base.cidr} — ${blockSize} aligned addresses are required.`,
  }
}

/** Human-friendly integer formatting. */
export function formatCount(value) {
  return Number(value).toLocaleString('en-US')
}

/**
 * Build a complete VLSM allocation.
 *
 * @param {object} base     Result of parseCidr() (ok: true)
 * @param {Array}  requirements [{ id, name, hosts, color }] — hosts must be pre-validated integers
 * @param {object} options { allowPointToPoint, gatewayMode: 'first'|'last'|'none' }
 *
 * Deterministic: same input → same output (largest-first, ties by hosts then name).
 */
export function calculatePlan(base, requirements, options = {}) {
  const allowP2P = Boolean(options.allowPointToPoint)
  const gatewayMode = options.gatewayMode === 'last' || options.gatewayMode === 'none'
    ? options.gatewayMode
    : 'first'

  const prepared = requirements
    .map((req) => {
      const hosts = Math.max(1, Math.floor(Number(req.hosts) || 0))
      const prefix = hostsToPrefix(hosts, allowP2P)
      const blockSize = blockSizeForPrefix(prefix)
      return { ...req, hosts, prefix, blockSize, originalOrder: req.order ?? 0 }
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
    // Align the cursor UP to the next valid block boundary for this prefix.
    const networkInt = Math.ceil(cursor / req.blockSize) * req.blockSize
    const broadcastInt = networkInt + req.blockSize - 1

    if (broadcastInt > base.broadcastInt) {
      const { code, reason } = failureReasonFor(req.blockSize, base, req.prefix)
      failures.push({ ...req, code, reason })
      continue // failed allocation must not disturb the cursor or later subnets
    }

    const kind = prefixKind(req.prefix)
    const firstInt = firstUsableInt(networkInt, req.prefix)
    const lastInt = lastUsableInt(networkInt, req.prefix)
    const usable = usableHosts(req.prefix)

    // Gateway: only traditional subnets get an automatic gateway, and it must
    // fall inside the usable range. /32 host routes never get a gateway.
    let gateway = null
    if (kind === 'lan' && gatewayMode !== 'none') {
      const candidate = gatewayMode === 'last' ? lastInt : firstInt
      if (candidate >= firstInt && candidate <= lastInt) gateway = intToIp(candidate)
    }

    placed.push({
      ...req,
      kind,
      networkInt,
      broadcastInt,
      firstInt,
      lastInt,
      network: intToIp(networkInt),
      broadcast: kind === 'lan' ? intToIp(broadcastInt) : null,
      hasBroadcast: kind === 'lan',
      first: intToIp(firstInt),
      last: intToIp(lastInt),
      gateway,
      mask: maskToString(maskForPrefix(req.prefix)),
      maskBinary: maskToBinary(maskForPrefix(req.prefix)),
      wildcard: maskToString(wildcardForPrefix(req.prefix)),
      cidr: `${intToIp(networkInt)}/${req.prefix}`,
      usable,
      blockSize: req.blockSize,
      // Host efficiency: requested hosts vs usable capacity of this prefix.
      efficiency: Math.min(100, (req.hosts / usable) * 100),
      remainingUsable: usable - req.hosts,
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
    // Address-space utilization: allocated block addresses / base network size.
    spacePct: (allocatedAddresses / base.size) * 100,
    // Host efficiency: requested hosts / usable capacity across subnets.
    hostEfficiency: usableTotal ? (requestedHosts / usableTotal) * 100 : 0,
    remainingUsableCapacity: usableTotal - requestedHosts,
  }

  return { base, subnets, failures, free, summary, options: { gatewayMode, allowPointToPoint: allowP2P } }
}

/** Plain-text summary for a single subnet row. */
export function subnetToText(subnet) {
  const name = subnet.name?.trim() || `Subnet ${subnet.step}`
  const lines = [
    name,
    `Subnet:    ${subnet.cidr}`,
    `Mask:      ${subnet.mask}`,
    `Wildcard:  ${subnet.wildcard}`,
    `Range:     ${subnet.first} – ${subnet.last}`,
  ]
  if (subnet.gateway) lines.push(`Gateway:   ${subnet.gateway}`)
  if (subnet.hasBroadcast) lines.push(`Broadcast: ${subnet.broadcast}`)
  else if (subnet.kind === 'p2p') lines.push('Note:      RFC 3021 point-to-point — no broadcast address')
  else lines.push('Note:      host route — single address')
  lines.push(`Usable:    ${formatCount(subnet.usable)} hosts (${formatCount(subnet.hosts)} requested)`)
  return lines.join('\n')
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
    lines.push(
      '',
      `Free space: ${formatCount(summary.freeAddresses)} addresses in ${summary.freeBlocks} gap(s)`,
    )
    for (const gap of plan.free) {
      lines.push(`  - ${gap.start} – ${gap.end} (${formatCount(gap.size)} addresses)`)
    }
  }

  lines.push(
    `Host efficiency: ${Math.round(summary.hostEfficiency)}% · Address-space utilization: ${Math.round(summary.spacePct)}%`,
  )

  return lines.join('\n')
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

/** Full plan as CSV text (CRLF, quoted cells, BOM added by caller). */
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
    'Remaining usable',
    'Host efficiency %',
    'Kind',
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
    s.gateway ?? '',
    s.hasBroadcast ? s.broadcast : 'n/a',
    s.usable,
    s.blockSize,
    s.remainingUsable,
    s.efficiency.toFixed(1),
    s.kind,
  ])

  const failureRows = plan.failures.map((f) => [
    'Unplaced',
    f.name?.trim() || 'Unnamed',
    f.hosts,
    `needs /${f.prefix}`,
    '', '', '', '', '', '', '', '',
    f.blockSize,
    '', '',
    f.code,
  ])

  const summaryRows = [
    [],
    ['Summary'],
    ['Base network', plan.base.cidr],
    ['Total addresses', plan.base.size],
    ['Allocated addresses', plan.summary.allocatedAddresses],
    ['Free addresses', plan.summary.freeAddresses],
    ['Requested hosts', plan.summary.requestedHosts],
    ['Usable host capacity', plan.summary.usableHosts],
    ['Remaining usable capacity', plan.summary.remainingUsableCapacity],
    ['Host efficiency %', plan.summary.hostEfficiency.toFixed(1)],
    ['Address-space utilization %', plan.summary.spacePct.toFixed(1)],
  ]

  return [header, ...rows, ...failureRows, ...summaryRows]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n')
}
