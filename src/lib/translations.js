export const translations = {
	en: {
		// Header
		appTitle: 'VLSM Studio',
		appSubtitle: 'Variable Length Subnet Mask planner for IPv4',

		// Theme toggle
		themeLight: 'Light mode',
		themeDark: 'Dark mode',

		// Empty state
		emptyTitle: 'Live planner',
		emptyDescription:
			'Enter a base network and add subnet requirements to see the VLSM allocation.',
		loadPreset: 'Load a scenario',

		// Network form
		sectionFoundation: 'FOUNDATION',
		baseNetwork: 'Base network',
		baseNetworkPlaceholder: 'IPv4 block in CIDR',
		addresses: 'addresses',
		usableHosts: 'usable hosts',
		mask: 'mask',
		options: 'Options',
		allowP2P: 'Allow point-to-point',
		allowP2PDescription: 'Use /31 for 2 hosts, /32 for 1 host (RFC 3021)',

		// Requirements panel
		sectionRequirements: 'REQUIREMENTS',
		subnets: 'Subnets',
		requirementsSubtitle: 'Subnet name and host count',
		hosts: 'Hosts',
		addRequirement: 'Add requirement',
		clearAll: 'Clear all',

		// Presets
		presetBranchOffice: 'Branch office',
		presetCampusCore: 'Campus core',
		presetDataCenter: 'Data center',
		presetWanLinks: 'WAN links',

		// Summary cards
		summary: 'Summary',
		totalAllocated: 'Total allocated',
		freeSpace: 'Free space',
		efficiency: 'Efficiency',
		subnets: 'subnets',
		subnet: 'subnet',

		// Results table
		sectionAllocation: 'ALLOCATION',
		requirement: 'Requirement',
		cidr: 'CIDR',
		netmask: 'Netmask',
		usableRange: 'Usable range',
		gateway: 'Gateway',
		broadcast: 'Broadcast',
		blockSize: 'Block',
		waste: 'Waste',

		// Actions
		copyRow: 'Copy row',
		exportCsv: 'Export CSV',
		copiedToClipboard: 'Copied to clipboard',

		// Address map
		addressSpace: 'Address space',
		free: 'Free',

		// Errors & validation
		invalidCidr: 'Invalid CIDR notation',
		invalidHosts: 'Invalid host count',
		noSpace: 'No space available',
		subnets: 'subnets',

		// Units
		host_one: 'host',
		host_other: 'hosts',
	},

	fr: {
		// Header
		appTitle: 'VLSM Studio',
		appSubtitle:
			'Planificateur de masque de sous-réseau à longueur variable pour IPv4',

		// Theme toggle
		themeLight: 'Mode clair',
		themeDark: 'Mode sombre',

		// Empty state
		emptyTitle: 'Planificateur en direct',
		emptyDescription:
			"Entrez un réseau de base et ajoutez des exigences de sous-réseau pour voir l'allocation VLSM.",
		loadPreset: 'Charger un scénario',

		// Network form
		sectionFoundation: 'FONDATION',
		baseNetwork: 'Réseau de base',
		baseNetworkPlaceholder: 'Bloc IPv4 en notation CIDR',
		addresses: 'adresses',
		usableHosts: 'hôtes utilisables',
		mask: 'masque',
		options: 'Options',
		allowP2P: 'Autoriser point-à-point',
		allowP2PDescription:
			'Utiliser /31 pour 2 hôtes, /32 pour 1 hôte (RFC 3021)',

		// Requirements panel
		sectionRequirements: 'EXIGENCES',
		subnets: 'Sous-réseaux',
		requirementsSubtitle: "Nom du sous-réseau et nombre d'hôtes",
		subnetName: 'Nom du sous-réseau',
		hosts: 'Hôtes',
		addRequirement: 'Ajouter une exigence',
		clearAll: 'Tout effacer',

		// Presets
		presetBranchOffice: 'Succursale',
		presetCampusCore: 'Noyau du campus',
		presetDataCenter: 'Centre de données',
		presetWanLinks: 'Liens WAN',

		// Summary cards
		summary: 'Résumé',
		totalAllocated: 'Total alloué',
		freeSpace: 'Espace libre',
		efficiency: 'Efficacité',
		subnets: 'sous-réseaux',
		subnet: 'sous-réseau',

		// Results table
		sectionAllocation: 'ALLOCATION',
		requirement: 'Exigence',
		cidr: 'CIDR',
		netmask: 'Masque réseau',
		usableRange: 'Plage utilisable',
		gateway: 'Passerelle',
		broadcast: 'Diffusion',
		blockSize: 'Bloc',
		waste: 'Gaspillage',

		// Actions
		copyRow: 'Copier la ligne',
		exportCsv: 'Exporter CSV',
		copiedToClipboard: 'Copié dans le presse-papiers',

		// Address map
		addressSpace: "Espace d'adressage",
		free: 'Libre',

		// Errors & validation
		invalidCidr: 'Notation CIDR invalide',
		invalidHosts: "Nombre d'hôtes invalide",
		noSpace: 'Aucun espace disponible',

		// Units
		host_one: 'hôte',
		host_other: 'hôtes',
	},
}

export const LANGUAGES = [
	{ code: 'en', name: 'English', flag: '🇬🇧' },
	{ code: 'fr', name: 'Français', flag: '🇫🇷' },
]

export function getTranslation(lang, key) {
	return translations[lang]?.[key] || translations.en[key] || key
}
