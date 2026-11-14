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
		hostBitsCleared: 'Host bits cleared',
		noPrefixSupplied: 'No prefix supplied',
		assumed: 'assumed',
		noPrefixAssumed: 'No prefix? /24 is assumed. The block is normalized to its network address.',
		chooseScenario: 'Choose a scenario…',
		startFromExample: 'Start from an example',
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
		subnetStep: 'Subnet',
		noRequirements: 'No subnet requirements yet.',
		noRequirementsHint: 'Add one below to start allocating.',
		requirementsCount: 'requirements',
		requirementSingle: 'requirement',
		hostsRequested: 'hosts requested',
		blocksSortedNote: 'Blocks are sized automatically and sorted largest-first.',
		removeSubnet: 'Remove subnet',
		nameForSubnet: 'Name for subnet',
		requiredHostsFor: 'Required hosts for subnet',
		enterHostCount: 'Enter a host count',
		addressesBlock: 'addresses',
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
		baseNeedsAttention: 'Base network needs attention',
		tryPrefix: 'Try',
		orLoadScenario: 'or load a scenario from the sidebar.',
		invalidHostCounts: 'Some host counts aren’t usable.',
		invalidHostCountsDetail: 'Enter a whole number from 1 to',
		invalidRowsSkipped: 'Invalid rows are skipped in the plan.',
		couldNotPlace: 'couldn’t be placed.',
		ranOutOfSpace: 'ran out of contiguous space. Enlarge the base block or lower the host counts — the details are listed under the allocation table.',
		couldNotPlaceReq: 'Couldn’t place',
		unnamedSubnet: 'Unnamed subnet',
		noSubnetFound: 'No subnet found a home in this base network.',
		copySubnetDetails: 'Copy subnet details',
		footerNote: 'Every request is rounded up to the nearest power-of-two block, sorted largest first, and aligned to its own boundary. Smaller blocks then fill the gaps. Point-to-point mode enables /31 links and /32 loopbacks (RFC 3021).',
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
		hostBitsCleared: 'Bits d\'hôte effacés',
		noPrefixSupplied: 'Aucun préfixe fourni',
		assumed: 'supposé',
		noPrefixAssumed: 'Pas de préfixe ? /24 est supposé. Le bloc est normalisé à son adresse réseau.',
		chooseScenario: 'Choisir un scénario…',
		startFromExample: 'Commencer avec un exemple',
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
		subnetStep: 'Sous-réseau',
		noRequirements: 'Aucune exigence de sous-réseau pour le moment.',
		noRequirementsHint: 'Ajoutez-en une ci-dessous pour commencer l\'allocation.',
		requirementsCount: 'exigences',
		requirementSingle: 'exigence',
		hostsRequested: 'hôtes demandés',
		blocksSortedNote: 'Les blocs sont dimensionnés automatiquement et triés du plus grand au plus petit.',
		removeSubnet: 'Supprimer le sous-réseau',
		nameForSubnet: 'Nom du sous-réseau',
		requiredHostsFor: 'Hôtes requis pour le sous-réseau',
		enterHostCount: 'Entrez un nombre d\'hôtes',
		addressesBlock: 'adresses',
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
		baseNeedsAttention: 'Le réseau de base nécessite votre attention',
		tryPrefix: 'Essayez',
		orLoadScenario: 'ou chargez un scénario depuis la barre latérale.',
		invalidHostCounts: "Certains nombres d'hôtes ne sont pas utilisables.",
		invalidHostCountsDetail: 'Entrez un nombre entier de 1 à',
		invalidRowsSkipped: 'Les lignes invalides sont ignorées dans le plan.',
		couldNotPlace: "n'ont pas pu être placés.",
		ranOutOfSpace: "a manqué d'espace contigu. Agrandissez le bloc de base ou réduisez les nombres d'hôtes — les détails sont listés sous le tableau d'allocation.",
		couldNotPlaceReq: 'Impossible de placer',
		unnamedSubnet: 'Sous-réseau sans nom',
		noSubnetFound: "Aucun sous-réseau n'a trouvé de place dans ce réseau de base.",
		copySubnetDetails: 'Copier les détails du sous-réseau',
		footerNote: "Chaque demande est arrondie au bloc puissance de deux le plus proche, triée du plus grand au plus petit et alignée sur sa propre limite. Les blocs plus petits remplissent ensuite les espaces. Le mode point-à-point active les liens /31 et les boucles /32 (RFC 3021).",

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
