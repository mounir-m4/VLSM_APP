/**
 * Learning Mode — generates step-by-step explanations for each subnet.
 * Pure data: returns strings/numbers the UI renders. No React.
 */
import {
	blockSizeForPrefix,
	ipToBinary,
	maskForPrefix,
	maskToString,
	usableHosts,
} from './vlsm.js'

function localeCount(lang, value) {
	return Number(value).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')
}

/**
 * Build the learning explanation for one allocated subnet.
 * @param {object} subnet  An allocated subnet from calculatePlan
 * @param {object} options { lang: 'en'|'fr', allowPointToPoint }
 */
export function explainSubnet(
	subnet,
	{ lang = 'en', allowPointToPoint = false } = {},
) {
	const hosts = subnet.hosts
	const count = (v) => localeCount(lang, v)
	const isP2P = Boolean(allowPointToPoint) && subnet.prefix >= 31
	const steps = []

	if (lang === 'fr') {
		steps.push({
			title: 'Exigence',
			body: `${count(hosts)} hôtes demandés pour « ${subnet.name} ».`,
		})
		if (!isP2P) {
			steps.push({
				title: 'Pourquoi ajouter 2 adresses ?',
				body: `En sous-réseau traditionnel, la première adresse identifie le réseau et la dernière est l’adresse de diffusion (broadcast). Il faut donc ${count(hosts)} + 2 = ${count(subnet.hosts + 2)} adresses au total.`,
			})
			const hostBits = 32 - subnet.prefix
			const below = 2 ** (hostBits - 1)
			steps.push({
				title: 'Puissances de deux',
				body:
					hostBits > 0
						? `2^${hostBits - 1} = ${count(below)} ${below >= subnet.hosts + 2 ? 'suffirait' : 'est insuffisant'} · 2^${hostBits} = ${count(blockSizeForPrefix(subnet.prefix))} est suffisant. Bits d’hôte minimum : ${hostBits}.`
						: `Toutes les adresses sont des bits réseau (/32).`,
			})
			steps.push({
				title: 'Préfixe CIDR',
				body: `Bits réseau = 32 − ${hostBits} = ${subnet.prefix}. Résultat : /${subnet.prefix}.`,
			})
		}
		steps.push({
			title: 'Masque de sous-réseau',
			body: `${subnet.mask} — binaire : ${subnet.maskBinary} (${count(subnet.blockSize)} adresses au total).`,
		})
		steps.push({
			title: 'Adresses clés',
			body: `Adresse réseau : ${subnet.network} · Première utilisable : ${subnet.first} · Dernière utilisable : ${subnet.last}${subnet.hasBroadcast ? ` · Diffusion : ${subnet.broadcast}` : ' · Pas d’adresse de diffusion (/31 RFC 3021 ou /32).'}`,
		})
		steps.push({
			title: 'Limite du sous-réseau suivant',
			body: `Taille de bloc = ${count(subnet.blockSize)} adresses. Le sous-réseau suivant commence à ${subnet.broadcastInt + 1 > 4294967295 ? 'fin de l’espace' : `l’adresse ${subnet.networkInt + subnet.blockSize} (${ipToBinary(subnet.network).slice(0, subnet.prefix)}········) alignée sur /${subnet.prefix}.`}`,
		})
		if (isP2P && subnet.prefix === 31) {
			steps.push({
				title: 'Liaison point-à-point (RFC 3021)',
				body: `Un /31 fournit exactement 2 adresses de terminaison (${subnet.first} et ${subnet.last}). La dernière adresse N’EST PAS une adresse de diffusion : les deux extrémités l’utilisent comme adresse d’hôte.`,
			})
		}
		if (subnet.prefix === 32) {
			steps.push({
				title: 'Route d’hôte /32',
				body: `Un /32 identifie UNE seule adresse IPv4 (${subnet.network}). Ce n’est pas un sous-réseau point-à-point conventionnel : aucune passerelle n’est attribuée.`,
			})
		}
		steps.push({
			title: 'Efficacité',
			body: `${count(hosts)} hôtes / ${count(usableHosts(subnet.prefix))} utilisables = ${Math.round(subnet.efficiency)}% d’efficacité. Capacité restante : ${count(subnet.remainingUsable)} hôtes.`,
		})
		return { steps }
	}

	// English
	steps.push({
		title: 'Requirement',
		body: `${count(hosts)} hosts requested for “${subnet.name}”.`,
	})
	if (!isP2P) {
		steps.push({
			title: 'Why add 2 addresses?',
			body: `In a traditional subnet the first address identifies the network itself and the last is the broadcast address, so we need ${count(hosts)} + 2 = ${count(subnet.hosts + 2)} total addresses.`,
		})
		const hostBits = 32 - subnet.prefix
		const below = 2 ** (hostBits - 1)
		steps.push({
			title: 'Powers of two',
			body:
				hostBits > 0
					? `2^${hostBits - 1} = ${count(below)} is ${below >= subnet.hosts + 2 ? 'already enough' : 'not enough'} · 2^${hostBits} = ${count(blockSizeForPrefix(subnet.prefix))} is enough. Minimum host bits: ${hostBits}.`
					: 'Every bit is a network bit (/32).',
		})
		steps.push({
			title: 'CIDR prefix',
			body: `Network bits = 32 − ${hostBits} = ${subnet.prefix}. Result: /${subnet.prefix}.`,
		})
	}
	steps.push({
		title: 'Subnet mask',
		body: `${subnet.mask} — binary: ${subnet.maskBinary} (${count(subnet.blockSize)} total addresses).`,
	})
	steps.push({
		title: 'Key addresses',
		body: `Network: ${subnet.network} · First usable: ${subnet.first} · Last usable: ${subnet.last}${subnet.hasBroadcast ? ` · Broadcast: ${subnet.broadcast}` : ' · No broadcast address (/31 RFC 3021 or /32).'}`,
	})
	steps.push({
		title: 'Next subnet boundary',
		body: `Block size = ${count(subnet.blockSize)} addresses. The next subnet starts at address ${subnet.networkInt + subnet.blockSize}, aligned to its own /${subnet.prefix} boundary.`,
	})
	if (subnet.prefix === 31) {
		steps.push({
			title: 'Point-to-point link (RFC 3021)',
			body: `A /31 provides exactly 2 endpoint addresses (${subnet.first} and ${subnet.last}). The last address is NOT a broadcast address — both endpoints use it as a host address.`,
		})
	}
	if (subnet.prefix === 32) {
		steps.push({
			title: 'Host route /32',
			body: `A /32 identifies ONE single IPv4 address (${subnet.network}). It is not a conventional point-to-point subnet, and no gateway is assigned.`,
		})
	}
	steps.push({
		title: 'Efficiency',
		body: `${count(hosts)} hosts / ${count(usableHosts(subnet.prefix))} usable = ${Math.round(subnet.efficiency)}% host efficiency. Remaining capacity: ${count(subnet.remainingUsable)} hosts.`,
	})
	return { steps }
}

/** Worked example matching the classic 100-hosts → /25 derivation. */
export function workedExample(hosts = 100, lang = 'en') {
	const required = hosts + 2
	let bits = 0
	while (2 ** bits < required) bits += 1
	const prefix = 32 - bits
	const mask = maskToString(maskForPrefix(prefix))
	if (lang === 'fr') {
		return `${hosts} + 2 = ${required} adresses requises. 2^${bits - 1} = ${2 ** (bits - 1)} (insuffisant). 2^${bits} = ${2 ** bits} (suffisant). Bits d’hôte = ${bits}. Bits réseau = 32 − ${bits} = ${prefix}. Résultat : /${prefix}. Masque : ${mask}. Hôtes utilisables : ${usableHosts(prefix)}.`
	}
	return `${hosts} + 2 = ${required} addresses required. 2^${bits - 1} = ${2 ** (bits - 1)} (insufficient). 2^${bits} = ${2 ** bits} (sufficient). Host bits = ${bits}. Network bits = 32 − ${bits} = ${prefix}. Result: /${prefix}. Mask: ${mask}. Usable hosts: ${usableHosts(prefix)}.`
}
