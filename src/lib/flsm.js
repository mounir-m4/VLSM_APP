/**
 * FLSM (Fixed Length Subnet Masking) engine — pure functions, no React.
 *
 * FLSM divides the base network into N equal-sized subnets sharing one mask,
 * unlike VLSM which sizes each subnet independently. Reuses IPv4 utilities
 * from vlsm.js.
 */
import {
	blockSizeForPrefix,
	firstUsableInt,
	hasBroadcast,
	intToIp,
	lastUsableInt,
	maskForPrefix,
	maskToString,
	maskToBinary,
	prefixKind,
	usableHosts,
	wildcardForPrefix,
} from './vlsm.js'

/**
 * Compute the FLSM plan.
 *
 * @param {object} base  Result of parseCidr() (ok: true)
 * @param {number} wantedSubnets  Requested number of equal subnets (>= 1)
 * @param {number} hostsPerSubnet Required usable hosts in each subnet (>= 1)
 * @returns {{ ok, error?, code? } | { ok: true, ...plan }}
 */
export function calculateFlsm(base, wantedSubnets, hostsPerSubnet) {
	const subnetCount = Math.floor(Number(wantedSubnets) || 0)
	const hosts = Math.floor(Number(hostsPerSubnet) || 0)

	if (subnetCount < 1) {
		return {
			ok: false,
			code: 'invalidSubnets',
			error: 'The number of subnets must be a whole number of at least 1.',
		}
	}
	if (hosts < 1) {
		return {
			ok: false,
			code: 'invalidHosts',
			error:
				'The number of hosts per subnet must be a whole number of at least 1.',
		}
	}

	// Subnet bits needed for N subnets.
	const subnetBitsNeeded = Math.ceil(Math.log2(subnetCount))
	const subnetsAvailableByBits = 2 ** subnetBitsNeeded

	// Host bits needed: hosts + network + broadcast (traditional subnetting).
	const requiredAddresses = hosts + 2
	const hostBitsNeeded = Math.ceil(Math.log2(requiredAddresses))

	if (subnetBitsNeeded > 32 - base.prefix) {
		return {
			ok: false,
			code: 'tooManySubnets',
			error: `${subnetCount} subnets do not fit in ${base.cidr} — the base block only contains ${usableHosts(base.prefix)} host bits of space (${base.size} addresses).`,
		}
	}
	// Smallest fixed prefix that satisfies BOTH constraints.
	let newPrefix = -1
	for (let candidate = base.prefix; candidate <= 32; candidate += 1) {
		const slotCount = 2 ** (candidate - base.prefix)
		if (slotCount >= subnetCount && usableHosts(candidate) >= hosts) {
			newPrefix = candidate
			break
		}
	}

	if (newPrefix === -1) {
		return {
			ok: false,
			code: 'prefixTooLong',
			error:
				`${hosts} hosts per subnet and ${subnetCount} subnets cannot both fit in ${base.cidr} ` +
				`with a single fixed mask. Use a larger base network, fewer subnets, or fewer hosts.`,
		}
	}

	const subnetBits = newPrefix - base.prefix
	const hostBits = 32 - newPrefix
	const hostsAvailable = usableHosts(newPrefix)
	const blockSize = blockSizeForPrefix(newPrefix)

	const maskInt = maskForPrefix(newPrefix)
	const wildcardInt = wildcardForPrefix(newPrefix)
	const totalSubnets = 2 ** subnetBits

	const subnets = []
	for (let index = 0; index < totalSubnets; index += 1) {
		const networkInt = base.networkInt + index * blockSize
		const broadcastInt = networkInt + blockSize - 1
		const kind = prefixKind(newPrefix)
		const firstInt = firstUsableInt(networkInt, newPrefix)
		const lastInt = lastUsableInt(networkInt, newPrefix)
		subnets.push({
			index: index + 1,
			name: `Subnet ${index + 1}`,
			kind,
			networkInt,
			broadcastInt,
			firstInt,
			lastInt,
			network: intToIp(networkInt),
			broadcast: hasBroadcast(newPrefix) ? intToIp(broadcastInt) : null,
			hasBroadcast: hasBroadcast(newPrefix),
			first: intToIp(firstInt),
			last: intToIp(lastInt),
			mask: maskToString(maskInt),
			wildcard: maskToString(wildcardInt),
			cidr: `${intToIp(networkInt)}/${newPrefix}`,
			blockSize,
			usable: usableHosts(newPrefix),
			hostBitsAvailable: hostsAvailable,
			requestedHosts: hosts,
		})
	}

	// Unused space: subnets beyond what the user asked for, plus the whole base
	// space is consumed when totalSubnets == 2 ** subnetBits covering base.
	const usedAddresses = totalSubnets * blockSize
	const unusedAddresses = Math.max(0, base.size - usedAddresses)
	const unusedSubnets = totalSubnets - subnetCount

	return {
		ok: true,
		base,
		mode: 'flsm',
		wantedSubnets: subnetCount,
		hostsPerSubnet: hosts,
		prefix: newPrefix,
		subnetBits,
		hostBits,
		subnetMask: maskToString(maskInt),
		subnetMaskBinary: maskToBinary(maskInt),
		wildcard: maskToString(wildcardInt),
		blockSize,
		hostsAvailable,
		subnetsAvailableByBits,
		totalSubnets,
		unusedSubnets,
		subnets,
		summary: {
			subnetCount: totalSubnets,
			requestedSubnets: subnetCount,
			blockSize,
			addressesPerSubnet: blockSize,
			hostsPerSubnetRequested: hosts,
			hostsPerSubnetAvailable: hostsAvailable,
			allocatedAddresses: usedAddresses,
			unusedSubnets,
			unusedAddresses,
			hostEfficiency: blockSize ? (hosts / usableHosts(newPrefix)) * 100 : 0,
			spacePct: (usedAddresses / base.size) * 100,
		},
	}
}

/** FLSM plan as plain text. */
export function flsmToText(flsm) {
	const { base, summary } = flsm
	const lines = [
		`FLSM plan for ${base.cidr}`,
		`${flsm.totalSubnets} equal subnets · /${flsm.prefix} · mask ${flsm.subnetMask}`,
		`Block size: ${summary.blockSize} addresses · ${summary.hostsPerSubnetAvailable} usable hosts each`,
		`Requested: ${summary.requestedSubnets} subnets of ${summary.hostsPerSubnetRequested} hosts`,
		summary.unusedSubnets > 0
			? `Unused: ${summary.unusedSubnets} subnet(s) and ${summary.unusedAddresses} addresses remain`
			: 'All subnets allocated',
		'',
	]
	for (const subnet of flsm.subnets) {
		lines.push(
			`${String(subnet.index).padStart(2, '0')}. ${subnet.cidr.padEnd(20)} ${subnet.first} – ${subnet.last}  (bcast ${subnet.broadcast ?? 'n/a'})`,
		)
	}
	return lines.join('\n')
}

function csvCell(value) {
	return `"${String(value ?? '').replaceAll('"', '""')}"`
}

/** FLSM plan as CSV. */
export function flsmToCsv(flsm) {
	const header = [
		'Subnet',
		'CIDR',
		'Subnet mask',
		'Network',
		'First usable',
		'Last usable',
		'Broadcast',
		'Block size',
		'Usable hosts',
		'Requested hosts',
	]
	const rows = flsm.subnets.map((s) => [
		s.index,
		s.cidr,
		s.mask,
		s.network,
		s.first,
		s.last,
		s.hasBroadcast ? s.broadcast : 'n/a',
		s.blockSize,
		s.usable,
		flsm.hostsPerSubnet,
	])
	return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
}
